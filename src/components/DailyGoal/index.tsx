import { MdTimer } from 'react-icons/md'

export default function DailyGoal() {
  return (
    <section>
      <div className="bg-[#eaf3eb] dark:bg-[#142617] rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        {/* Decorative Abstract Shape */}
        <div className="absolute -right-10 -top-10 size-40 bg-primary/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="size-14 rounded-full bg-white dark:bg-[#1a2e1d] flex items-center justify-center shadow-sm text-primary">
            <span className="material-symbols-outlined !text-[28px]">
              <MdTimer />
            </span>
          </div>
          <div>
            <h4 className="font-bold text-lg text-forest-dark dark:text-white">
              Daily Reading Goal
            </h4>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              You've read{' '}
              <span className="font-bold text-primary">15 mins</span> out of 30
              mins today.
            </p>
          </div>
        </div>

        <div className="relative z-10 w-full md:w-auto min-w-[200px]">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-white/50 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: '50%' }}
              ></div>
            </div>
            <span className="font-bold text-forest-dark dark:text-white text-sm">
              50%
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
