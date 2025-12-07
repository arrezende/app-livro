
import { useState, useEffect, useCallback } from 'react';
import ePub from 'epubjs';
import { StoredBook } from '../types';
import { getAllBooks, saveBookToStorage, deleteBookFromStorage, updateBookProgress } from '../services/storage';

export function useLibrary() {
  const [books, setBooks] = useState<StoredBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshLibrary = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getAllBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load library", err);
      setError("Erro ao carregar biblioteca.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const addBook = async (file: File): Promise<StoredBook | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          const bookData = e.target.result as ArrayBuffer;
          
          try {
            // Parse metadata
            const tempBook = ePub(bookData);
            const meta = await tempBook.loaded.metadata;
            
            // Try to extract cover
            let coverBlob: Blob | null = null;
            try {
              const coverUrl = await tempBook.coverUrl();
              if (coverUrl) {
                const response = await fetch(coverUrl);
                coverBlob = await response.blob();
              }
            } catch (coverErr) {
              console.warn("Could not extract cover", coverErr);
            }

            const id = `book_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            const newBookEntry: StoredBook = {
              id,
              title: meta.title || file.name.replace('.epub', ''),
              author: meta.creator || 'Autor Desconhecido',
              data: bookData,
              coverBlob,
              lastRead: Date.now(),
              progressCfi: null,
              progressPercent: 0
            };

            await saveBookToStorage(newBookEntry);
            await refreshLibrary();
            
            // Cleanup
            tempBook.destroy();
            resolve(newBookEntry);

          } catch (error) {
            console.error("Error processing ePub:", error);
            reject(error);
          }
        }
      };
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.readAsArrayBuffer(file);
    });
  };

  const removeBook = async (id: string) => {
    await deleteBookFromStorage(id);
    await refreshLibrary();
  };

  const updateProgress = async (id: string, cfi: string, percent: number) => {
    await updateBookProgress(id, cfi, percent);
    // We don't await refresh here to avoid UI flickering, strictly speaking we update local state or just let the DB handle it
    // But updating the local list order is nice
    setBooks(prev => {
        const newBooks = [...prev];
        const index = newBooks.findIndex(b => b.id === id);
        if (index !== -1) {
            newBooks[index] = { ...newBooks[index], progressCfi: cfi, progressPercent: percent, lastRead: Date.now() };
            newBooks.sort((a, b) => b.lastRead - a.lastRead);
        }
        return newBooks;
    });
  };

  return {
    books,
    isLoading,
    error,
    refreshLibrary,
    addBook,
    removeBook,
    updateProgress
  };
}
