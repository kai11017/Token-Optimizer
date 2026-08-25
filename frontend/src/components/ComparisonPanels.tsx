import { useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ChevronDown, ChevronUp, TrendingUp, TrendingDown, Minus, Zap, ArrowDown } from 'lucide-react'

export default function ComparisonPanels({ results }: any) {
  const [expanded1, setExpanded1] = useState(false)
  const [expanded2, setExpanded2] = useState(false)

  if (!results) return null;

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <ResponsePanel 
          title="Without Optimization" 
          tokens={results.original.inputTokens} 
          output={results.original.outputTokens} 
          latency={results.original.latency.toFixed(2)} 
          expanded={expanded1} 
          setExpanded={setExpanded1} 
          response={results.original.response} 
        />
        <ResponsePanel 
          title="With Token Optimization" 
          tokens={results.optimized.inputTokens} 
          output={results.optimized.outputTokens} 
          latency={results.optimized.latency.toFixed(2)} 
          expanded={expanded2} 
          setExpanded={setExpanded2} 
          response={results.optimized.response} 
          isOptimized 
        />
      </div>
      <ResponseComparison results={results} />
    </section>
  )
}

function ResponsePanel({ title, tokens, output, latency, expanded, setExpanded, response, isOptimized = false }: any) {
  return (
    <Card className={`bg-zinc-900 border-zinc-800 ${isOptimized ? 'border-purple-500/30' : ''}`}>
      <CardHeader className="pb-4 border-b border-zinc-800/50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg text-zinc-100">{title}</h3>
            <Badge variant="outline" className="mt-2 bg-zinc-950 border-zinc-800 text-zinc-400 font-mono text-xs">
              Llama 3
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-x-6 gap-y-1 text-right text-xs">
            <div className="text-zinc-500">Input</div>
            <div className="text-zinc-500">Output</div>
            <div className="text-zinc-500">Latency</div>
            <div className="font-mono text-zinc-200">{tokens}</div>
            <div className="font-mono text-zinc-200">{output}</div>
            <div className={`font-mono ${isOptimized ? 'text-emerald-400' : 'text-zinc-200'}`}>{latency}s</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="p-6">
          <p className={`text-zinc-300 leading-relaxed text-sm ${expanded ? '' : 'line-clamp-4'}`}>
            {response}
          </p>
          <button onClick={() => setExpanded(!expanded)} className="mt-4 flex items-center text-xs font-medium text-purple-400 hover:text-purple-300">
            {expanded ? <><ChevronUp className="w-4 h-4 mr-1" /> Collapse response</> : <><ChevronDown className="w-4 h-4 mr-1" /> Expand response</>}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

function ResponseComparison({ results }: any) {
  const similarity = results?.similarityScore;
  const displayScore = similarity != null ? `${similarity}%` : 'N/A';

  // Compute dynamic metrics from results
  const origTokens = results.original.inputTokens;
  const optTokens = results.optimized.inputTokens;
  const tokenSavings = origTokens > 0 ? Math.round((1 - optTokens / origTokens) * 100) : 0;

  const origLatency = results.original.latency;
  const optLatency = results.optimized.latency;
  const latencySaved = origLatency > 0 ? Math.round((1 - optLatency / origLatency) * 100) : 0;

  const origOutput = results.original.outputTokens;
  const optOutput = results.optimized.outputTokens;

  // Determine quality assessment based on similarity score
  const getQualityLevel = (score: number | null) => {
    if (score == null) return { label: 'Unknown', color: 'text-zinc-400', bg: 'bg-zinc-500' };
    if (score >= 90) return { label: 'Excellent', color: 'text-emerald-400', bg: 'bg-emerald-500' };
    if (score >= 75) return { label: 'Good', color: 'text-green-400', bg: 'bg-green-500' };
    if (score >= 60) return { label: 'Fair', color: 'text-amber-400', bg: 'bg-amber-500' };
    return { label: 'Low', color: 'text-red-400', bg: 'bg-red-500' };
  };

  const quality = getQualityLevel(similarity);

  // SVG circular gauge for similarity
  const gaugeRadius = 40;
  const gaugeCircumference = 2 * Math.PI * gaugeRadius;
  const gaugeFill = similarity != null ? (similarity / 100) * gaugeCircumference : 0;

  return (
    <Card className="bg-zinc-900/60 border-zinc-800/80 relative overflow-hidden">
      {/* Blurred background image */}
      <div 
        className="absolute inset-0 z-0 opacity-10 pointer-events-none mix-blend-screen"
        style={{
          backgroundImage: "url('/assets/pokemon/img11.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center 20%",
          filter: "blur(4px)",
          maskImage: "radial-gradient(circle at center, black 50%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 50%, transparent 100%)"
        }}
      />
      
      <CardContent className="p-6 relative z-10">
        <h4 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-5">Response Quality Analysis</h4>
        
        <div className="flex items-start gap-8">
          {/* Left: Similarity gauge + quality checks */}
          <div className="flex items-start gap-6 flex-1">
            {/* Circular Similarity Gauge */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-24 h-24">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r={gaugeRadius} fill="none" stroke="#27272a" strokeWidth="6" />
                  <circle 
                    cx="50" cy="50" r={gaugeRadius} fill="none" 
                    stroke={similarity != null && similarity >= 90 ? '#10b981' : similarity != null && similarity >= 75 ? '#22c55e' : similarity != null && similarity >= 60 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${gaugeFill} ${gaugeCircumference}`}
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-lg font-mono font-bold ${quality.color}`}>
                    {similarity != null ? `${similarity}` : '—'}
                  </span>
                  <span className="text-[9px] text-zinc-500 uppercase">Similarity</span>
                </div>
              </div>
              <span className={`text-xs font-semibold ${quality.color} uppercase tracking-wider`}>{quality.label}</span>
            </div>

            {/* Quality checklist */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${similarity != null && similarity >= 60 ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <span className="text-sm text-zinc-300">Semantic Similarity: <strong className={quality.color}>{displayScore}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${similarity != null && similarity >= 50 ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <span className="text-sm text-zinc-300">Key Information {similarity != null && similarity >= 50 ? 'Preserved' : 'Partially Lost'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${tokenSavings > 0 ? 'text-emerald-500' : 'text-zinc-600'}`} />
                <span className="text-sm text-zinc-300">Token Reduction: <strong className="text-emerald-400">{tokenSavings}%</strong></span>
              </div>
            </div>
          </div>

          {/* Right: Improvement metrics cards */}
          <div className="w-96 grid grid-cols-2 gap-3 shrink-0">
            {/* Input Tokens Card */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Input Tokens</div>
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-lg font-mono text-zinc-400 line-through mr-2">{origTokens}</span>
                  <span className="text-lg font-mono text-emerald-400">{optTokens}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {tokenSavings > 0 ? <ArrowDown className="w-3 h-3 text-emerald-400" /> : <Minus className="w-3 h-3 text-zinc-500" />}
                <span className={`text-xs font-mono ${tokenSavings > 0 ? 'text-emerald-400' : 'text-zinc-500'}`}>{tokenSavings}% saved</span>
              </div>
            </div>

            {/* Output Tokens Card */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Output Tokens</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono text-zinc-200">{origOutput}</span>
                <span className="text-xs text-zinc-500">vs</span>
                <span className="text-lg font-mono text-purple-400">{optOutput}</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                {optOutput <= origOutput 
                  ? <TrendingDown className="w-3 h-3 text-emerald-400" /> 
                  : <TrendingUp className="w-3 h-3 text-amber-400" />}
                <span className={`text-xs font-mono ${optOutput <= origOutput ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {origOutput > 0 ? Math.abs(Math.round((1 - optOutput / origOutput) * 100)) : 0}% {optOutput <= origOutput ? 'fewer' : 'more'}
                </span>
              </div>
            </div>

            {/* Latency Card */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Latency</div>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono text-zinc-400">{origLatency.toFixed(1)}s</span>
                <span className="text-xs text-zinc-600">→</span>
                <span className={`text-lg font-mono ${latencySaved > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>{optLatency.toFixed(1)}s</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <Zap className={`w-3 h-3 ${latencySaved > 0 ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className={`text-xs font-mono ${latencySaved > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {Math.abs(latencySaved)}% {latencySaved > 0 ? 'faster' : 'slower'}
                </span>
              </div>
            </div>

            {/* Similarity Card */}
            <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider mb-2">Quality</div>
              <div className={`text-lg font-mono ${quality.color}`}>
                {similarity != null ? `${similarity}%` : 'N/A'}
              </div>
              <div className="flex items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${quality.bg}`} />
                <span className={`text-xs font-mono ${quality.color}`}>{quality.label}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

