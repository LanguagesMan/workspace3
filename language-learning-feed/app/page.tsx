import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center text-white">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-7xl font-black mb-4 bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
            LangFlow
          </h1>
          <p className="text-2xl font-medium opacity-90">
            Learn languages through content you actually enjoy
          </p>
        </div>

        {/* Value proposition */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="text-5xl mb-3">🎯</div>
            <h3 className="text-xl font-bold mb-2">No More Boring Lessons</h3>
            <p className="text-white/80">
              Just swipe through viral videos, music, and articles
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="text-5xl mb-3">🧠</div>
            <h3 className="text-xl font-bold mb-2">Invisible Learning</h3>
            <p className="text-white/80">
              Our AI adapts to your level automatically
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
            <div className="text-5xl mb-3">⚡</div>
            <h3 className="text-xl font-bold mb-2">6 Months to Fluency</h3>
            <p className="text-white/80">
              Natural acquisition through immersion
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <Link
            href="/onboarding"
            className="px-12 py-6 bg-white text-purple-600 rounded-full font-bold text-xl hover:scale-105 transition-transform shadow-2xl"
          >
            Start Learning
          </Link>
          
          <Link
            href="/feed"
            className="px-12 py-6 bg-purple-900/50 backdrop-blur-md text-white rounded-full font-bold text-xl hover:scale-105 transition-transform border-2 border-white/30"
          >
            View Demo
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          <div>
            <div className="text-4xl font-black">40%+</div>
            <div className="text-sm opacity-80 mt-1">Daily retention</div>
          </div>
          <div>
            <div className="text-4xl font-black">20min</div>
            <div className="text-sm opacity-80 mt-1">Avg session</div>
          </div>
          <div>
            <div className="text-4xl font-black">80%</div>
            <div className="text-sm opacity-80 mt-1">Word retention</div>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-12 text-white/60 text-sm">
          <p>Join thousands learning languages the natural way</p>
        </div>
      </div>
    </main>
  )
}
