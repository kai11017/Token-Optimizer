import { useState } from "react"
import { Play, Loader2 } from "lucide-react"

import PromptDiff from "./PromptDiff"
import ComparisonPanels from "./ComparisonPanels"

const DEMO_PROMPT = `Could you please help me write a Python function that can calculate the Fibonacci sequence up to a given number n? I want it to be efficient and well-commented.`

export default function Playground() {
  const [prompt, setPrompt] = useState(DEMO_PROMPT)
  const [isRunning, setIsRunning] = useState(false)
  const [hasResults, setHasResults] = useState(false)
  const [resultsData, setResultsData] = useState<any>(null)
  
  const [technique, setTechnique] = useState("Auto-Compress")
  const [tag, setTag] = useState("code")

  const charCount = prompt.length
  const estimatedTokens = Math.ceil(charCount / 4)

  const handleRun = async () => {
    if (!prompt.trim()) return
    
    setIsRunning(true)
    setHasResults(false)
    
    try {
      const res = await fetch('http://localhost:3000/api/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: 'llama3' })
      })
      
      if (!res.ok) throw new Error('API request failed')
      const data = await res.json()
      setResultsData(data)
      setHasResults(true)
      
      // Save to localStorage
      try {
        const reductionPct = data.metrics?.reduction_percentage || 0;
        const similarity = data.similarityScore ?? 0;
        let status = 'Good';
        if (reductionPct >= 30 && similarity >= 85) status = 'Excellent';
        else if (similarity < 50) status = 'Regression';

        const origLat = data.original?.latency || 0;
        const optLat = data.optimized?.latency || 0;
        const latencyDiff = origLat > 0 ? ((optLat - origLat) / origLat * 100).toFixed(1) : 0;

        const newExp = {
          id: `EXP-${Math.floor(Math.random() * 9000) + 1000}`,
          prompt: prompt.substring(0, 50) + (prompt.length > 50 ? '...' : ''),
          fullOriginal: data.original?.prompt || prompt,
          fullOptimized: data.optimized?.prompt || '',
          model: 'Llama 3',
          original: data.metrics?.original_tokens || 0,
          optimized: data.metrics?.optimized_tokens || 0,
          reduction: reductionPct,
          quality: similarity,
          latency: latencyDiff,
          date: new Date().toLocaleDateString('en-US'),
          status
        };
        const existingHistory = JSON.parse(localStorage.getItem('experimentHistory') || '[]');
        localStorage.setItem('experimentHistory', JSON.stringify([newExp, ...existingHistory]));
        window.dispatchEvent(new Event('experimentHistoryUpdated'));
      } catch(e) {
        console.error('Failed to save experiment to history', e);
      }

    } catch (error) {
      console.error(error)
      alert('Failed to run comparison. Is the backend running?')
    } finally {
      setIsRunning(false)
    }
  }

  // Fallback calculations for Dex
  const origTokens = hasResults ? resultsData?.metrics?.original_tokens : estimatedTokens;
  const optTokens = hasResults ? resultsData?.metrics?.optimized_tokens : 0;
  const savedTokens = hasResults ? origTokens - optTokens : 0;
  const ratio = hasResults ? resultsData?.metrics?.reduction_percentage : 0;

  return (
    <div className="flex flex-col gap-6 p-2 text-zinc-300 font-sans animate-in fade-in duration-500">
      
      {/* Top Banner Section */}
      <div className="relative rounded-2xl overflow-hidden bg-[#111118] border border-zinc-800/80 shadow-2xl">
        
        {/* Banner Background Image (Snorlax mask) */}
        <div 
          className="absolute inset-0 z-0 opacity-40 mix-blend-screen"
          style={{
            backgroundImage: "url('/assets/pokemon/img10.jpg')", // Snorlax
            backgroundSize: "cover",
            backgroundPosition: "center 45%",
            maskImage: "linear-gradient(to right, black 30%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, black 30%, transparent 100%)"
          }}
        />

        {/* Banner Content */}
        <div className="relative z-10 flex justify-between items-center p-8 pb-10">
          <div className="flex flex-col">
            <h2 className="text-2xl font-retro text-zinc-100 uppercase tracking-wider mb-2 drop-shadow-md">PROMPT LAB</h2>
            <p className="text-xs text-zinc-400 font-mono drop-shadow">Compress &middot; Analyze &middot; Save</p>
          </div>
          
          {/* Character Image */}
          <div className="w-32 h-32 bg-white rounded-full overflow-hidden p-2 shadow-[0_0_20px_rgba(255,255,255,0.01)] mr-4">
            <img src="/assets/pokemon/img13.jpg" alt="Character" className="w-full h-full object-cover rounded-full" />
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-12 gap-8 mt-4">
        
        {/* Left Column (Prompts & Controls) */}
        <div className="col-span-8 flex flex-col gap-6">
          
          {/* Original Prompt */}
          <div className="bg-[#15151e] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-6 py-3 border-b border-zinc-800 flex justify-between items-center bg-[#111118]">
              <span className="font-retro text-[9px] text-pokemon-red bg-pokemon-red/10 border border-pokemon-red/20 px-3 py-1.5 rounded tracking-wider shadow-[0_0_10px_rgba(255,68,68,0.1)]">ORIGINAL PROMPT</span>
              <span className="font-retro text-[9px] text-pokemon-red tracking-wider">{origTokens} TOKENS</span>
            </div>
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full h-40 bg-transparent resize-none p-6 text-sm text-zinc-300 font-sans focus:outline-none placeholder:text-zinc-600 leading-relaxed"
              placeholder="Enter your prompt here..."
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="font-retro text-[8px] text-zinc-500 tracking-wider">TECHNIQUE</span>
                <select 
                  value={technique}
                  onChange={(e) => setTechnique(e.target.value)}
                  className="bg-[#15151e] border border-zinc-700 rounded-md text-xs font-mono px-3 py-2 text-zinc-300 outline-none focus:border-pokemon-yellow"
                >
                  <option>Auto-Compress</option>
                  <option>Semantic Trim</option>
                  <option>Keyword Extract</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-retro text-[8px] text-zinc-500 tracking-wider">TAG</span>
                <select 
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="bg-[#15151e] border border-zinc-700 rounded-md text-xs font-mono px-3 py-2 text-zinc-300 outline-none focus:border-pokemon-yellow"
                >
                  <option>code</option>
                  <option>summarize</option>
                  <option>research</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleRun}
              disabled={isRunning || !prompt.trim()}
              className="bg-pokemon-yellow hover:bg-yellow-400 text-black font-retro text-[10px] tracking-wider px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-[0_0_15px_rgba(255,204,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              {isRunning ? 'RUNNING' : 'RUN'}
            </button>
          </div>

          {/* Optimized Prompt */}
          <div className="bg-[#15151e] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-6 py-3 border-b border-zinc-800 flex justify-between items-center bg-[#111118]">
              <span className="font-retro text-[9px] text-[#4488ff] bg-[#4488ff]/10 border border-[#4488ff]/20 px-3 py-1.5 rounded tracking-wider shadow-[0_0_10px_rgba(68,136,255,0.1)]">OPTIMIZED PROMPT</span>
            </div>
            <div className="w-full h-40 p-6 text-sm text-zinc-400 font-sans leading-relaxed overflow-y-auto">
              {isRunning ? (
                <div className="flex items-center justify-center h-full text-pokemon-blue animate-pulse font-retro text-xs">
                  OPTIMIZING...
                </div>
              ) : hasResults ? (
                <span className="text-zinc-300">{resultsData?.optimized?.prompt}</span>
              ) : (
                "Run optimization to see compressed output here."
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Dex & Summary) */}
        <div className="col-span-4 flex flex-col gap-6">
          
          {/* Token Dex */}
          <div className="relative rounded-xl overflow-hidden border border-pokemon-red/40 shadow-[0_0_20px_rgba(255,68,68,0.1)] h-[250px] flex flex-col">
            <div 
              className="absolute inset-0 z-0 opacity-80 mix-blend-screen"
              style={{
                background: "linear-gradient(135deg, #661111 0%, #ff4444 100%)",
              }}
            />
            {/* Dex Content */}
            <div className="relative z-10 p-6 flex flex-col h-full">
              <div className="flex justify-between items-center mb-auto">
                <span className="font-retro text-xs text-white tracking-widest drop-shadow-md">TOKEN DEX</span>
                <div className="w-6 h-6 relative rounded-full bg-white flex items-center justify-center overflow-hidden border border-black shadow-md">
                  <div className="w-full h-1/2 bg-pokemon-red absolute top-0 border-b-2 border-black" />
                  <div className="w-2 h-2 rounded-full border-2 border-black bg-white z-10 relative" />
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-6">
                <div className="flex items-center gap-3">
                  <span className="font-retro text-[8px] text-zinc-300 tracking-wider w-16">ORIGINAL</span>
                  <div className="flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-pokemon-red/80" style={{ width: '100%' }} />
                  </div>
                  <span className="font-retro text-[8px] text-white w-6 text-right">{origTokens}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-retro text-[8px] text-zinc-300 tracking-wider w-16">OPTIMIZED</span>
                  <div className="flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-pokemon-blue/80 transition-all duration-1000" style={{ width: hasResults ? `${(optTokens / origTokens) * 100}%` : '0%' }} />
                  </div>
                  <span className="font-retro text-[8px] text-white w-6 text-right">{optTokens}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-retro text-[8px] text-zinc-300 tracking-wider w-16">SAVED</span>
                  <div className="flex-1 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                    <div className="h-full bg-pokemon-green/80 transition-all duration-1000" style={{ width: hasResults ? `${(savedTokens / origTokens) * 100}%` : '0%' }} />
                  </div>
                  <span className="font-retro text-[8px] text-white w-6 text-right">{savedTokens}</span>
                </div>
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/10">
                  <span className="font-retro text-[8px] text-zinc-300 tracking-wider w-16">RATIO %</span>
                  <div className="flex-1 h-2.5 bg-transparent" />
                  <span className="font-retro text-[10px] text-pokemon-yellow drop-shadow-md">{ratio}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Summary Box */}
          <div className="relative rounded-xl overflow-hidden border border-zinc-700 bg-[#15151e] shadow-xl p-6 flex flex-col gap-4">
            <div 
              className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none mix-blend-screen rounded-full"
              style={{
                backgroundImage: "url('/assets/pokemon/img4.jpg')", // Charizard
                backgroundSize: "cover",
                backgroundPosition: "center",
                WebkitMaskImage: "radial-gradient(circle at center, black 10%, transparent 70%)",
                maskImage: "radial-gradient(circle at center, black 10%, transparent 70%)"
              }}
            />
            
            <div className="flex gap-2 relative z-10">
              <span className="font-retro text-[8px] text-pokemon-yellow border border-pokemon-yellow bg-pokemon-yellow/10 px-2 py-1 rounded">AUTO-COMPRESS</span>
              <span className="font-retro text-[8px] text-pokemon-yellow border border-pokemon-yellow/50 bg-pokemon-yellow/5 px-2 py-1 rounded">CODE</span>
            </div>
            
            <p className="text-xs text-zinc-400 leading-relaxed relative z-10">
              Removes filler words, hedges, and redundant politeness markers automatically. Optimized for instructional coding requests.
            </p>
          </div>
        </div>
      </div>
      
      {/* Level 2: Response Comparison */}
      {hasResults && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12 mt-8">
          <PromptDiff results={resultsData} />
          <ComparisonPanels results={resultsData} />
        </div>
      )}
    </div>
  )
}
