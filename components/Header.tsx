import React from 'react'

export default function Header() {
  const now = new Date()
  const hour = now.getHours()

  let message
  message = hour < 12 ? 'Bom dia!' : hour < 18 ? 'Boa tarde!' : 'Boa noite!'

  const [text, setText] = React.useState<string>(message)

  React.useEffect(() => {
    const t = setTimeout(() => setText('kuaa'), 3000)
    return () => clearTimeout(t)
  }, [message])
  return (
    <header className="bg-[#F3EFE9] border-b border-[#E6DCD0] border-gray-200 sticky top-0 z-30 shadow-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="">
            <img
              src="./assets/logo.png"
              alt="Kuaa Logo"
              width={60}
              height={60}
            />
          </div>

          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            {text}
          </h1>
        </div>
      </div>
    </header>
  )
}
