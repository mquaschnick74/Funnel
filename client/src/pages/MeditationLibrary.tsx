import { useState } from "react";
import { Link } from "wouter";

interface Meditation {
  id: string;
  name: string;
  type: string;
  voice: string;
  duration: string;
  description: string;
  audioUrl: string;
}

const meditations: Meditation[] = [
  {
    id: "sarah-campfire",
    name: "Campfire Meditation",
    type: "campfire",
    voice: "Sarah",
    duration: "8 minutes",
    description: "Find warmth and comfort as you visualize sitting by a peaceful campfire, letting the gentle crackling sounds soothe your mind.",
    audioUrl: "/meditations/sarah/campfire_meditation.mp3"
  },
  {
    id: "sarah-ocean",
    name: "Ocean Waves",
    type: "ocean",
    voice: "Sarah",
    duration: "10 minutes",
    description: "Let the rhythmic sound of ocean waves wash away stress and tension, bringing deep relaxation and clarity.",
    audioUrl: "/meditations/sarah/ocean_meditation.mp3"
  },
  {
    id: "sarah-singing-bowl",
    name: "Singing Bowl",
    type: "singing_bowl",
    voice: "Sarah",
    duration: "6 minutes",
    description: "Experience the healing vibrations of Tibetan singing bowls, promoting balance and inner harmony.",
    audioUrl: "/meditations/sarah/singing_bowl_meditation.mp3"
  },
  {
    id: "mathew-campfire",
    name: "Campfire Meditation",
    type: "campfire",
    voice: "Mathew",
    duration: "8 minutes",
    description: "Find warmth and comfort as you visualize sitting by a peaceful campfire, letting the gentle crackling sounds soothe your mind.",
    audioUrl: "/meditations/mathew/campfire_meditation.mp3"
  },
  {
    id: "mathew-ocean",
    name: "Ocean Waves",
    type: "ocean",
    voice: "Mathew",
    duration: "10 minutes",
    description: "Let the rhythmic sound of ocean waves wash away stress and tension, bringing deep relaxation and clarity.",
    audioUrl: "/meditations/mathew/ocean_meditation.mp3"
  },
  {
    id: "mathew-singing-bowl",
    name: "Singing Bowl",
    type: "singing_bowl",
    voice: "Mathew",
    duration: "6 minutes",
    description: "Experience the healing vibrations of Tibetan singing bowls, promoting balance and inner harmony.",
    audioUrl: "/meditations/mathew/singing_bowl_meditation.mp3"
  }
];

export default function MeditationLibrary() {
  const [selectedVoice, setSelectedVoice] = useState<"all" | "Sarah" | "Mathew">("all");

  const filteredMeditations = selectedVoice === "all"
    ? meditations
    : meditations.filter(m => m.voice === selectedVoice);

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
          Meditation Library
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
          Choose from our collection of guided meditations. Find a quiet space, put on your headphones,
          and allow yourself to simply be present.
        </p>

        {/* Voice Filter */}
        <div className="inline-flex bg-white rounded-lg p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setSelectedVoice("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedVoice === "all"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All Voices
          </button>
          <button
            onClick={() => setSelectedVoice("Sarah")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedVoice === "Sarah"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Sarah
          </button>
          <button
            onClick={() => setSelectedVoice("Mathew")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              selectedVoice === "Mathew"
                ? "bg-emerald-500 text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Mathew
          </button>
        </div>
      </section>

      {/* Meditation Cards */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMeditations.map((meditation) => (
            <div
              key={meditation.id}
              className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-emerald-100 shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {meditation.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-emerald-600 font-medium">
                      {meditation.voice}
                    </span>
                    <span className="text-sm text-gray-400">•</span>
                    <span className="text-sm text-gray-500">
                      {meditation.duration}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4">
                {meditation.description}
              </p>

              {/* Audio Player */}
              <div className="mt-4">
                <audio
                  controls
                  className="w-full h-12 rounded-lg"
                  style={{
                    filter: "sepia(20%) saturate(70%) grayscale(1) brightness(1.1) hue-rotate(120deg)"
                  }}
                >
                  <source src={meditation.audioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>

              {/* Download Button */}
              <div className="mt-4 flex justify-end">
                <a
                  href={meditation.audioUrl}
                  download
                  className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download
                </a>
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
