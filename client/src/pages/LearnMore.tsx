import { Link } from "wouter";

export default function LearnMore() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <img
            src="/ivasa-logo.png"
            alt="iVASA"
            className="h-10 w-auto"
          />
          <a
            href="https://beta.ivasa.ai/dashboard"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Resources for Your Journey
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-12">
          Explore our collection of guided meditations, educational videos, and therapeutic insights
          designed to support your ongoing growth and well-being.
        </p>
      </section>

      {/* Resource Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Meditation Library Card */}
          <Link href="/meditations">
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Meditation Library
              </h2>
              <p className="text-gray-600 mb-6">
                Guided meditations with soothing voices to help you find calm, focus, and inner peace.
              </p>
              <span className="inline-flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
                Listen Now
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Video Library Card */}
          <Link href="/videos">
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Video Library
              </h2>
              <p className="text-gray-600 mb-6">
                Educational videos and guided practices to deepen your understanding and enhance your sessions.
              </p>
              <span className="inline-flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
                Watch Now
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </Link>

          {/* Blog Card */}
          <a href="https://beta.ivasa.ai/blog" target="_blank" rel="noopener noreferrer">
            <div className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-emerald-100 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Blog & Articles
              </h2>
              <p className="text-gray-600 mb-6">
                Insightful articles on mental wellness, therapeutic techniques, and personal growth strategies.
              </p>
              <span className="inline-flex items-center text-emerald-600 font-medium group-hover:text-emerald-700">
                Read More
                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-600 mb-4">
            You're receiving this because you're part of the iVASA community.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm">
            <a
              href="https://beta.ivasa.ai/dashboard"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Dashboard
            </a>
            <a
              href="https://beta.ivasa.ai/dashboard"
              className="text-emerald-600 hover:text-emerald-700"
            >
              Email Preferences
            </a>
          </div>
          <p className="text-gray-400 text-xs mt-6">
            © 2025 iVASA. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
