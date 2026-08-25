import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'

export default function TokenAnalytics({ results }: any) {
  if (!results) return null;

  const metrics = results.metrics;
  const reductionPct = metrics.reduction_percentage;
  const savedTokens = metrics.saved_tokens;
  const origInput = metrics.original_tokens;
  const optInput = metrics.optimized_tokens;
  
  const origLatency = results.original.latency;
  const optLatency = results.optimized.latency;
  const latencyDiff = origLatency > 0 ? ((origLatency - optLatency) / origLatency * 100).toFixed(1) : '0';
  const latencyImproved = optLatency <= origLatency;

  const similarity = results.similarityScore;
  const qualityLoss = similarity != null ? (100 - similarity).toFixed(1) : null;

  // Dynamic verdict based on real data
  const getVerdict = () => {
    if (similarity == null) return { label: 'PENDING ANALYSIS', color: 'text-zinc-400' };
    if (reductionPct >= 30 && similarity >= 85) return { label: 'EXCELLENT TRADEOFF', color: 'text-emerald-400' };
    if (reductionPct >= 20 && similarity >= 70) return { label: 'GOOD TRADEOFF', color: 'text-green-400' };
    if (reductionPct >= 10 && similarity >= 50) return { label: 'FAIR TRADEOFF', color: 'text-amber-400' };
    if (similarity < 50) return { label: 'QUALITY LOSS', color: 'text-red-400' };
    return { label: 'MINIMAL GAIN', color: 'text-amber-500' };
  };
  const verdict = getVerdict();

  // Bar chart data — real values from the API
  const comparisonData = [
    { 
      name: 'Input Tokens', 
      Original: origInput, 
      Optimized: optInput 
    },
    { 
      name: 'Output Tokens', 
      Original: results.original.outputTokens, 
      Optimized: results.optimized.outputTokens 
    },
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-xl">
        <p className="text-xs text-zinc-400 mb-2 font-medium">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-xs font-mono" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-medium tracking-tight">Experiment Analytics</h2>
        <div className="h-px flex-1 bg-zinc-800" />
      </div>

      {/* Overall Score Card */}
      <Card className="bg-gradient-to-r from-emerald-950/20 to-purple-950/20 border-zinc-800">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div>
              <div className="text-xs text-zinc-500 mb-1 tracking-wider uppercase">Token Savings</div>
              <div className="text-2xl font-mono text-emerald-400">{reductionPct}%</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1 tracking-wider uppercase">Quality</div>
              <div className={`text-2xl font-mono ${similarity != null && similarity >= 75 ? 'text-emerald-400' : similarity != null && similarity >= 50 ? 'text-amber-500' : 'text-red-400'}`}>
                {qualityLoss != null ? `-${qualityLoss}%` : 'N/A'}
              </div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1 tracking-wider uppercase">Latency</div>
              <div className={`text-2xl font-mono ${latencyImproved ? 'text-emerald-400' : 'text-amber-500'}`}>{latencyImproved ? '-' : '+'}{Math.abs(parseFloat(latencyDiff))}%</div>
            </div>
            <div className="h-12 w-px bg-zinc-800" />
            <div>
              <div className="text-xs text-zinc-500 mb-1 tracking-wider uppercase">Overall</div>
              <div className={`text-xl font-semibold tracking-tight ${verdict.color}`}>{verdict.label}</div>
            </div>
          </div>
          <div className="text-sm text-zinc-400 max-w-sm text-right">
            Optimization reduced input tokens by {reductionPct}%{similarity != null ? ` with ${similarity}% semantic similarity` : ''}.
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-6">
        {/* Token Efficiency Panel */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Token Efficiency</h3>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Original Input</span>
                <span className="font-mono text-zinc-200">{origInput}</span>
              </div>
              <Progress value={100} className="h-2 bg-zinc-800 [&>div]:bg-zinc-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Optimized Input</span>
                <span className="font-mono text-emerald-400">{optInput}</span>
              </div>
              <Progress value={(optInput/origInput) * 100} className="h-2 bg-zinc-800 [&>div]:bg-emerald-500" />
            </div>
            <div className="pt-4 border-t border-zinc-800/50 flex justify-between">
              <span className="text-sm text-zinc-500">Tokens Saved</span>
              <span className="text-sm font-mono text-emerald-400">{savedTokens} ({reductionPct}%)</span>
            </div>
          </CardContent>
        </Card>

        {/* Token Comparison Bar Chart */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Original vs Optimized</h3>
          </CardHeader>
          <CardContent className="p-6 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }} barGap={8}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => v.toLocaleString()} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Legend 
                  wrapperStyle={{ fontSize: '11px', color: '#a1a1aa' }} 
                  iconType="circle" 
                  iconSize={8}
                />
                <Bar dataKey="Original" fill="#52525b" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Optimized" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Latency Comparison */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2">
          <h3 className="text-sm font-medium text-zinc-200 uppercase tracking-wider">Latency Comparison</h3>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Original</span>
                <span className="text-sm font-mono text-zinc-300">{origLatency.toFixed(2)}s</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-zinc-500 transition-all duration-700"
                  style={{ width: '100%' }}
                />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Optimized</span>
                <span className={`text-sm font-mono ${latencyImproved ? 'text-emerald-400' : 'text-amber-400'}`}>{optLatency.toFixed(2)}s</span>
              </div>
              <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${latencyImproved ? 'bg-emerald-500' : 'bg-amber-500'}`}
                  style={{ width: `${origLatency > 0 ? Math.min((optLatency / origLatency) * 100, 100) : 100}%` }}
                />
              </div>
            </div>
            <div className="w-32 text-center p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
              <div className={`text-xl font-mono font-bold ${latencyImproved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {latencyImproved ? '↓' : '↑'} {Math.abs(parseFloat(latencyDiff))}%
              </div>
              <div className="text-[10px] text-zinc-500 uppercase mt-1">{latencyImproved ? 'Faster' : 'Slower'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

