import React from 'react'
import { Icons } from './Icon'
import { Theme } from '../types'

interface ControlsProps {
  onNext: () => void
  onPrev: () => void
  onToggleToc: () => void
  onThemeChange: (theme: Theme) => void
  onFontSizeChange: (size: number) => void
  onAIAnalyze: () => void
  currentTheme: Theme
  fontSize: number
  currentChapterLabel: string
  showUI: boolean
}

export const themes: Theme[] = [
  { name: 'light', label: 'Claro', bg: '#ffffff', fg: '#1a202c' },
  { name: 'sepia', label: 'Sépia', bg: '#fbf0d9', fg: '#5f4b32' },
  { name: 'dark', label: 'Escuro', bg: '#1a202c', fg: '#e2e8f0' },
]

export const Controls: React.FC<ControlsProps> = ({
  onNext,
  onPrev,
  onToggleToc,
  onThemeChange,
  onFontSizeChange,
  onAIAnalyze,
  currentTheme,
  fontSize,
  currentChapterLabel,
  showUI,
}) => {
  const [showSettings, setShowSettings] = React.useState(false)

  // Close settings if UI is hidden
  React.useEffect(() => {
    if (!showUI) {
      setShowSettings(false)
    }
  }, [showUI])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-4 border-t flex items-center justify-between transition-transform duration-300 z-50 ${
        showUI ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        backgroundColor: currentTheme.bg,
        color: currentTheme.fg,
        borderColor: currentTheme.name === 'dark' ? '#2d3748' : '#e2e8f0',
      }}
    >
      {/* Settings Panel */}
      {showSettings && showUI && (
        <div
          className="absolute bottom-full right-4 mb-2 p-4 rounded-lg shadow-xl border w-64"
          style={{
            backgroundColor: currentTheme.bg,
            borderColor: currentTheme.name === 'dark' ? '#4a5568' : '#e2e8f0',
          }}
        >
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
                Tema
              </p>
              <div className="flex gap-2">
                {themes.map((t) => (
                  <button
                    key={t.name}
                    onClick={() => onThemeChange(t)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                      currentTheme.name === t.name
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: t.bg }}
                    title={t.label}
                  />
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2 opacity-70">
                Tamanho da Fonte
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onFontSizeChange(Math.max(80, fontSize - 10))}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <Icons.Type size={14} />
                </button>
                <span className="text-sm font-medium w-8 text-center">
                  {fontSize}%
                </span>
                <button
                  onClick={() => onFontSizeChange(Math.min(200, fontSize + 10))}
                  className="p-1 hover:bg-black/10 rounded"
                >
                  <Icons.Type size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left: Navigation & TOC */}
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleToc}
          className="p-2 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          title="Índice"
        >
          <Icons.List size={20} />
        </button>
        <div className="hidden sm:block text-sm opacity-70 max-w-[200px] truncate">
          {currentChapterLabel}
        </div>
      </div>

      {/* Center: Pagination */}
      <div className="flex items-center gap-4">
        <button
          onClick={onPrev}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Icons.ChevronLeft size={24} />
        </button>
        <button
          onClick={onNext}
          className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <Icons.ChevronRight size={24} />
        </button>
      </div>

      {/* Right: Tools */}
      <div className="flex items-center gap-2">
        <button
          onClick={onAIAnalyze}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:shadow-lg transition-all transform hover:-translate-y-0.5"
          title="Resumir o que aconteceu até agora"
        >
          <Icons.History size={16} />
          <span className="hidden sm:inline text-sm font-medium">
            O que aconteceu até agora
          </span>
        </button>

        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${
            showSettings ? 'bg-black/5 dark:bg-white/10' : ''
          }`}
        >
          <Icons.Settings size={20} />
        </button>
      </div>
    </div>
  )
}
