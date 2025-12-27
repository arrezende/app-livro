import { MdAutoStories, MdNotifications, MdSearch } from 'react-icons/md'

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/90 backdrop-blur-md border-b border-[#e6e9e7] dark:border-[#2a3c2d] px-6 lg:px-10 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-10">
          <div className="flex items-center gap-3">
            <div className="size-8 text-primary">
              <span className="material-symbols-outlined !text-[32px]">
                <MdAutoStories />
              </span>
            </div>
            <h1 className="text-2xl font-serif font-bold tracking-tight text-forest-dark ">
              BookLog
            </h1>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a
              className="text-forest-dark dark:text-gray-200 text-sm font-semibold hover:text-primary transition-colors"
              href="#"
            >
              Home
            </a>
            <a
              className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              My Library
            </a>
            <a
              className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              Community
            </a>
            <a
              className="text-gray-500 dark:text-gray-400 text-sm font-medium hover:text-primary transition-colors"
              href="#"
            >
              Stats
            </a>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center bg-[#f0f4f1] dark:bg-[#1a2e1d] rounded-xl px-4 py-2.5 w-64 group focus-within:ring-2 ring-primary/20 transition-all">
            <span className="material-symbols-outlined text-gray-500 dark:text-gray-400 !text-[20px]">
              <MdSearch />
            </span>
            <input
              className="bg-transparent border-none text-sm ml-2 w-full text-forest-dark dark:text-white placeholder-gray-500 focus:ring-0 p-0"
              placeholder="Search books, authors..."
              type="text"
            />
          </div>
          <button className="relative text-gray-500 dark:text-gray-400 hover:text-forest-dark dark:hover:text-white transition-colors">
            <span className="material-symbols-outlined">
              <MdNotifications />
            </span>
            <span className="absolute top-0 right-0 size-2 bg-primary rounded-full border-2 border-white dark:border-background-dark"></span>
          </button>
          <div
            className="size-10 rounded-full bg-cover bg-center border-2 border-white dark:border-[#2a3c2d] shadow-sm"
            data-alt="User profile picture of a smiling woman"
          ></div>
        </div>
      </div>
    </header>
  )
}
