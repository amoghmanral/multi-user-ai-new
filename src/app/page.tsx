import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#CDE3CE] to-[#FAF9F6]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/85 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-20 h-full flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-[#A8C3A0] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <span className="font-semibold text-xl text-[#2D2D2D]">ChatSpace</span>
          </div>
          
          {/* Auth Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-[#2D2D2D] hover:text-[#A8C3A0] transition-colors">
              Login
            </button>
            <button className="bg-[#A8C3A0] hover:bg-[#9BB396] text-white px-6 py-2 rounded-full transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 min-h-[70vh] flex items-center">
        <div className="max-w-7xl mx-auto px-20 grid grid-cols-2 gap-16 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            <h1 className="text-5xl font-bold text-[#2D2D2D] leading-tight">
              A new way to chat with people and AI — together.
            </h1>
            <p className="text-xl text-[#2D2D2D] leading-relaxed">
              Collaborative conversations with friends, teams, and an AI facilitator that only joins when it should.
            </p>
            <div className="space-y-4">
              <Link href="/user-setup">
                <button className="bg-[#A8C3A0] hover:bg-[#9BB396] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                  Enter Chat
                </button>
              </Link>
              <div>
                <a href="#features" className="text-[#A8C3A0] hover:text-[#9BB396] font-medium transition-colors">
                  Learn More →
                </a>
              </div>
            </div>
          </div>

          {/* Right Column - Mock Chat UI */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 pb-4 border-b border-gray-200">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-sm text-gray-500 ml-4">Team Chat</span>
              </div>
              
              <div className="space-y-3">
                <div className="bg-[#F3F1EB] border border-gray-200 px-4 py-3 rounded-2xl text-[#2D2D2D]">
                  Hey team, can we discuss the Q4 roadmap?
                </div>
                <div className="bg-[#F3F1EB] border border-gray-200 px-4 py-3 rounded-2xl text-[#2D2D2D]">
                  Sure! I have some ideas about the mobile features.
                </div>
                <div className="bg-[#D9EAD3] px-4 py-3 rounded-2xl text-[#2D2D2D]">
                  <strong>AI Assistant:</strong> I can help summarize your previous Q3 decisions to inform the roadmap discussion. Would that be helpful?
                </div>
              </div>
              
              <div className="pt-4">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="w-full border border-gray-200 rounded-full px-4 py-3 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#A8C3A0]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section id="features" className="py-20 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-20">
          <div className="grid grid-cols-2 gap-8">
            {/* Multi-User Rooms */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-[#A8C3A0] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.165-1.294-.478-1.857m0 0A5.002 5.002 0 0012 13a5.002 5.002 0 00-4.522 2.143M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.165-1.294.478-1.857m0 0A5.002 5.002 0 0112 13a5.002 5.002 0 014.522 2.143M12 13V2m0 11a5.002 5.002 0 01-4.522-2.143M12 13V2m0 11a5.002 5.002 0 014.522-2.143M12 2c-2.485 0-4.5 2.015-4.5 4.5S9.515 11 12 11s4.5-2.015 4.5-4.5S14.485 2 12 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">Multi-User Rooms</h3>
              <p className="text-sm text-gray-600">Group chat that remembers.</p>
            </div>

            {/* AI Facilitator */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-[#A8C3A0] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2zM12 13a3 3 0 100-6 3 3 0 000 6z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">AI Facilitator</h3>
              <p className="text-sm text-gray-600">AI that only speaks when needed.</p>
            </div>

            {/* File Insights */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-[#A8C3A0] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">File Insights</h3>
              <p className="text-sm text-gray-600">Drop files, get instant context.</p>
            </div>

            {/* Smart Tools */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-10 h-10 bg-[#A8C3A0] rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
              </div>
              <h3 className="text-lg font-bold text-[#2D2D2D] mb-2">Smart Tools</h3>
              <p className="text-sm text-gray-600">Summaries, forks, message tags.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot/Mockup Showcase */}
      <section className="py-20 bg-gradient-to-b from-[#FAF9F6] to-[#CDE3CE]">
        <div className="max-w-4xl mx-auto px-20 text-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl">
            <div className="space-y-4">
              <div className="bg-[#F3F1EB] border border-gray-200 px-4 py-3 rounded-2xl text-[#2D2D2D] max-w-md mx-auto">
                Hey team, can we discuss the Q4 roadmap?
              </div>
              <div className="bg-[#D9EAD3] px-4 py-3 rounded-2xl text-[#2D2D2D] max-w-md mx-auto">
                <strong>AI Assistant:</strong> I can help summarize your previous Q3 decisions to inform the roadmap discussion. Would that be helpful?
              </div>
            </div>
            <p className="text-[#2D2D2D] mt-6 text-lg">
              The chat experience — simple, clean, and AI-enabled.
            </p>
          </div>
        </div>
      </section>

      {/* Footer Call-to-Action */}
      <section className="py-20 bg-gradient-to-b from-[#FDFCF9] to-[#CDE3CE]">
        <div className="max-w-4xl mx-auto px-20 text-center">
          <h2 className="text-4xl font-bold text-[#2D2D2D] mb-8">
            Start a conversation today.
          </h2>
          <Link href="/user-setup">
            <button className="bg-[#A8C3A0] hover:bg-[#9BB396] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              Get Started
            </button>
          </Link>
        </div>
      </section>

      {/* Footer Navigation */}
      <footer className="bg-[#CDE3CE] py-8">
        <div className="max-w-7xl mx-auto px-20 text-center">
          <div className="flex justify-center space-x-8 text-sm text-[#2D2D2D]">
            <a href="#" className="hover:text-[#A8C3A0] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#A8C3A0] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#A8C3A0] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}