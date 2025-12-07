import React from 'react';
import { Icons } from './Icon';
import { AIResponseState } from '../types';

interface CharacterCardProps {
  isOpen: boolean;
  onClose: () => void;
  characterName: string;
  aiState: AIResponseState;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ isOpen, onClose, characterName, aiState }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center pointer-events-none">
        {/* Backdrop transparent to allow clicking outside to close (handled by parent logic usually, but here just visual dimming optional) */}
        <div className="absolute inset-0 bg-black/20 pointer-events-auto transition-opacity duration-300" onClick={onClose} />
        
        <div className="relative w-full max-w-md mx-auto mb-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 pointer-events-auto animate-in slide-in-from-bottom-10 duration-300 overflow-hidden mx-4">
            
            {/* Header / Avatar Area */}
            <div className="p-4 flex gap-4 items-start">
                <div className="shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg">
                         {/* Placeholder for character image - in future could be a generated image */}
                        <Icons.User className="text-white w-8 h-8" />
                    </div>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 truncate pr-2">
                            {characterName}
                        </h3>
                        <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1"
                        >
                            <Icons.X size={18} />
                        </button>
                    </div>
                    
                    <div className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                        {aiState.loading ? (
                            <div className="flex items-center gap-2 text-indigo-500 animate-pulse">
                                <Icons.Sparkles size={14} />
                                <span>Consultando os arquivos literários...</span>
                            </div>
                        ) : aiState.error ? (
                            <span className="text-red-500">{aiState.error}</span>
                        ) : (
                            <p>{aiState.content}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer with context warning */}
            {!aiState.loading && !aiState.error && (
                <div className="px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-300 font-medium border-t border-indigo-100 dark:border-indigo-800/50">
                    <Icons.Info size={12} />
                    <span>Descrição livre de spoilers futuros (Anti-Spoiler Mode)</span>
                </div>
            )}
        </div>
    </div>
  );
};