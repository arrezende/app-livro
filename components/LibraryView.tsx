
import React, { useRef } from 'react';
import { Icons } from './Icon';
import { StoredBook } from '../types';

interface LibraryViewProps {
  books: StoredBook[];
  isLoading: boolean;
  onBookClick: (book: StoredBook) => void;
  onUpload: (file: File) => void;
  onDelete: (id: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ 
  books, 
  isLoading, 
  onBookClick, 
  onUpload, 
  onDelete 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onUpload(e.target.files[0]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-500 overflow-auto custom-scrollbar">
      {/* Navbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="bg-blue-600 p-1.5 rounded-lg">
                <Icons.BookOpen className="text-white w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Lumina Reader</h1>
           </div>
           
           {/* Upload Button */}
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
                onChange={handleFileChange}
              />
           </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {isLoading ? (
            <div className="flex justify-center py-20">
               <Icons.Loader className="animate-spin text-blue-500" size={32} />
            </div>
          ) : books.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
              <div className="bg-white dark:bg-gray-800 p-12 rounded-3xl shadow-xl max-w-lg w-full text-center space-y-8 border border-gray-100 dark:border-gray-700">
                <div className="relative w-24 h-24 mx-auto">
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl transform rotate-6 opacity-20"></div>
                  <div className="absolute inset-0 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
                      <Icons.BookOpen className="text-white w-12 h-12" />
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Sua biblioteca está vazia</h2>
                  <p className="text-gray-500 dark:text-gray-400">Carregue seu primeiro livro para começar a usar a inteligência artificial na sua leitura.</p>
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
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                     <Icons.History size={24} className="text-blue-500" />
                     Continuar Lendo
                  </h2>
               </div>
               
               <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                  {books.map((book) => (
                    <div 
                      key={book.id}
                      onClick={() => onBookClick(book)}
                      className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                       {/* Cover Area */}
                       <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                          {book.coverBlob ? (
                             <img 
                               src={URL.createObjectURL(book.coverBlob)} 
                               alt={book.title} 
                               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                               onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                             />
                          ) : (
                             <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-blue-100 dark:from-indigo-900/30 dark:to-blue-900/30 p-4 text-center">
                                <Icons.BookOpen className="text-blue-400 w-10 h-10 mb-2" />
                                <span className="text-xs text-blue-800 dark:text-blue-200 font-bold opacity-60 uppercase tracking-widest">{book.author}</span>
                             </div>
                          )}
                          
                          {/* Gradient Overlay on Hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

                          {/* Delete Button (Visible on Hover) */}
                          <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               onDelete(book.id);
                             }}
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
                             <span>{book.progressPercent ? `${Math.round(book.progressPercent)}% lido` : 'Não iniciado'}</span>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}
      </div>
    </div>
  );
};
