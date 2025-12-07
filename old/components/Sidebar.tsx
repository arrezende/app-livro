import React from 'react';
import { TocItem, Theme } from '../types';
import { Icons } from './Icon';

interface SidebarProps {
  toc: TocItem[];
  isOpen: boolean;
  onClose: () => void;
  onSelectChapter: (href: string) => void;
  currentTheme: Theme;
}

export const Sidebar: React.FC<SidebarProps> = ({ toc, isOpen, onClose, onSelectChapter, currentTheme }) => {
  return (
    <div 
      className={`fixed inset-y-0 left-0 w-80 transform transition-transform duration-300 ease-in-out z-[60] shadow-2xl overflow-hidden flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ backgroundColor: currentTheme.bg, color: currentTheme.fg }}
    >
      <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: currentTheme.name === 'dark' ? '#2d3748' : '#e2e8f0' }}>
        <h2 className="font-bold text-lg">Índice</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10">
          <Icons.X size={20} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {toc.length === 0 ? (
          <p className="opacity-50 text-sm italic">Nenhum índice encontrado.</p>
        ) : (
          toc.map((item) => (
            <div key={item.id} className="space-y-1">
              <button
                onClick={() => {
                  onSelectChapter(item.href);
                  onClose();
                }}
                className="w-full text-left px-3 py-2 text-sm rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 truncate"
              >
                {item.label}
              </button>
              {item.subitems && item.subitems.length > 0 && (
                <div className="pl-4 border-l border-opacity-20 ml-2" style={{ borderColor: currentTheme.fg }}>
                    {item.subitems.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => {
                            onSelectChapter(sub.href);
                            onClose();
                            }}
                            className="w-full text-left px-3 py-1.5 text-xs opacity-80 rounded transition-colors hover:bg-black/5 dark:hover:bg-white/10 truncate"
                        >
                            {sub.label}
                        </button>
                    ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
