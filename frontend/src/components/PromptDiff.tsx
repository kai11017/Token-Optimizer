import { useState } from "react"
import { ChevronDown, ChevronUp, FileText } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function PromptDiff({ results }: any) {
  const [isExpanded, setIsExpanded] = useState(false)
  if (!results) return null;

  return (
    <Card className="bg-zinc-900/50 border-zinc-800">
      <CardHeader className="py-4 px-6 border-b border-zinc-800/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-purple-400" />
          <h3 className="font-medium text-zinc-200">Optimizer Transformation</h3>
        </div>
        
        <div className="flex items-center gap-6 text-sm">
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 font-mono text-xs">Reduction</span>
            <span className="text-emerald-400 font-semibold font-mono">{results.metrics?.reduction_percentage}%</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-zinc-500 font-mono text-xs">Tokens Saved</span>
            <span className="text-zinc-200 font-mono">{results.metrics?.saved_tokens}</span>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-zinc-400 hover:text-zinc-100 ml-4"
          >
            {isExpanded ? (
              <><ChevronUp className="w-4 h-4 mr-1" /> Collapse Diff</>
            ) : (
              <><ChevronDown className="w-4 h-4 mr-1" /> Inspect Diff</>
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="p-0 border-t border-zinc-800/50">
          <div className="grid grid-cols-2 divide-x divide-zinc-800/50 text-sm font-mono leading-relaxed">
            <div className="p-6 bg-red-950/10">
              <div className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">Original Prompt ({results.original?.inputTokens} tokens)</div>
              <div className="text-zinc-300 whitespace-pre-wrap">
                {results.original?.prompt}
              </div>
            </div>
            <div className="p-6 bg-emerald-950/10">
              <div className="text-xs text-zinc-500 mb-4 tracking-wider uppercase">Optimized Prompt ({results.optimized?.inputTokens} tokens)</div>
              <div className="text-zinc-300 whitespace-pre-wrap">
                {results.optimized?.prompt}
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
