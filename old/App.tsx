
import React, { useState } from 'react';
import { StoredBook } from './types';
import { Toast } from './components/Toast';
import { useLibrary } from './hooks/useLibrary';
import { LibraryView } from './components/LibraryView';
import { ReaderView } from './components/ReaderView';

interface ToastState {
  message: string;
  type: 'info' | 'error' | 'success';
}

export default function App() {
  const { books, isLoading, addBook, removeBook, updateProgress } = useLibrary();
  
  const [readingBook, setReadingBook] = useState<StoredBook | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'info' | 'error' | 'success') => {
    setToast({ message, type });
  };

  const handleUpload = async (file: File) => {
    try {
      const newBook = await addBook(file);
      if (newBook) {
        showToast("Livro adicionado com sucesso!", 'success');
        setReadingBook(newBook);
      }
    } catch (e) {
      showToast("Erro ao processar o arquivo.", 'error');
    }
  };

  const handleBookClick = async (book: StoredBook) => {
      // Small trick: Update the 'lastRead' immediately in UI or just open it
      // The component will handle the real updateProgress call
      setReadingBook(book);
  };

  const handleDelete = async (id: string) => {
      if (window.confirm("Tem certeza que deseja remover este livro?")) {
          await removeBook(id);
          showToast("Livro removido.", 'success');
      }
  };

  return (
    <>
      {readingBook ? (
        <ReaderView 
          bookData={readingBook.data}
          bookId={readingBook.id}
          initialCfi={readingBook.progressCfi}
          onBack={() => setReadingBook(null)}
          onProgressUpdate={updateProgress}
          showToast={showToast}
        />
      ) : (
        <LibraryView 
          books={books}
          isLoading={isLoading}
          onBookClick={handleBookClick}
          onUpload={handleUpload}
          onDelete={handleDelete}
        />
      )}

      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  );
}
