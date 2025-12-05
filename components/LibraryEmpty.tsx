export default function LibraryEmpty({ onClick }: { onClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center px-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="lucide lucide-book-open-icon lucide-book-open"
      >
        <path d="M2 3h6a4 4 0 0 1 4 4v14a2 2 0 0 0-2-2H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a2 2 0 0 1 2-2h6z" />
      </svg>
      <h2 className="mt-4 text-2xl font-semibold">Sua biblioteca está vazia</h2>
      <p className="mt-2 text-gray-600">
        Adicione livros à sua biblioteca para começar a ler.
      </p>
      <div
        onClick={onClick}
        className="flex items-center mt-5 gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full cursor-pointer transition-colors shadow-md hover:shadow-lg text-sm font-medium"
      >
        <span className="hidden sm:inline">
          Selecionar Arquivo no Dispositivo
        </span>
        <input
          //ref={}
          type="file"
          accept=".epub, application/epub+zip"
          className="hidden"
          //onChange={handleFileUpload}
        />
      </div>
    </div>
  )
}
