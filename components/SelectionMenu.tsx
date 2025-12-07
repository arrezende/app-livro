import React from 'react'
import { Icons } from './Icon'

interface SelectionMenuProps {
  visible: boolean
  position: { x: number; y: number; height: number }
  onAction: (action: 'explain' | 'summarize' | 'recap' | 'identify') => void
  onClose: () => void
}

export const SelectionMenu: React.FC<SelectionMenuProps> = ({
  visible,
  position,
  onAction,
  onClose,
}) => {
  if (!visible) return null

  // Smart Positioning: If the selection is too close to the top, show menu BELOW the selection
  const showBelow = position.y < 120 // 120px threshold (header + safe space)

  // y is the top of the selection.
  // If showBelow is true, we position at y + height + offset
  // If showBelow is false, we position at y - 50 (above)

  const topPosition = showBelow
    ? position.y + position.height + 10
    : position.y - 50

  return (
    <div
      className="fixed z-50 flex items-center gap-1 p-1 bg-gray-900 text-white rounded-lg shadow-xl animate-in zoom-in duration-200"
      style={{
        left: position.x,
        top: topPosition,
        transform: 'translateX(-50%)',
      }}
    >
      <button
        onClick={() => onAction('identify')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium border-r border-white/20"
        title="Quem é este personagem?"
      >
        <Icons.User size={14} className="text-emerald-400" />
        Quem é?
      </button>

      <button
        onClick={() => onAction('explain')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium"
        title="Explicar conceito ou termo"
      >
        <Icons.Sparkles size={14} className="text-yellow-400" />
        Explicar
      </button>

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      <button
        onClick={() => onAction('summarize')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium border-r border-white/20"
        title="Resumir trecho"
      >
        <Icons.List size={14} className="text-blue-300" />
        Resumir
      </button>

      <button
        onClick={() => onAction('recap')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium"
        title="O que aconteceu até agora?"
      >
        <Icons.History size={14} className="text-purple-400" />
        Recapitular
      </button>

      {/* Arrow pointing to selection */}
      <div
        className={`absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-gray-900 rotate-45 ${
          showBelow ? '-top-1.5' : '-bottom-1.5'
        }`}
      ></div>
    </div>
  )
}
