import React from 'react'
import {
  MdChevronLeft,
  MdChevronRight,
  MdEmojiEvents,
  MdFormatQuote,
  MdMoreHoriz,
} from 'react-icons/md'
import WelcomeMessage from '../WelcomeMessage'
import ActiveBookCard from '../ActiveBookCard'
import DailyGoal from '../DailyGoal'
import BookCard from '../BookCard'

const ReadingDashboard = () => {
  // Dados simulados para as recomendações
  const recommendations = [
    {
      id: 1,
      title: 'Normal People',
      author: 'Sally Rooney',
      rating: '4.8',
      img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 2,
      title: 'Project Hail Mary',
      author: 'Andy Weir',
      rating: '4.9',
      img: 'https://images.unsplash.com/photo-1614544048536-0d28caf77f41?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 3,
      title: 'Circe',
      author: 'Madeline Miller',
      rating: '4.7',
      img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=200',
    },
    {
      id: 4,
      title: 'Dune',
      author: 'Frank Herbert',
      rating: '4.6',
      img: 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=200',
    },
  ]

  // Dados simulados para atividades
  const activities = [
    {
      id: 1,
      user: 'Sarah',
      action: 'finished reading',
      book: 'Dune',
      time: '2 hours ago',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    },
    {
      id: 2,
      user: 'Michael',
      action: 'started',
      book: 'Atomic Habits',
      time: '5 hours ago',
      avatar:
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    },
    {
      id: 3,
      user: 'David',
      action: 'rated',
      book: '1984',
      extra: '5 stars',
      time: '1 day ago',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    },
  ]

  return (
    <main className="flex-grow w-full max-w-7xl mx-auto px-6 lg:px-10 py-8 lg:py-12">
      {/* Welcome Heading */}
      <WelcomeMessage />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Primary Content (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-10">
          {/* Currently Reading Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-forest-dark ">
                Currently Reading
              </h3>
              <button className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                View All
              </button>
            </div>

            {/* Active Book Card */}
            <ActiveBookCard />
          </section>

          {/* Daily Goal Section */}
          <DailyGoal />

          {/* Recommendations Section */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-forest-dark dark:text-white">
                Recommended for You
              </h3>
              <div className="flex gap-2">
                <button className="size-8 rounded-full border border-gray-200 dark:border-[#2a3c2d] flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">
                    <MdChevronLeft />
                  </span>
                </button>
                <button className="size-8 rounded-full border border-gray-200 dark:border-[#2a3c2d] flex items-center justify-center text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <span className="material-symbols-outlined !text-[18px]">
                    <MdChevronRight />
                  </span>
                </button>
              </div>
            </div>

            {/* Scrollable Row */}
            <div className="flex gap-6 overflow-x-auto hide-scrollbar pb-4 snap-x">
              {recommendations.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}

              {/* Browse More Card */}
              <div className="w-40 snap-start shrink-0 group cursor-pointer">
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden mb-3 shadow-md group-hover:shadow-xl transition-all group-hover:-translate-y-1 relative bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <span className="material-symbols-outlined text-gray-300 !text-4xl">
                    <MdMoreHoriz />
                  </span>
                </div>
                <h5 className="font-serif font-bold text-forest-dark dark:text-white leading-tight mb-1 truncate">
                  Browse More
                </h5>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  View Category
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Sidebar (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          {/* 2024 Challenge Card */}
          <div className="bg-forest-dark rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10">
              <span className="material-symbols-outlined !text-[150px]">
                <MdEmojiEvents />
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <h3 className="font-bold text-lg">2024 Reading Challenge</h3>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold font-serif">12</span>
                <span className="text-gray-300 mb-1">/ 25 books</span>
              </div>
              <div className="w-full bg-white/20 h-2 rounded-full mb-4">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: '48%' }}
                ></div>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">
                You're on track! Read 2 more books this month to stay ahead.
              </p>
            </div>
          </div>

          {/* Community Activity */}
          <div className="bg-white dark:bg-[#1a2e1d] rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] dark:shadow-none border border-[#eef2f0] dark:border-[#2a3c2d]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-forest-dark dark:text-white">
                Friend Activity
              </h3>
              <button className="text-primary text-xs font-bold uppercase tracking-wider">
                View All
              </button>
            </div>
            <div className="flex flex-col gap-5">
              {activities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <div className="flex gap-3 items-start">
                    <div
                      className="size-8 rounded-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url('${activity.avatar}')` }}
                    ></div>
                    <div>
                      <p className="text-sm text-forest-dark dark:text-gray-200">
                        <span className="font-bold">{activity.user}</span>{' '}
                        {activity.action}{' '}
                        <span className="font-serif italic font-semibold">
                          {activity.book}
                        </span>
                        {activity.extra && ` ${activity.extra}`}.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                  {/* Don't show separator on last item */}
                  {index < activities.length - 1 && (
                    <hr className="border-dashed border-gray-100 dark:border-white/5" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Quote of the day */}
          <div className="p-6 border border-primary/20 bg-primary/5 rounded-2xl text-center">
            <span className="material-symbols-outlined text-primary/40 mb-2">
              <MdFormatQuote />
            </span>
            <p className="font-serif italic text-forest-dark dark:text-gray-200 text-sm leading-relaxed mb-3">
              "A reader lives a thousand lives before he dies. The man who never
              reads lives only one."
            </p>
            <p className="text-xs font-bold text-primary uppercase tracking-widest">
              — George R.R. Martin
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ReadingDashboard
