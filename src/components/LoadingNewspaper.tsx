'use client'

const STEPS = [
  'Reading today\'s news…',
  'Picking the best stories…',
  'Writing in kid-friendly language…',
  'Adding fun facts…',
  'Almost ready!',
]

export default function LoadingNewspaper() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6 font-albert px-4">

      {/* Bouncing logo */}
      <div className="animate-bounce">
        <img src="/images/icon-newspaper.png" alt="Edition Kids" className="h-20 w-auto" />
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="font-baskerville italic text-2xl text-[#1c1c1a] mb-1">
          Building your paper…
        </h2>
        <p className="text-[#4a4a48] text-sm">
          This takes up to 2 minutes the first time. Hang tight!
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-2">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-[#4f6b4f] animate-pulse"
            style={{ animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>

      {/* Steps list */}
      <ul className="flex flex-col gap-2">
        {STEPS.map((msg, i) => (
          <li key={i} className="flex items-center gap-2 text-sm text-[#4a4a48]">
            <span className="text-[#4f6b4f] font-bold">✓</span>
            {msg}
          </li>
        ))}
      </ul>

    </div>
  )
}
