import { MdStar } from 'react-icons/md'
type Book = {
  id: number
  title: string
  author: string
  img: string
  rating: string
}
export default function BookCard({ book }: { book: Book }) {
  return (
    <div
      key={book.id}
      className="w-40 snap-start shrink-0 group cursor-pointer"
    >
      <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1 relative">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${book.img}')` }}
        ></div>
        <div className="absolute top-2 right-2 bg-white/90 dark:bg-black/80 backdrop-blur px-1.5 py-0.5 rounded text-[10px] font-bold flex items-center gap-0.5">
          <span className="material-symbols-outlined !text-[10px] text-yellow-500">
            <MdStar />
          </span>{' '}
          {book.rating}
        </div>
      </div>
      <h5 className="font-serif font-bold text-forest-dark dark:text-white leading-tight mb-1 truncate">
        {book.title}
      </h5>
      <p className="text-xs text-gray-500 dark:text-gray-400">{book.author}</p>
    </div>
  )
}
