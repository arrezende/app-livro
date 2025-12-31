import React, { useLayoutEffect, useRef, useState } from 'react'
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
  const menuRef = useRef<HTMLDivElement>(null)
  const [horizontalOffset, setHorizontalOffset] = useState(0)

  useLayoutEffect(() => {
    if (visible && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const margin = 16 // Safe margin from edges

      let offset = 0
      const leftEdge = rect.left
      const rightEdge = rect.right

      if (leftEdge < margin) {
        offset = margin - leftEdge
      } else if (rightEdge > viewportWidth - margin) {
        offset = viewportWidth - margin - rightEdge
      }

      setHorizontalOffset(offset)
    } else {
      setHorizontalOffset(0)
    }
  }, [visible, position.x, position.y])

  if (!visible) return null

  // Smart Vertical Positioning: If the selection is too close to the top, show menu BELOW the selection
  const showBelow = position.y < 120 // 120px threshold (header + safe space)
  const topPosition = showBelow
    ? position.y + position.height + 10
    : position.y - 50

  return (
    <div
      ref={menuRef}
      className="fixed z-50 flex items-center gap-1 p-1 bg-gray-900 text-white rounded-lg shadow-xl animate-in zoom-in duration-200"
      style={{
        left: position.x,
        top: topPosition,
        transform: `translateX(calc(-50% + ${horizontalOffset}px))`,
      }}
    >
      <button
        onClick={() => onAction('identify')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium border-r border-white/20"
        title="Quem é este personagem?"
      >
        <Icons.User size={14} className="text-emerald-400" />
        <span className="whitespace-nowrap">Quem é?</span>
      </button>

      <button
        onClick={() => onAction('explain')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium"
        title="Explicar conceito ou termo"
      >
        <Icons.Sparkles size={14} className="text-yellow-400" />
        <span className="whitespace-nowrap">Explicar</span>
      </button>

      <div className="w-px h-4 bg-white/20 mx-0.5" />

      <button
        onClick={() => onAction('summarize')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium border-r border-white/20"
        title="Resumir trecho"
      >
        <Icons.List size={14} className="text-blue-300" />
        <span className="whitespace-nowrap">Resumir</span>
      </button>

      <button
        onClick={() => onAction('recap')}
        className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white/20 rounded-md transition-colors text-xs font-medium"
        title="O que aconteceu até agora?"
      >
        <Icons.History size={14} className="text-purple-400" />
        <span className="whitespace-nowrap">Recapitular</span>
      </button>

      {/* Arrow pointing to selection - shifted in opposite direction of menu to stay centered on X */}
      <div
        className={`absolute left-1/2 w-3 h-3 bg-gray-900 rotate-45 ${
          showBelow ? '-top-1.5' : '-bottom-1.5'
        }`}
        style={{
          transform: `translateX(calc(-50% - ${horizontalOffset}px)) rotate(45deg)`,
        }}
      ></div>
    </div>
  )
}
