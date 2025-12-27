import { MdEditNote, MdLocalFireDepartment } from 'react-icons/md'

export default function ActiveBookCard() {
  return (
    <div className="bg-white dark:bg-[#1a2e1d] rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-none border border-[#eef2f0] dark:border-[#2a3c2d] flex flex-col md:flex-row gap-6 md:gap-8 items-start md:items-center group hover:border-primary/30 transition-all duration-300">
      {/* Book Cover */}
      <div className="relative w-32 md:w-40 shrink-0 aspect-[2/3] rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300')",
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-serif text-2xl font-bold text-forest-dark dark:text-white mb-1">
              The Midnight Library
            </h4>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              Matt Haig
            </p>
          </div>
          <span className="hidden sm:flex bg-forest-light dark:bg-white/10 text-forest-dark dark:text-white text-xs font-bold px-3 py-1 rounded-full items-center gap-1">
            <span className="material-symbols-outlined !text-[14px]">
              <MdLocalFireDepartment />
            </span>
            Streak: 4 days
          </span>
        </div>

        <div className="mt-6 md:mt-8">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span className="text-forest-dark dark:text-gray-200">
              Progress
            </span>
            <span className="text-primary">45%</span>
          </div>
          <div className="h-3 w-full bg-[#f0f4f1] dark:bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full"
              style={{ width: '45%' }}
            ></div>
          </div>
          <p className="text-xs text-gray-400 mt-2 text-right">
            Page 130 of 288
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <button className="flex-1 md:flex-none bg-primary hover:bg-primary/90 text-white font-bold py-3 px-8 rounded-xl transition-transform active:scale-95 shadow-lg shadow-primary/20">
            Continue Reading
          </button>
          <button
            className="flex items-center justify-center size-12 rounded-xl border border-gray-200 dark:border-[#3a4d3d] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            title="Add Note"
          >
            <span className="material-symbols-outlined">
              <MdEditNote />
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
