import React, { useState, useRef, useEffect, useCallback } from 'react'
import ePub from 'epubjs'
import {
  Book as BookType,
  Rendition as RenditionType,
  TocItem,
  Theme,
  AIResponseState,
  StoredBook,
} from './types'
import { Controls, themes } from './components/Controls'
import { Sidebar } from './components/Sidebar'
import { Icons } from './components/Icon'
import { AIModal } from './components/AIModal'
import { SelectionMenu } from './components/SelectionMenu'
import { Toast } from './components/Toast'
import { CharacterCard } from './components/CharacterCard'
import {
  generateRecap,
  analyzeSelection,
  identifyCharacter,
} from './services/geminiService'
import {
  getAllBooks,
  saveBookToStorage,
  updateBookProgress,
  deleteBookFromStorage,
  getBookById,
} from './services/storage'
import Header from './components/Header'
import LibraryEmpty from './components/LibraryEmpty'

interface SelectionState {
  visible: boolean
  x: number
  y: number
  height: number
  text: string
  cfiRange: string
}

interface ToastState {
  message: string
  type: 'info' | 'error' | 'success'
}

export default function App() {
  const [book, setBook] = useState<BookType | null>(null)
  const [rendition, setRendition] = useState<RenditionType | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [toc, setToc] = useState<TocItem[]>([])
  const [currentChapterLabel, setCurrentChapterLabel] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [theme, setTheme] = useState<Theme>(themes[0])
  const [fontSize, setFontSize] = useState(100)
  const [metadata, setMetadata] = useState<any>(null)
  const [currentBookId, setCurrentBookId] = useState<string | null>(null)

  // Library State
  const [recentBooks, setRecentBooks] = useState<StoredBook[]>([])
  const [isLoadingLibrary, setIsLoadingLibrary] = useState(true)

  // Selection State
  const [selection, setSelection] = useState<SelectionState>({
    visible: false,
    x: 0,
    y: 0,
    height: 0,
    text: '',
    cfiRange: '',
  })

  // AI State
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [aiState, setAiState] = useState<AIResponseState>({
    loading: false,
    content: null,
    error: null,
  })
  const [aiModalTitle, setAiModalTitle] = useState('Lumina AI Insights')

  // Character ID State
  const [isCharacterCardOpen, setIsCharacterCardOpen] = useState(false)
  const [characterName, setCharacterName] = useState('')
  const [characterAiState, setCharacterAiState] = useState<AIResponseState>({
    loading: false,
    content: null,
    error: null,
  })

  // Feedback State
  const [toast, setToast] = useState<ToastState | null>(null)

  // Refs for State Management to prevent closure staleness in callbacks
  const viewerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isLocationRestored = useRef(false)
  const saveTimeout = useRef<NodeJS.Timeout | null>(null)

  // Load Library on Mount
  useEffect(() => {
    refreshLibrary()
  }, [])

  const refreshLibrary = async () => {
    try {
      const books = await getAllBooks()
      setRecentBooks(books)
    } catch (e) {
      console.error('Failed to load library', e)
    } finally {
      setIsLoadingLibrary(false)
    }
  }

  const initBook = async (
    bookData: ArrayBuffer,
    bookId: string,
    initialCfi: string | null = null,
  ) => {
    if (book) {
      book.destroy()
    }
    setBook(null) // Reset current book
    setCurrentBookId(bookId)

    // Small delay to ensure DOM is clear
    setTimeout(() => {
      try {
        const newBook = ePub(bookData)
        setBook(newBook as unknown as BookType)
        setIsReady(false)
        // We temporarily store the initialCfi in a property we can access in the useEffect
        // Or we rely on the DB fetch inside useEffect if we want.
        // For simplicity, let's pass it via a ref or rely on the DB inside the effect.
        // Actually, the cleanest way: pass it to state, but 'book' dependency triggers the effect.
        // Let's rely on the ID check in the effect.
      } catch (error) {
        console.error('Error creating ePub:', error)
        setToast({ message: 'Erro ao abrir o livro.', type: 'error' })
      }
    }, 50)
  }

  // Initialize Book when file is selected
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (file) {
      setIsLoadingLibrary(true) // Show loading state
      const reader = new FileReader()
      reader.onload = async (e) => {
        if (e.target?.result) {
          const bookData = e.target.result as ArrayBuffer

          try {
            // Parse metadata first to save to DB
            const tempBook = ePub(bookData)
            const meta = await tempBook.loaded.metadata

            // Try to get cover
            let coverBlob: Blob | null = null
            try {
              const coverUrl = await tempBook.coverUrl()
              if (coverUrl) {
                const response = await fetch(coverUrl)
                coverBlob = await response.blob()
              }
            } catch (coverErr) {
              console.warn('Could not extract cover', coverErr)
            }

            const id = `book_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`

            const newBookEntry: StoredBook = {
              id,
              title: meta.title || file.name.replace('.epub', ''),
              author: meta.creator || 'Autor Desconhecido',
              data: bookData,
              coverBlob,
              lastRead: Date.now(),
              progressCfi: null,
              progressPercent: 0,
            }

            await saveBookToStorage(newBookEntry)
            await refreshLibrary()

            // Open the book
            initBook(bookData, id)

            // Cleanup temp book
            tempBook.destroy()
          } catch (error) {
            console.error('Error processing ePub:', error)
            setToast({ message: 'Erro ao processar arquivo.', type: 'error' })
            setIsLoadingLibrary(false)
          }
        }
      }
      reader.readAsArrayBuffer(file)
    }
  }

  const handleOpenFromLibrary = async (storedBook: StoredBook) => {
    // Move to top of list (update last read)
    await updateBookProgress(
      storedBook.id,
      storedBook.progressCfi || '',
      storedBook.progressPercent,
    )
    await refreshLibrary()
    initBook(storedBook.data, storedBook.id, storedBook.progressCfi)
  }

  const handleDeleteBook = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (
      window.confirm(
        'Tem certeza que deseja remover este livro da sua biblioteca?',
      )
    ) {
      await deleteBookFromStorage(id)
      await refreshLibrary()
      setToast({ message: 'Livro removido.', type: 'success' })
    }
  }

  // Render book once loaded
  useEffect(() => {
    if (!book || !viewerRef.current) return

    const element = viewerRef.current
    element.innerHTML = ''

    const newRendition = book.renderTo(element, {
      width: '90%',
      height: '90%',
      flow: 'paginated',
      manager: 'default',
    })

    setRendition(newRendition as unknown as RenditionType)

    // Reset state flags
    isLocationRestored.current = false

    let isMounted = true

    // Load metadata and determine start location
    book.loaded.metadata
      .then(async (meta) => {
        if (isMounted) {
          setMetadata(meta)
          document.title = `${meta.title} - Lumina Reader`

          let startCfi = null

          // Fetch saved position from IndexedDB if we have a current ID
          if (currentBookId) {
            const stored = await getBookById(currentBookId)
            if (stored && stored.progressCfi) {
              startCfi = stored.progressCfi
            }
          }

          const displayPromise = startCfi
            ? newRendition.display(startCfi)
            : newRendition.display()

          return displayPromise.then(() => {
            if (startCfi) {
              setToast({
                message: 'Continuando de onde você parou',
                type: 'success',
              })
            }

            // GRACE PERIOD for relocating
            setTimeout(() => {
              if (isMounted) {
                isLocationRestored.current = true
              }
            }, 1500)
          })
        }
      })
      .then(() => {
        if (isMounted) setIsReady(true)
      })
      .catch((err) => {
        console.error('Initialization error:', err)
        if (isMounted) {
          newRendition.display().then(() => {
            setIsReady(true)
            setTimeout(() => {
              if (isMounted) isLocationRestored.current = true
            }, 1500)
          })
        }
      })

    // Load TOC
    book.loaded.navigation
      .then((nav) => {
        if (isMounted) setToc(nav.toc)
      })
      .catch((err) => console.error('Navigation error:', err))

    // Listeners
    newRendition.on('selected', (cfiRange: string, contents: any) => {
      const range = newRendition.getRange(cfiRange)
      if (!range) return

      const text = range.toString()
      if (!text || text.trim().length === 0) return

      const rect = range.getBoundingClientRect()
      const viewer = viewerRef.current
      const iframe = viewer?.querySelector('iframe')

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

      if (!isLocationRestored.current) return

      if (saveTimeout.current) clearTimeout(saveTimeout.current)

      saveTimeout.current = setTimeout(async () => {
        if (currentBookId && location.start && location.start.cfi) {
          // Calculate percentage
          // Note: location.start.percentage is sometimes available, usually explicitly calculated via locations
          // For simplicity in this robust version without generating all locations (slow), we use the location object provided
          // However, epub.js 'locations' need to be generated for accurate %.
          // We'll trust what we have or default to 0.

          // Try to get rough percentage
          let percent = 0
          // @ts-ignore
          if (book.locations.length() > 0) {
            // @ts-ignore
            percent = book.locations.percentageFromCfi(location.start.cfi)
          }

          await updateBookProgress(
            currentBookId,
            location.start.cfi,
            percent * 100,
          )
        }
      }, 500)
    })

    return () => {
      isMounted = false
      if (saveTimeout.current) clearTimeout(saveTimeout.current)
      if (newRendition) {
        try {
          newRendition.destroy()
        } catch (e) {}
      }
      if (element) {
        element.innerHTML = ''
      }
    }
  }, [book, currentBookId])

  // Apply Theme & Font Size
  useEffect(() => {
    if (rendition) {
      rendition.themes.register(theme.name, {
        body: { color: theme.fg, background: theme.bg },
        '::selection': { background: 'rgba(255, 255, 0, 0.3)' },
        p: { color: theme.fg },
        h1: { color: theme.fg },
        h2: { color: theme.fg },
        h3: { color: theme.fg },
        h4: { color: theme.fg },
        h5: { color: theme.fg },
        h6: { color: theme.fg },
        span: { color: theme.fg },
        div: { color: theme.fg },
        a: { color: theme.name === 'dark' ? '#63b3ed' : '#3182ce' },
      })
      rendition.themes.select(theme.name)
      rendition.themes.fontSize(`${fontSize}%`)

      if (viewerRef.current) {
        viewerRef.current.style.backgroundColor = theme.bg
      }
    }
  }, [rendition, theme, fontSize])

  // Navigation Handlers
  const handleNext = useCallback(() => rendition?.next(), [rendition])
  const handlePrev = useCallback(() => rendition?.prev(), [rendition])

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
    }
    window.addEventListener('keyup', handleKeyDown)
    return () => window.removeEventListener('keyup', handleKeyDown)
  }, [handleNext, handlePrev])

  const handleSelectChapter = (href: string) => {
    rendition?.display(href)
  }

  const getTextFromSpineItem = async (href: string) => {
    try {
      // @ts-ignore
      const doc = await book?.load(href)
      if (doc && doc.body) return doc.body.textContent || ''
      return ''
    } catch (e) {
      console.warn('Could not load spine item text', href, e)
      return ''
    }
  }

  const normalizeText = (text: string) => {
    return text.replace(/\s+/g, ' ').trim()
  }

  // AI Actions
  const handleSelectionAction = async (
    action: 'explain' | 'summarize' | 'translate' | 'identify',
  ) => {
    if (!selection.text) return

    setSelection((prev) => ({ ...prev, visible: false }))

    if (action === 'identify') {
      const name = selection.text.trim()
      if (name.split(' ').length > 5) {
        setToast({
          message: 'Selecione apenas o nome do personagem.',
          type: 'info',
        })
        return
      }

      setCharacterName(name)
      setIsCharacterCardOpen(true)
      setCharacterAiState({ loading: true, content: null, error: null })

      try {
        const bookTitle = metadata?.title || 'livro desconhecido'
        const author = metadata?.creator || 'autor desconhecido'
        const result = await identifyCharacter(name, bookTitle, author)
        setCharacterAiState({ loading: false, content: result, error: null })
      } catch (err) {
        setCharacterAiState({
          loading: false,
          content: null,
          error: 'Não foi possível identificar o personagem.',
        })
      }
      return
    }

    switch (action) {
      case 'explain':
        setAiModalTitle('Explicação do Texto')
        break
      case 'summarize':
        setAiModalTitle('Resumo do Trecho')
        break
      case 'translate':
        setAiModalTitle('Tradução')
        break
    }

    setIsAIModalOpen(true)
    setAiState({ loading: true, content: null, error: null })

    try {
      const result = await analyzeSelection(selection.text, action)
      setAiState({ loading: false, content: result, error: null })
    } catch (err) {
      setAiState({
        loading: false,
        content: null,
        error: 'Erro ao processar solicitação.',
      })
    }
  }

  const handleSmartRecap = async () => {
    if (!rendition || !book) return

    if (!selection.text || selection.text.trim() === '') {
      setToast({
        message: 'Selecione o último trecho lido para gerar o resumo!',
        type: 'info',
      })
      return
    }

    setAiModalTitle('O que aconteceu até agora')
    setIsAIModalOpen(true)
    setAiState({ loading: true, content: null, error: null })

    try {
      const selectedSpineItem = book.spine.get(selection.cfiRange)
      if (!selectedSpineItem)
        throw new Error('Não foi possível localizar o capítulo da seleção.')

      const currentFullTextRaw = await getTextFromSpineItem(
        selectedSpineItem.href,
      )
      const currentFullTextNormalized = normalizeText(currentFullTextRaw)
      const selectedTextNormalized = normalizeText(selection.text)

      let cutoffIndex = currentFullTextNormalized.indexOf(
        selectedTextNormalized,
      )
      if (cutoffIndex === -1) {
        const snippet = selectedTextNormalized.substring(0, 20)
        cutoffIndex = currentFullTextNormalized.indexOf(snippet)
      }

      if (cutoffIndex === -1) {
        throw new Error(
          'Não foi possível localizar o trecho selecionado no contexto da página.',
        )
      }

      let relevantText = currentFullTextNormalized.substring(
        0,
        cutoffIndex + selectedTextNormalized.length,
      )

      if (relevantText.length < 500 && selectedSpineItem.index > 0) {
        const prevSpineItem = book.spine.get(selectedSpineItem.index - 1)
        if (prevSpineItem) {
          const prevTextRaw = await getTextFromSpineItem(prevSpineItem.href)
          relevantText =
            normalizeText(prevTextRaw) +
            '\n\n--- FIM DO CAPÍTULO ANTERIOR ---\n\n' +
            relevantText
        }
      }

      const allWords = relevantText.split(' ')
      const finalText = allWords.slice(-3000).join(' ')

      const bookTitle = metadata ? metadata.title : 'o livro'
      const summary = await generateRecap(bookTitle, finalText)
      setAiState({ loading: false, content: summary, error: null })
    } catch (err: any) {
      console.error('Recap Error:', err)
      setAiState({
        loading: false,
        content: null,
        error: err.message || 'Erro ao analisar o histórico de leitura.',
      })
    }
  }

  // --------------------------------------------------------------------------------
  // RENDER LIBRARY (HOME SCREEN)
  // --------------------------------------------------------------------------------
  if (!book) {
    return (
      <div className="min-h-screen bg-white transition-colors duration-500 overflow-auto custom-scrollbar">
        {/* Navbar */}
        {/* <Header /> */}

        <input
          ref={fileInputRef}
          type="file"
          accept=".epub, application/epub+zip"
          className="hidden"
          onChange={handleFileUpload}
        />
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Icons.BookOpen className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Lumina Reader
              </h1>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full cursor-pointer transition-colors shadow-md hover:shadow-lg text-sm font-medium"
            >
              <Icons.Upload size={16} />
              <span className="hidden sm:inline">Carregar EPUB</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".epub, application/epub+zip"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoadingLibrary ? (
            <div className="flex justify-center py-20">
              <Icons.Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : recentBooks.length === 0 ? (
            // Empty State
            // <LibraryEmpty onClick={() => fileInputRef.current?.click()} />]
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl max-w-lg w-full text-center space-y-8 border border-gray-100 dark:border-gray-700">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-6 opacity-20"></div>
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                    <Icons.BookOpen className="text-white w-12 h-12" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Sua biblioteca está vazia
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Carregue seu primeiro livro para começar a usar a
                    inteligência artificial na sua leitura.
                  </p>
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold transition-colors"
                >
                  Selecionar arquivo no dispositivo
                </button>
              </div>
            </div>
          ) : (
            // <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
            //   <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl max-w-lg w-full text-center space-y-8 border border-gray-100 dark:border-gray-700">
            //     <div className="relative w-24 h-24 mx-auto">
            //       <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-6 opacity-20"></div>
            //       <div className="absolute inset-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            //         <Icons.BookOpen className="text-white w-12 h-12" />
            //       </div>
            //     </div>
            //     <div>
            //       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            //         Sua biblioteca está vazia
            //       </h2>
            //       <p className="text-gray-500 dark:text-gray-400">
            //         Carregue seu primeiro livro para começar a usar a
            //         inteligência artificial na sua leitura.
            //       </p>
            //     </div>
            //     <button
            //       onClick={() => fileInputRef.current?.click()}
            //       className="w-full py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl text-blue-600 dark:text-blue-400 font-semibold transition-colors"
            //     >
            //       Selecionar arquivo no dispositivo
            //     </button>
            //   </div>
            // </div>
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Icons.History size={24} className="text-blue-500" />
                  Continuar Lendo
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {recentBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() => handleOpenFromLibrary(book)}
                    className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
                  >
                    {/* Cover Area */}
                    <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                      {book.coverBlob ? (
                        <img
                          src={URL.createObjectURL(book.coverBlob)}
                          alt={book.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onLoad={(e) =>
                            URL.revokeObjectURL(
                              (e.target as HTMLImageElement).src,
                            )
                          }
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 p-4 text-center">
                          <Icons.BookOpen className="text-blue-400 w-10 h-10 mb-2" />
                          <span className="text-xs text-blue-800 dark:text-blue-200 font-bold opacity-60 uppercase tracking-widest">
                            {book.author}
                          </span>
                        </div>
                      )}

                      {/* Gradient Overlay on Hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                      {/* Delete Button (Visible on Hover) */}
                      <button
                        onClick={(e) => handleDeleteBook(e, book.id)}
                        className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                        title="Remover da biblioteca"
                      >
                        <Icons.X size={14} />
                      </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 w-full bg-gray-100 dark:bg-gray-700">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${book.progressPercent || 0}%` }}
                      />
                    </div>

                    {/* Meta Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm mb-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
                        {book.author}
                      </p>
                      <div className="mt-auto flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {book.progressPercent
                            ? `${Math.round(book.progressPercent)}% lido`
                            : 'Não iniciado'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    )
  }

  // Render Reader (Same as before)
  return (
    <div
      className="h-screen w-screen overflow-hidden flex flex-col transition-colors duration-500"
      style={{ backgroundColor: theme.bg }}
    >
      <Sidebar
        toc={toc}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onSelectChapter={handleSelectChapter}
        currentTheme={theme}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Selection Menu */}
      <SelectionMenu
        visible={selection.visible}
        position={{ x: selection.x, y: selection.y, height: selection.height }}
        onAction={handleSelectionAction}
        onClose={() => setSelection((prev) => ({ ...prev, visible: false }))}
      />

      {/* Header */}
      <div className="relative top-0 left-0 right-0 p-4 z-40 flex justify-between pointer-events-none">
        <div className="pointer-events-auto">
          {/* Back Button */}
          <button
            onClick={() => {
              setBook(null)
              setRendition(null)
              setIsReady(false)
              refreshLibrary()
              setCurrentBookId(null)
            }}
            className="p-2 rounded-full bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/20 text-gray-600 dark:text-gray-300 transition-colors backdrop-blur-md"
            title="Voltar para Biblioteca"
          >
            <Icons.ChevronLeft size={20} />
          </button>
        </div>
        {/* HEADER LEITURA DO LIVRO */}
        <div
          className={`shadow-sm hidden text-sm font-medium px-4 py-1.5 rounded-full backdrop-blur-md transition-colors duration-300 max-w-md truncate ${
            theme.name === 'dark'
              ? 'bg-gray-800/80 text-gray-200 border border-gray-700'
              : 'bg-white/80 text-gray-700 border border-gray-200'
          }`}
        >
          {metadata ? metadata.title : 'Carregando livro...'}
        </div>
        <div className="pointer-events-auto">{/* Right spacer or tools */}</div>
      </div>

      {/* Main Viewer Area */}
      <div className="flex-relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div
          ref={viewerRef}
          className="w-full h-full"
          style={{
            opacity: isReady ? 1 : 0,
            transition: 'opacity 0.4s ease-out',
          }}
        />

        {/* Loading Overlay */}
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
      />

      <AIModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        aiState={aiState}
        title={aiModalTitle}
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
