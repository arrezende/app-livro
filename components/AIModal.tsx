import React from 'react';
import { Icons } from './Icon';
import { AIResponseState } from '../types';

interface AIModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiState: AIResponseState;
  title?: string;
}

export const AIModal: React.FC<AIModalProps> = ({ isOpen, onClose, aiState, title = "Lumina AI Insights" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700">
        
        {/* Header - Alto Contraste */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center text-gray-900 dark:text-gray-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <Icons.History size={20} />
            </div>
            <h3 className="font-bold text-lg leading-tight">{title}</h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content - Fundo Sólido e Texto Legível */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-900 p-6">
          {aiState.loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse"></div>
                <Icons.Loader className="animate-spin text-indigo-600 dark:text-indigo-400 relative z-10" size={40} />
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium animate-pulse">
                Analisando sua leitura atual...
              </p>
            </div>
          ) : aiState.error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
               <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400 mb-3">
                 <Icons.X size={24} />
               </div>
               <p className="text-red-600 dark:text-red-300 font-medium">
                 {aiState.error}
               </p>
            </div>
          ) : (
            <div className="prose prose-lg dark:prose-invert max-w-none prose-p:text-gray-800 dark:prose-p:text-gray-200 prose-headings:text-gray-900 dark:prose-headings:text-gray-100 leading-relaxed">
              <p className="whitespace-pre-wrap text-gray-600 dark:text-gray-300">{aiState.content}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
           <button 
             onClick={onClose}
             className="w-full py-2.5 px-4 bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-white text-white dark:text-gray-900 font-semibold rounded-lg transition-colors shadow-sm"
           >
             Continuar Lendo
           </button>
        </div>
      </div>
    </div>
  );
};