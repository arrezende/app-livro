import React, { useState, useEffect } from 'react'
import { StoredBook } from './types'
import { Toast } from './components/Toast'
import { useLibrary } from './hooks/useLibrary'
import { LibraryView } from './components/LibraryView'
import { ReaderView } from './components/ReaderView'
import Header from './components/Header'

interface ToastState {
  message: string
  type: 'info' | 'error' | 'success'
}

// --- 1. Função Auxiliar: Converter Base64 do Native para Blob ---
const b64toBlob = (b64Data: string, contentType = 'application/epub+zip') => {
  const byteCharacters = atob(b64Data)
  const byteArrays = []

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  return new Blob(byteArrays, { type: contentType })
}

export default function App() {
  const { books, isLoading, addBook, removeBook, updateProgress } = useLibrary()

  const [readingBook, setReadingBook] = useState<StoredBook | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

  const showToast = (message: string, type: 'info' | 'error' | 'success') => {
    setToast({ message, type })
  }

  // --- 2. O Listener da Ponte (Bridge) ---
  useEffect(() => {
    // Esta função ouve o React Native
    const handleNativeMessage = async (event: any) => {
      try {
        // No Android às vezes vem como string, no iOS como objeto, garantimos o parse
        const messageData =
          typeof event.data === 'string' ? JSON.parse(event.data) : event.data

        if (messageData.type === 'OPEN_BOOK_NATIVE') {
          showToast('Importando livro...', 'info')

          // O Native manda: { type: '...', payload: 'BASE64_STRING', fileName: 'livro.epub' }
          const blob = b64toBlob(messageData.payload)

          // Criamos um objeto File artificial para reaproveitar sua função addBook existente
          const file = new File(
            [blob],
            messageData.fileName || 'livro-importado.epub',
            {
              type: 'application/epub+zip',
            },
          )

          await handleUpload(file)
        }
      } catch (error) {
        console.error('Erro na comunicação Native:', error)
        showToast('Erro ao receber arquivo do app.', 'error')
      }
    }

    // Suporte para Android (document) e iOS (window)
    document.addEventListener('message', handleNativeMessage as any)
    window.addEventListener('message', handleNativeMessage)

    return () => {
      document.removeEventListener('message', handleNativeMessage as any)
      window.removeEventListener('message', handleNativeMessage)
    }
  }, []) // Array vazio = roda apenas ao iniciar o app

  const handleUpload = async (file: File) => {
    try {
      const newBook = await addBook(file)
      if (newBook) {
        showToast('Livro aberto com sucesso!', 'success')
        // --- 3. Auto-open: Já setamos como lendo imediatamente ---
        setReadingBook(newBook)
      }
    } catch (e) {
      showToast('Erro ao processar o arquivo.', 'error')
    }
  }

  const handleBookClick = async (book: StoredBook) => {
    setReadingBook(book)
  }

  const handleDelete = async (id: string) => {
    // Modificado para usar window.confirm nativo ou customizado,
    // pois window.confirm pode bloquear a WebView em alguns casos
    // mas para teste inicial funciona.
    if (window.confirm('Tem certeza que deseja remover este livro?')) {
      await removeBook(id)
      showToast('Livro removido.', 'success')
    }
  }

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
        <>
          <LibraryView
            books={books}
            isLoading={isLoading}
            onBookClick={handleBookClick}
            onUpload={handleUpload}
            onDelete={handleDelete}
            // DICA: Você pode esconder o botão de Upload visual se estiver no celular
            // isNativeApp={true}
          />
        </>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
