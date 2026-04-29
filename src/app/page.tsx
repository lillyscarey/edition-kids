import Link from 'next/link'

const TOPICS = [
  { emoji: '🚀', label: 'Space & Rockets', pill: 'bg-blue-50 border-blue-200 text-blue-800'      },
  { emoji: '🤖', label: 'Gadgets',         pill: 'bg-blue-50 border-blue-200 text-blue-800'      },
  { emoji: '🦁', label: 'Animals',         pill: 'bg-green-50 border-green-200 text-green-800'   },
  { emoji: '🌎', label: 'Earth & Oceans',  pill: 'bg-green-50 border-green-200 text-green-800'   },
  { emoji: '🔬', label: 'Cool Science',    pill: 'bg-green-50 border-green-200 text-green-800'   },
  { emoji: '🏈', label: 'Football',        pill: 'bg-orange-50 border-orange-200 text-orange-800'},
  { emoji: '🏀', label: 'Basketball',      pill: 'bg-orange-50 border-orange-200 text-orange-800'},
  { emoji: '⚾', label: 'Baseball',        pill: 'bg-orange-50 border-orange-200 text-orange-800'},
  { emoji: '⚽', label: 'Soccer',          pill: 'bg-orange-50 border-orange-200 text-orange-800'},
  { emoji: '🎬', label: 'Movies & TV',     pill: 'bg-purple-50 border-purple-200 text-purple-800'},
  { emoji: '🎵', label: 'Music',           pill: 'bg-purple-50 border-purple-200 text-purple-800'},
  { emoji: '🍕', label: 'Food',            pill: 'bg-purple-50 border-purple-200 text-purple-800'},
  { emoji: '📚', label: 'Books',           pill: 'bg-purple-50 border-purple-200 text-purple-800'},
  { emoji: '🎨', label: 'Art & Design',    pill: 'bg-purple-50 border-purple-200 text-purple-800'},
  { emoji: '🌍', label: 'Climate',         pill: 'bg-yellow-50 border-yellow-200 text-yellow-800'},
]

const STEPS = [
  {
    image: '/images/pick-their-topics.png',
    alt: 'Pick their topics',
    title: 'Pick their topics.',
    description: 'Choose the subjects they care about. Edition Kids is built around their interests.',
  },
  {
    image: '/images/curated-while-you-sleep.png',
    alt: 'Curated while you sleep',
    title: 'Curated while you sleep.',
    description: 'Sourced, written at their reading level, and delivered. All before your alarm goes off.',
  },
  {
    image: '/images/ready-to-read.png',
    alt: 'Ready to read',
    title: 'Ready to read.',
    description: 'Print or open it on any screen. Edition Kids is designed to get them off their devices and engaged with the world.',
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page font-albert" style={{ color: '#1c1c1a' }}>

      {/* ── Nav: logo left · sign-in + CTA right, single row ── */}
      <header className="sticky top-0 z-50 bg-page border-b border-[#ded4c4]">
        <div className="max-w-5xl mx-auto px-6 h-32 flex items-center justify-between">
          <Link href="/" className="flex-shrink-0">
            <img
              src="/images/logo.png"
              alt="Edition Kids"
              className="h-28 w-auto"
            />
          </Link>
          <nav className="flex items-center gap-3 sm:gap-5">
            <Link
              href="/sign-in"
              className="text-[11px] font-semibold uppercase tracking-[1.2px] text-[#4a4a48] hover:text-[#1c1c1a] transition-colors hidden sm:inline"
            >
              Sign In
            </Link>
            <Link
              href="/sign-in"
              className="text-[11px] font-semibold text-[#4a4a48] hover:text-[#1c1c1a] transition-colors sm:hidden"
            >
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className="inline-flex items-center justify-center h-9 px-5 bg-[#4f6b4f] text-white text-[11px] font-bold uppercase tracking-[1.2px] rounded-full hover:bg-[#3d5a3d] transition-colors whitespace-nowrap"
            >
              Get Started
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="max-w-3xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-block bg-blue-50 text-blue-700 text-[11px] font-semibold uppercase tracking-[1.5px] px-3 py-1 rounded-full mb-8">
          Personalized for ages 8–12
        </div>
        <h1 className="font-baskerville italic text-[clamp(42px,7vw,76px)] leading-[1.05] tracking-[-0.02em] text-[#1c1c1a] mb-6">
          News for Curious Minds
        </h1>
        <p className="text-[#5b7f96] text-xl sm:text-2xl leading-snug mb-10 max-w-xl mx-auto font-albert" style={{ fontWeight: 400 }}>
          Their daily newspaper. Designed for print. At the reading level you choose.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/sign-up"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 bg-[#1c1c1a] text-white text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:bg-[#b35c44] transition-colors"
          >
            Start reading for free
          </Link>
          <Link
            href="/sign-in"
            className="w-full sm:w-auto inline-flex items-center justify-center h-12 px-8 border border-[#ded4c4] text-[#4a4a48] text-[11px] font-semibold uppercase tracking-[1.2px] rounded-full hover:border-[#1c1c1a] transition-colors"
          >
            I already have an account
          </Link>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="bg-white border-y border-[#ded4c4] py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[11px] font-semibold uppercase tracking-[3px] text-[#4a4a48] mb-16">
            How it works
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-14 sm:gap-10">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center">
                <div className="w-full flex justify-center mb-6">
                  <img
                    src={step.image}
                    alt={step.alt}
                    className="w-72 h-96 object-cover rounded-xl"
                  />
                </div>
                <h3 className="font-baskerville italic text-[26px] leading-snug text-[#1c1c1a] mb-3">
                  {step.title}
                </h3>
                <p className="text-[#4a4a48] text-base leading-relaxed max-w-[260px]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample edition preview (below how it works) ── */}
      <section className="max-w-2xl mx-auto px-6 py-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-[#ded4c4]" />
          <p className="text-[11px] uppercase tracking-[2px] font-semibold text-[#4a4a48] whitespace-nowrap">
            Here&apos;s what an edition looks like
          </p>
          <div className="flex-1 h-px bg-[#ded4c4]" />
        </div>
        <div className="bg-white border border-[#ded4c4] rounded-2xl p-6 shadow-sm">
          <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full mb-4">
            🔬 Science
          </span>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#1c1c1a] leading-snug mb-3">
            Scientists Discover Ants Can Teach Each Other New Routes Home
          </h3>
          <div className="w-10 h-0.5 bg-[#daad42] mb-3" />
          <p className="text-sm text-[#4a4a48] leading-relaxed mb-5">
            Researchers filmed a group of ants in the UK discovering a new shortcut through a garden.
            What surprised scientists was that older ants slowed down to let younger ants follow and
            learn the path — almost like a teacher walking a student to class. This kind of teaching
            behavior was once thought to belong only to humans and a few other large animals.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3">
            <span className="text-lg leading-none mt-0.5">💡</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-yellow-700 mb-1">Did You Know?</p>
              <p className="text-sm text-[#4a4a48] leading-relaxed">
                A single ant colony can contain up to 20 million ants — and they all find their way
                home without GPS or Google Maps!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Topics strip ── */}
      <section className="border-y border-[#ded4c4] py-8 overflow-hidden" style={{ background: '#f4f1ea' }}>
        <p className="text-center text-[11px] text-[#4a4a48] uppercase tracking-[2px] font-semibold mb-5">
          Choose from topics like these
        </p>
        <div className="flex flex-wrap justify-center gap-2 px-6">
          {TOPICS.map(t => (
            <span
              key={t.label}
              className={`flex items-center gap-1.5 border text-sm font-medium px-3 py-1.5 rounded-full ${t.pill}`}
            >
              <span>{t.emoji}</span> {t.label}
            </span>
          ))}
        </div>
      </section>

      {/* ── Final CTA — restrained, paper bg ── */}
      <section className="py-24 px-6 text-center bg-page">
        <div className="max-w-xl mx-auto">
          <h2 className="font-baskerville italic text-[38px] sm:text-[44px] leading-tight text-[#1c1c1a] mb-8">
            Ready for your first edition?
          </h2>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center h-12 px-8 bg-[#1c1c1a] text-white text-[11px] font-bold uppercase tracking-[1.5px] rounded-full hover:bg-[#b35c44] transition-colors"
          >
            Create my paper
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#ded4c4] py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#4a4a48]">
          <p className="font-medium">
            © {new Date().getFullYear()} Edition Kids · News made for curious minds
          </p>
          <nav className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-[#1c1c1a] transition-colors">
              Privacy Policy
            </Link>
            <span aria-hidden="true" className="text-[#ded4c4]">·</span>
            <Link href="/terms" className="hover:text-[#1c1c1a] transition-colors">
              Terms of Use
            </Link>
          </nav>
        </div>
      </footer>

    </div>
  )
}
