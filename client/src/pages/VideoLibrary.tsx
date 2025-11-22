import { Link } from "wouter";

interface Video {
  id: string;
  youtubeId: string;
  title: string;
  description: string;
  category: string;
}

const videos: Video[] = [
  {
    id: "intro-therapeutic",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Introduction to Therapeutic Practice",
    description: "Learn the foundations of our therapeutic approach and how it can support your mental wellness journey.",
    category: "Getting Started"
  },
  {
    id: "inner-landscape",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Understanding Your Inner Landscape",
    description: "Explore the assessment framework and discover insights about your emotional patterns.",
    category: "Education"
  },
  {
    id: "guided-meditation",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Guided Meditation Practice",
    description: "A 10-minute guided meditation session to help you cultivate presence and inner peace.",
    category: "Practice"
  },
  {
    id: "breathing-techniques",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Breathing Techniques for Calm",
    description: "Learn powerful breathing exercises to reduce anxiety and promote relaxation.",
    category: "Practice"
  },
  {
    id: "cognitive-patterns",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Recognizing Cognitive Patterns",
    description: "Understand how thought patterns influence emotions and learn to create positive change.",
    category: "Education"
  },
  {
    id: "self-compassion",
    youtubeId: "dQw4w9WgXcQ", // Replace with real video
    title: "Cultivating Self-Compassion",
    description: "Discover practices for developing kindness toward yourself and building emotional resilience.",
    category: "Practice"
  }
];

const categories = ["All", "Getting Started", "Education", "Practice"];

export default function VideoLibrary() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/learn-more">
              <button className="text-gray-500 hover:text-gray-700 p-2 -ml-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>
            <img
              src="/ivasa-logo.png"
              alt="iVASA"
              className="h-10 w-auto"
            />
          </div>
          <a
            href="https://beta.ivasa.ai/dashboard"
            className="text-emerald-600 hover:text-emerald-700 font-medium text-sm"
          >
            Go to Dashboard
          </a>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
          Video Library
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Educational videos and guided practices to deepen your understanding
          and enhance your therapeutic journey.
        </p>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <span
              key={category}
              className="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 cursor-pointer transition-colors"
            >
              {category}
            </span>
          ))}
        </div>
      </section>

      {/* Video Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <div
              key={video.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl overflow-hidden border border-emerald-100 shadow-lg"
            >
              {/* YouTube Embed */}
              <div className="aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${video.youtubeId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              {/* Video Info */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {video.title}
                  </h3>
                </div>
                <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded mb-3">
                  {video.category}
                </span>
                <p className="text-gray-600 text-sm">
                  {video.description}
                </p>
              </div>
            </div>
          ))}
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
