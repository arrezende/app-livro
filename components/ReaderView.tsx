import React, { useState, useEffect, useRef, useCallback } from 'react'
import ePub from 'epubjs'
import {
  Book as BookType,
  Rendition as RenditionType,
  TocItem,
  Theme,
  AIResponseState,
} from '../types'
import { Controls, themes } from './Controls'
import { Sidebar } from './Sidebar'
import { Icons } from './Icon'
import { AIModal } from './AIModal'
import { CharacterCard } from './CharacterCard'
import { SelectionMenu } from './SelectionMenu'
import {
  generateRecap,
  analyzeSelection,
  identifyCharacter,
  detectBookGenre,
} from '../services/geminiService'
import { generateSpeech, BookGenre } from '../services/elevenLabsService'

interface ReaderViewProps {
  bookData: ArrayBuffer
  bookId: string
  initialCfi: string | null
  onBack: () => void
  onProgressUpdate: (id: string, cfi: string, percent: number) => void
  showToast: (msg: string, type: 'info' | 'error' | 'success') => void
}

interface SelectionState {
  visible: boolean
  x: number
  y: number
  height: number
  text: string
  cfiRange: string
}

export const ReaderView: React.FC<ReaderViewProps> = ({
  bookData,
  bookId,
  initialCfi,
  onBack,
  onProgressUpdate,
  showToast,
}) => {
  const [book, setBook] = useState<BookType | null>(null)
  const [rendition, setRendition] = useState<RenditionType | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const [currentChapterLabel, setCurrentChapterLabel] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [metadata, setMetadata] = useState<any>(null)
  const [bookGenre, setBookGenre] = useState<BookGenre | null>(null)
  const [locationsReady, setLocationsReady] = useState(false)

  // UI State
  const [showUI, setShowUI] = useState(true)

  // Preferences
  const [theme, setTheme] = useState<Theme>(() => {
    try {
      const savedThemeName = localStorage.getItem('lumina_theme')
      if (savedThemeName)
        return themes.find((t) => t.name === savedThemeName) || themes[0]
    } catch (e) {}
    return themes[0]
  })

  const [fontSize, setFontSize] = useState<number>(() => {
    try {
      const savedSize = localStorage.getItem('lumina_font_size')
      if (savedSize) return parseInt(savedSize, 10)
    } catch (e) {}
    return 100
  })

  // AI & Selection States
  const [selection, setSelection] = useState<SelectionState>({
    visible: false,
    x: 0,
    y: 0,
    height: 0,
    text: '',
    cfiRange: '',
  })
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiState, setAiState] = useState<AIResponseState>({
    loading: false,
    content: null,
    error: null,
  })
  const [aiModalTitle, setAiModalTitle] = useState('Lumina AI Insights')

  // Audio State
  const [audioState, setAudioState] = useState<{
    loading: boolean
    url: string | null
    error: string | null
  }>({
    loading: false,
    url: null,
    error: null,
  })

  const [isCharacterCardOpen, setIsCharacterCardOpen] = useState(false)
  const [characterName, setCharacterName] = useState('')
  const [characterAiState, setCharacterAiState] = useState<AIResponseState>({
    loading: false,
    content: null,
    error: null,
  })

  // Refs
  const viewerRef = useRef<HTMLDivElement>(null)
  const isLocationRestored = useRef(false)
  const saveTimeout = useRef<any>(null)

  // Save preferences
  useEffect(() => {
    localStorage.setItem('lumina_theme', theme.name)
  }, [theme])
  useEffect(() => {
    localStorage.setItem('lumina_font_size', fontSize.toString())
  }, [fontSize])

  // INITIALIZATION
  useEffect(() => {
    let mounted = true

    // Create Book
    const newBook = ePub(bookData)
    setBook(newBook as unknown as BookType)

    if (viewerRef.current) {
      const element = viewerRef.current
      element.innerHTML = ''

      const newRendition = newBook.renderTo(element, {
        width: '100%',
        height: '100%',
        flow: 'paginated',
        manager: 'default',
      }) as unknown as RenditionType
      setRendition(newRendition as unknown as RenditionType)

      isLocationRestored.current = false

      // Init logic
      newBook.loaded.metadata
        .then((meta) => {
          if (!mounted) return
          setMetadata(meta)
          document.title = `${meta.title} - Lumina Reader`

          const displayPromise = initialCfi
            ? newRendition.display(initialCfi)
            : newRendition.display()

          displayPromise.then(() => {
            if (initialCfi)
              showToast('Continuando de onde você parou', 'success')
            // Grace period
            setTimeout(() => {
              if (mounted) isLocationRestored.current = true
            }, 1500)
          })
        })
        .then(() => {
          if (mounted) setIsReady(true)
        })

      // Geração de Localizações (Para Porcentagem Precisa)
      newBook.ready
        .then(() => {
          // Gera localizações baseadas em 1600 caracteres por "página"
          return (newBook as any).locations.generate(1600)
        })
        .then(() => {
          if (mounted) {
            setLocationsReady(true)
            console.log('Localizações calculadas com sucesso.')

            // Se já carregamos mas as locs não estavam prontas, força um update agora
            const currentLoc = newRendition.currentLocation()
            if (currentLoc && currentLoc.start) {
              const percent = (newBook as any).locations.percentageFromCfi(
                currentLoc.start.cfi,
              )
              onProgressUpdate(bookId, currentLoc.start.cfi, percent * 100)
            }
          }
        })

      // Navigation
      newBook.loaded.navigation.then((nav) => {
        if (mounted) setToc(nav.toc)
      })

      // Events
      // @ts-ignore
      if (newBook.rendition && newBook.rendition.hooks) {
        // @ts-ignore
        newBook.rendition.hooks.content.register((contents) => {
          const body = contents.document.body
          contents.document.addEventListener('contextmenu', (e: Event) =>
            e.preventDefault(),
          )

          // Gestures
          let touchStartX = 0
          let touchStartY = 0
          body.addEventListener(
            'touchstart',
            (e: TouchEvent) => {
              touchStartX = e.changedTouches[0].screenX
              touchStartY = e.changedTouches[0].screenY
            },
            { passive: true },
          )

          body.addEventListener(
            'touchend',
            (e: TouchEvent) => {
              const diffX = touchStartX - e.changedTouches[0].screenX
              const diffY = touchStartY - e.changedTouches[0].screenY
              if (Math.abs(diffY) > Math.abs(diffX)) return
              if (Math.abs(diffX) > 50) {
                diffX > 0 ? newRendition.next() : newRendition.prev()
              }
            },
            { passive: true },
          )
        })
      }

      newRendition.on('selected', (cfiRange: string, contents: any) => {
        setShowUI(true)
        const range = newRendition.getRange(cfiRange)
        if (!range) return

        const text = range.toString()
        if (!text.trim()) return

        const rect = range.getBoundingClientRect()
        const iframe = viewerRef.current?.querySelector('iframe')

        let x = rect.left + rect.width / 2
        let y = rect.top
        if (iframe) {
          const iframeRect = iframe.getBoundingClientRect()
          x += iframeRect.left
          y += iframeRect.top
        }

        setTimeout(() => {
          setSelection({
            visible: true,
            x,
            y,
            height: rect.height,
            text,
            cfiRange,
          })
        }, 250)
      })

      newRendition.on('click', () => {
        setSelection((prev) => ({ ...prev, visible: false }))
        setShowUI((prev) => !prev)
      })

      newRendition.on('relocated', (location: any) => {
        setSelection({
          visible: false,
          x: 0,
          y: 0,
          height: 0,
          text: '',
          cfiRange: '',
        })
        setIsCharacterCardOpen(false)

        // Atualiza o label do capítulo atual
        if (location.start?.href) {
          const chapter = (newBook as any).navigation.get(location.start.href)
          if (chapter) setCurrentChapterLabel(chapter.label)
        }

        if (!isLocationRestored.current) return
        if (saveTimeout.current) clearTimeout(saveTimeout.current)

        saveTimeout.current = setTimeout(() => {
          if (location.start?.cfi) {
            // @ts-ignore
            let percent = 0
            try {
              if (
                (newBook as any).locations &&
                (newBook as any).locations.length() > 0
              ) {
                percent = (newBook as any).locations.percentageFromCfi(
                  location.start.cfi,
                )
              }
            } catch (e) {
              console.warn('Erro ao calcular porcentagem:', e)
            }

            onProgressUpdate(bookId, location.start.cfi, percent * 100)
          }
        }, 500)
      })
    }

    return () => {
      mounted = false
      if (newBook) newBook.destroy()
      if (viewerRef.current) viewerRef.current.innerHTML = ''
    }
  }, [bookData, bookId])

  // Apply Theme & Custom Styles
  useEffect(() => {
    if (rendition) {
      rendition.themes.register(theme.name, {
        // Estilos Base
        body: {
          color: theme.fg,
          background: theme.bg,
          '-webkit-tap-highlight-color': 'transparent',
          'font-family': 'Helvetica, Arial, sans-serif !important', // Exemplo: Forçar fonte
          'padding-top': 'var(--rn-padding-top, 0px) !important',
          'padding-bottom': 'var(--rn-padding-bottom, 0px) !important',
        },
        'body *': {
          'margin-left': '0 !important',
          'margin-right': '0 !important',
          'background-color': 'transparent !important',
        },
        '::selection': { background: 'rgba(255, 255, 0, 0.3)' },

        // Tags comuns
        p: {
          color: theme.fg,
          'font-size': '1.1em !important',
          'line-height': '1.6 !important',
        },
        h1: { color: theme.fg },
        h2: { color: theme.fg },
        h3: { color: theme.fg },
        span: { color: theme.fg },
        div: { color: theme.fg },
        a: { color: theme.name === 'dark' ? '#63b3ed' : '#3182ce' },

        // Overrides Úteis
        img: {
          'max-width': '100%', // Evita que imagens estourem a tela
          height: 'auto',
        },
      })

      rendition.themes.select(theme.name)
      rendition.themes.fontSize(`${fontSize}%`)
      if (viewerRef.current) viewerRef.current.style.backgroundColor = theme.bg
    }
  }, [rendition, theme, fontSize])

  // Receive padding values from external app (postMessage)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let raw = event.data
        // Some platforms wrap data inside another `data` prop
        if (raw && typeof raw === 'object' && raw.data) raw = raw.data

        const payload = typeof raw === 'string' ? JSON.parse(raw) : raw
        if (!payload || payload.type !== 'RN_SET_PADDINGS') return

        const { paddingTop, paddingBottom } = payload.payload || {}
        const targetSelector =
          '#root > div > div.flex-1.relative.w-full.h-full.flex.items-center.justify-center.overflow-hidden'
        const target = document.querySelector(
          targetSelector,
        ) as HTMLElement | null

        if (typeof paddingTop === 'number') {
          document.documentElement.style.setProperty(
            '--rn-padding-top',
            `${paddingTop}px`,
          )
          if (target) {
            target.style.setProperty('--rn-padding-top', `${paddingTop}px`)
            target.style.paddingTop = `${paddingTop}px`
          } else if (document && document.body) {
            document.body.style.paddingTop = `${paddingTop}px`
          }
        }
        if (typeof paddingBottom === 'number') {
          document.documentElement.style.setProperty(
            '--rn-padding-bottom',
            `${paddingBottom}px`,
          )
          if (target) {
            target.style.setProperty(
              '--rn-padding-bottom',
              `${paddingBottom}px`,
            )
            target.style.paddingBottom = `${paddingBottom}px`
          } else if (document && document.body) {
            document.body.style.paddingBottom = `${paddingBottom}px`
          }
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Navigation
  const handleNext = useCallback(() => rendition?.next(), [rendition])
  const handlePrev = useCallback(() => rendition?.prev(), [rendition])

  // Helpers
  const getTextFromSpineItem = async (href: string) => {
    try {
      // @ts-ignore
      const doc = await book?.load(href)
      return doc?.body?.textContent || ''
    } catch {
      return ''
    }
  }
  const normalizeText = (t: string) => t.replace(/\s+/g, ' ').trim()

  // ACTIONS
  const handleSelectionAction = async (
    action: 'explain' | 'summarize' | 'recap' | 'identify',
  ) => {
    if (!selection.text) return
    setSelection((prev) => ({ ...prev, visible: false }))

    if (action === 'identify') {
      const name = selection.text.trim()
      if (name.split(' ').length > 5) {
        showToast('Selecione apenas o nome do personagem.', 'info')
        return
      }
      setCharacterName(name)
      setIsCharacterCardOpen(true)
      setCharacterAiState({ loading: true, content: null, error: null })
      try {
        const result = await identifyCharacter(
          name,
          metadata?.title || '',
          metadata?.creator || '',
        )
        setCharacterAiState({ loading: false, content: result, error: null })
      } catch {
        setCharacterAiState({
          loading: false,
          content: null,
          error: 'Erro ao identificar.',
        })
      }
      return
    }

    if (action === 'recap') {
      handleSmartRecap()
      return
    }

    setAiModalTitle(action === 'explain' ? 'Explicação' : 'Resumo')
    setIsAIModalOpen(true)
    setAiState({ loading: true, content: null, error: null })
    // Reset audio state when opening new modal
    setAudioState({ loading: false, url: null, error: null })

    try {
      const result = await analyzeSelection(selection.text, action)
      setAiState({ loading: false, content: result, error: null })
    } catch {
      setAiState({ loading: false, content: null, error: 'Erro ao processar.' })
    }
  }

  const handleSmartRecap = async () => {
    if (!selection.text) {
      showToast('Selecione o último trecho lido.', 'info')
      return
    }
    setAiModalTitle('O que aconteceu até agora')
    setIsAIModalOpen(true)
    setAiState({ loading: true, content: null, error: null })
    setAudioState({ loading: false, url: null, error: null })

    try {
      if (!selection.cfiRange) throw new Error()
      const spineItem = book?.spine.get(selection.cfiRange)
      if (!spineItem) throw new Error()

      const rawText = await getTextFromSpineItem(spineItem.href)
      const full = normalizeText(rawText)
      const sel = normalizeText(selection.text)

      let idx = full.indexOf(sel)
      if (idx === -1) idx = full.indexOf(sel.substring(0, 20)) // fallback
      if (idx === -1) throw new Error()

      let relevant = full.substring(0, idx + sel.length)
      if (relevant.length < 500 && spineItem.index > 0) {
        const prev = book?.spine.get(spineItem.index - 1)
        if (prev) {
          const prevText = await getTextFromSpineItem(prev.href)
          relevant = normalizeText(prevText) + '\n\n' + relevant
        }
      }

      const final = relevant.split(' ').slice(-3000).join(' ')
      const result = await generateRecap(metadata?.title || 'o livro', final)
      setAiState({ loading: false, content: result, error: null })
    } catch (e) {
      setAiState({
        loading: false,
        content: null,
        error: 'Erro ao gerar resumo.',
      })
    }
  }

  const handleGenerateAudio = async () => {
    if (!aiState.content) return

    setAudioState({ loading: true, url: null, error: null })
    try {
      // 1. Detect Genre if not already detected
      let genre = bookGenre
      if (!genre) {
        const snippet = selection.text || aiState.content // Use selection or the summary itself for genre detection
        genre = await detectBookGenre(
          metadata?.title || '',
          metadata?.creator || '',
          snippet,
        )
        setBookGenre(genre)
      }

      // 2. Generate Audio via ElevenLabs
      const url = await generateSpeech(aiState.content, genre)
      setAudioState({ loading: false, url, error: null })
    } catch (e: any) {
      setAudioState({
        loading: false,
        url: null,
        error: e.message || 'Erro ao gerar áudio',
      })
    }
  }

  return (
    <div
      className="h-[100dvh] w-screen overflow-x-hidden flex flex-col transition-colors duration-500"
      style={{ backgroundColor: theme.bg }}
    >
      <Sidebar
        toc={toc}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectChapter={(href) => rendition?.display(href)}
        currentTheme={theme}
      />

      <SelectionMenu
        visible={selection.visible}
        position={selection}
        onAction={handleSelectionAction}
        onClose={() => setSelection((prev) => ({ ...prev, visible: false }))}
      />
      {/* Progress Floating Info */}
      {/* {!locationsReady && isReady && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-black/60 text-white px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-widest backdrop-blur-md animate-pulse">
          Calculando localizações...
        </div>
      )} */}

      {/* Header */}
      <div
        className={`absolute top-0 left-0 p-4 z-40 transition-transform duration-300 ${
          showUI ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 transition-colors backdrop-blur-md"
        >
          <Icons.ChevronLeft size={20} />
        </button>
      </div>

      <div className="flex-1 relative w-full h-full flex items-center justify-center overflow-hidden">
        <div
          ref={viewerRef}
          className="w-full h-full"
          style={{
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />
        {!isReady && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center z-10"
            style={{ backgroundColor: theme.bg }}
          >
            <Icons.Loader
              className="animate-spin text-blue-500 mb-4"
              size={48}
            />
            <p
              className={`text-sm font-medium animate-pulse ${
                theme.name === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Preparando páginas...
            </p>
          </div>
        )}
      </div>

      <Controls
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleToc={() => setIsSidebarOpen(!isSidebarOpen)}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
        onAIAnalyze={handleSmartRecap}
        currentTheme={theme}
        fontSize={fontSize}
        currentChapterLabel={currentChapterLabel}
        showUI={showUI}
      />

      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aiState={aiState}
        title={aiModalTitle}
        onGenerateAudio={handleGenerateAudio}
        audioState={audioState}
      />
      <CharacterCard
        isOpen={isCharacterCardOpen}
        onClose={() => setIsCharacterCardOpen(false)}
        characterName={characterName}
        aiState={characterAiState}
      />
    </div>
  )
}
