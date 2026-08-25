import { useEffect, useState } from 'react'
import { Copy, ArrowDown, Trash2, ChevronDown } from 'lucide-react'

export default function Experiments() {
  const [history, setHistory] = useState<any[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'DATE' | 'RATIO' | 'SAVED'>('DATE')

  useEffect(() => {
    const loadHistory = () => {
      const saved = localStorage.getItem('experimentHistory')
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    }
    
    loadHistory()
    window.addEventListener('experimentHistoryUpdated', loadHistory)
    window.addEventListener('storage', (e) => {
      if (e.key === 'experimentHistory') loadHistory()
    })
    
    return () => {
      window.removeEventListener('experimentHistoryUpdated', loadHistory)
      window.removeEventListener('storage', loadHistory)
    }
  }, [])

  const deleteExperiment = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const updated = history.filter(run => run.id !== id);
    setHistory(updated);
    localStorage.setItem('experimentHistory', JSON.stringify(updated));
    // Dispatch event so other components (if any) can sync
    window.dispatchEvent(new Event('experimentHistoryUpdated'));
  };

  const avgCompression = history.length > 0 
    ? (history.reduce((acc, run) => acc + run.reduction, 0) / history.length).toFixed(1) 
    : "0.0";
  const tokensSaved = history.reduce((acc, run) => acc + (run.original - run.optimized), 0);
  const costSaved = (tokensSaved * 0.000002).toFixed(5);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  }

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === 'DATE') {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === 'RATIO') {
      return b.reduction - a.reduction;
    } else if (sortBy === 'SAVED') {
      return (b.original - b.optimized) - (a.original - a.optimized);
    }
    return 0;
  });

  return (
    <div className="flex flex-col gap-6 p-2 text-zinc-300 font-sans animate-in fade-in duration-500">
      
      {/* Top Banner Section */}
      <div className="relative rounded-2xl overflow-hidden bg-[#111118] border border-zinc-800/80 shadow-2xl pb-16">
        
        {/* Banner Background Image */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: "url('/assets/pokemon/img16.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center 20%",
            maskImage: "linear-gradient(to bottom, black 40%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 40%, transparent 100%)"
          }}
        />

        {/* Banner Content */}
        <div className="relative z-10 flex justify-between items-start p-8">
          <div className="flex flex-col">
            <h2 className="text-2xl font-retro text-zinc-100 uppercase tracking-wider mb-2 drop-shadow-md">EXPERIMENT HISTORY</h2>
            <p className="text-xs text-[#88aaff] font-mono drop-shadow">{history.length} experiments recorded</p>
          </div>
          
          {/* Character Image */}
          <div className="w-32 h-32 bg-white rounded-full overflow-hidden p-2 shadow-[0_0_20px_rgba(255,255,255,0.01)] -translate-y-6">
            <img src="/assets/pokemon/img12.jpg" alt="Character" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>

        {/* Stat Cards - Layered over the banner */}
        <div className="absolute bottom-6 left-8 right-8 grid grid-cols-4 gap-6 z-20">
          <div className="bg-[#15151e]/90 backdrop-blur border border-zinc-700/50 rounded-xl p-4 flex flex-col justify-center shadow-lg">
            <span className="text-[9px] font-retro text-zinc-400 mb-2 tracking-widest">EXPERIMENTS</span>
            <span className="text-xl font-retro text-zinc-100 drop-shadow">{history.length}</span>
          </div>
          <div className="bg-[#15151e]/90 backdrop-blur border border-pokemon-yellow/30 rounded-xl p-4 flex flex-col justify-center shadow-lg shadow-pokemon-yellow/5">
            <span className="text-[9px] font-retro text-zinc-400 mb-2 tracking-widest">AVG COMPRESSION</span>
            <span className="text-xl font-retro text-pokemon-yellow drop-shadow">{avgCompression}%</span>
          </div>
          <div className="bg-[#15151e]/90 backdrop-blur border border-pokemon-green/30 rounded-xl p-4 flex flex-col justify-center shadow-lg shadow-pokemon-green/5">
            <span className="text-[9px] font-retro text-zinc-400 mb-2 tracking-widest">TOKENS SAVED</span>
            <span className="text-xl font-retro text-pokemon-green drop-shadow">{tokensSaved}</span>
          </div>
          <div className="bg-[#15151e]/90 backdrop-blur border border-[#4488ff]/30 rounded-xl p-4 flex flex-col justify-center shadow-lg shadow-[#4488ff]/5">
            <span className="text-[9px] font-retro text-zinc-400 mb-2 tracking-widest">COST SAVED</span>
            <span className="text-xl font-retro text-[#4488ff] drop-shadow">${costSaved}</span>
          </div>
        </div>
      </div>

      {/* Filter Buttons & Sort */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          {/* Filters removed */}
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[9px] font-retro text-zinc-500 tracking-wider">FILTER BY : </span>
          <div className="relative">
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="pl-3 pr-8 py-1.5 bg-[#88aaff]/10 hover:bg-[#88aaff]/20 text-[#88aaff] border border-[#88aaff]/30 rounded text-[9px] font-retro tracking-wider shadow-[0_0_10px_rgba(136,170,255,0.1)] outline-none cursor-pointer appearance-none transition-colors"
            >
              <option value="DATE" className="bg-[#15151e] text-zinc-300">UP TO DATE</option>
              <option value="RATIO" className="bg-[#15151e] text-zinc-300">RATIO</option>
              <option value="SAVED" className="bg-[#15151e] text-zinc-300">SAVED TOKENS</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#88aaff] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-[#15151e] border border-zinc-800 rounded-xl overflow-hidden mt-2 flex flex-col shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-800/80 bg-[#111118]">
          <div className="col-span-4 text-[9px] font-retro text-zinc-500 tracking-wider">PROMPT</div>
          <div className="col-span-2 text-[9px] font-retro text-zinc-500 tracking-wider">TECHNIQUE</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-center">ORIG</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-center">OPT</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-center">SAVED</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-center">RATIO</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-right">DATE</div>
          <div className="col-span-1 text-[9px] font-retro text-zinc-500 tracking-wider text-center"></div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-zinc-800/40">
          {sortedHistory.map((run) => (
            <div key={run.id} className="flex flex-col group/row">
              {/* Row */}
              <div 
                onClick={() => setExpandedId(expandedId === run.id ? null : run.id)}
                className={`grid grid-cols-12 gap-4 px-6 py-5 items-center cursor-pointer transition-colors ${expandedId === run.id ? 'bg-zinc-800/30' : 'hover:bg-zinc-800/10'}`}
              >
                <div className="col-span-4 text-sm text-zinc-300 truncate pr-4">{run.prompt}</div>
                
                <div className="col-span-2 flex items-center">
                  <span className="border border-pokemon-yellow/50 bg-pokemon-yellow/10 text-pokemon-yellow font-retro text-[8px] px-2.5 py-1.5 rounded uppercase tracking-wider shadow-[0_0_5px_rgba(255,204,0,0.1)]">
                    AUTO-COMPRESS
                  </span>
                </div>
                
                <div className="col-span-1 text-sm font-retro text-pokemon-red text-center">{run.original}</div>
                <div className="col-span-1 text-sm font-retro text-[#4488ff] text-center">{run.optimized}</div>
                <div className="col-span-1 text-sm font-retro text-pokemon-green flex items-center justify-center gap-1">
                  <ArrowDown className="w-3 h-3 text-pokemon-green/70" />
                  {run.original - run.optimized}
                </div>
                <div className="col-span-1 text-[10px] font-retro text-pokemon-yellow text-center bg-pokemon-yellow/10 border border-pokemon-yellow/20 rounded py-1">{run.reduction}%</div>
                <div className="col-span-1 text-[10px] font-mono text-zinc-300 text-right uppercase tracking-wider">{run.date?.split(',')[0] || "8/25/2026"}</div>
                
                <div className="col-span-1 flex items-center justify-center">
                  <button 
                    onClick={(e) => deleteExperiment(e, run.id)}
                    className="p-2 bg-zinc-800/50 hover:bg-pokemon-red/20 text-zinc-500 hover:text-pokemon-red rounded-md transition-colors border border-transparent hover:border-pokemon-red/30"
                    title="Delete experiment"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              {/* Expanded Area */}
              {expandedId === run.id && (
                <div className="bg-[#111118] border-t border-zinc-800/50 p-6 grid grid-cols-2 gap-8 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "url('/assets/pokemon/img6.jpg')", backgroundSize: "cover", backgroundPosition: "center" }} />
                  
                  {/* Original */}
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="inline-flex">
                      <span className="bg-pokemon-red/10 border border-pokemon-red/30 text-pokemon-red font-retro text-[9px] px-3 py-1.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(255,68,68,0.1)]">
                        Original
                      </span>
                    </div>
                    <div className="relative group bg-[#15151e]/80 backdrop-blur border border-pokemon-red/20 rounded-lg p-4 h-48 overflow-y-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(run.fullOriginal); }}
                        className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-zinc-700/50"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-sm text-zinc-400 whitespace-pre-wrap leading-relaxed">{run.fullOriginal || "No original prompt available."}</p>
                    </div>
                  </div>
                  
                  {/* Optimized */}
                  <div className="flex flex-col gap-3 relative z-10">
                    <div className="inline-flex">
                      <span className="bg-[#4488ff]/10 border border-[#4488ff]/30 text-[#4488ff] font-retro text-[9px] px-3 py-1.5 rounded uppercase tracking-wider shadow-[0_0_10px_rgba(68,136,255,0.1)]">
                        Optimized
                      </span>
                    </div>
                    <div className="relative group bg-[#15151e]/80 backdrop-blur border border-[#4488ff]/20 rounded-lg p-4 h-48 overflow-y-auto">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleCopy(run.fullOptimized); }}
                        className="absolute top-2 right-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-zinc-700/50"
                        title="Copy text"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-medium">{run.fullOptimized || "No optimized prompt available."}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {history.length === 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-zinc-500 gap-4">
              <span className="font-retro text-4xl opacity-20">?</span>
              <p className="font-mono text-sm">No experiments recorded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
