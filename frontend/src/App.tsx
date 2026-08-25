import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { Activity, CircleDot } from "lucide-react"

import Playground from "@/components/Playground"
import Experiments from "@/components/Experiments"
import Chat from "@/components/Chat"

export default function App() {
  const [activeTab, setActiveTab] = useState("experiments") // default to experiments to show off the new UI
  const [historyCount, setHistoryCount] = useState(0)

  // Listen for history updates to update the badge
  useEffect(() => {
    const updateCount = () => {
      const saved = JSON.parse(localStorage.getItem('experimentHistory') || '[]')
      setHistoryCount(saved.length)
    }
    updateCount()
    window.addEventListener('experimentHistoryUpdated', updateCount)
    window.addEventListener('storage', (e) => {
      if (e.key === 'experimentHistory') updateCount()
    })
    return () => {
      window.removeEventListener('experimentHistoryUpdated', updateCount)
      window.removeEventListener('storage', updateCount)
    }
  }, [])

  return (
    <div className="flex h-screen bg-pokemon-bg text-zinc-50 font-sans selection:bg-pokemon-red/30 overflow-hidden">

      {/* Sidebar Navigation */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-800 bg-[#15151e] flex flex-col relative z-30">
        
        {/* Snorlax Background Mask */}
        <div 
          className="absolute top-0 left-0 w-full h-48 opacity-70 pointer-events-none"
          style={{
            backgroundImage: "url('/assets/pokemon/img15.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)"
          }}
        />

        {/* Logo Section */}
        <div className="p-6 flex flex-col gap-4 relative z-10 mt-36">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-zinc-700 shadow-[0_0_10px_rgba(255,204,0,0.2)] relative">
              <img
                src="/assets/pokemon/pokeball.png"
                alt="Logo"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  // Fallback if image not found
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    parent.innerHTML = '<div class="w-full h-full bg-pokemon-red flex items-center justify-center"><div class="w-full h-1/2 bg-white absolute bottom-0"></div><div class="w-8 h-1 bg-black absolute"></div><div class="w-3 h-3 rounded-full border-2 border-black bg-white z-10"></div></div>';
                  }
                }}
              />
            </div>
            <div className="flex flex-col leading-tight drop-shadow-md">
              <span className="font-retro text-[10px] text-zinc-100 tracking-wider">TOKEN</span>
              <span className="font-retro text-[10px] text-pokemon-yellow tracking-wider mt-1">OPT</span>
            </div>
          </div>

          {/* Decorative Colored Bars */}
          <div className="flex gap-1.5 h-1.5 mt-2 opacity-100">
            <div className="flex-1 bg-pokemon-red rounded-full" />
            <div className="flex-1 bg-pokemon-yellow rounded-full" />
            <div className="flex-1 bg-pokemon-green rounded-full" />
            <div className="flex-1 bg-[#4488ff] rounded-full" />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-4">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl transition-all font-retro text-[9px] tracking-wider ${activeTab === 'chat' ? 'bg-[#2a2a35] text-[#88aaff] border border-zinc-700 shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
              <img src="/assets/pokemon/img1.jpg" className="w-full h-full object-cover" alt="Chat" />
            </div>
            CHAT
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={`w-full flex items-center gap-4 px-3 py-2 rounded-xl transition-all font-retro text-[9px] tracking-wider ${activeTab === 'playground' ? 'bg-[#2a2a35] text-[#88aaff] border border-zinc-700 shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
              <img src="/assets/pokemon/img2.jpg" className="w-full h-full object-cover" alt="Playground" />
            </div>
            PLAYGROUND
          </button>

          <button
            onClick={() => setActiveTab('experiments')}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all font-retro text-[9px] tracking-wider ${activeTab === 'experiments' ? 'bg-[#2a2a35] text-[#ff6b6b] border border-zinc-700 shadow-md' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0 border border-zinc-700">
                <img src="/assets/pokemon/img3.jpg" className="w-full h-full object-cover" alt="History" />
              </div>
              HISTORY
            </div>
            {historyCount > 0 && (
              <span className={`px-2 py-0.5 rounded text-[8px] ${activeTab === 'experiments' ? 'bg-pokemon-red text-white' : 'bg-zinc-800 text-zinc-400'}`}>
                {historyCount}
              </span>
            )}
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-pokemon-bg">
        {/* Top Header (Status) */}
        <header className="h-14 border-b border-zinc-800/50 bg-[#15151e]/50 backdrop-blur flex items-center justify-end px-8 shrink-0">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-zinc-500 font-retro text-[8px]">
              <Activity className="w-3.5 h-3.5" />
              <span>localhost:11434</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <Badge variant="secondary" className="bg-zinc-900 border-zinc-700 text-zinc-300 font-retro text-[8px] tracking-wider py-1">
              <CircleDot className="w-2 h-2 mr-2 text-pokemon-green animate-pulse" />
              llama3.2:3b
            </Badge>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <div className="max-w-6xl mx-auto w-full h-full">
            <div className={`${activeTab === 'chat' ? 'block h-full' : 'hidden'} outline-none`}>
              <Chat />
            </div>
            <div className={`${activeTab === 'playground' ? 'block h-full' : 'hidden'} outline-none`}>
              <Playground />
            </div>
            <div className={`${activeTab === 'experiments' ? 'block h-full' : 'hidden'} outline-none`}>
              <Experiments />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
