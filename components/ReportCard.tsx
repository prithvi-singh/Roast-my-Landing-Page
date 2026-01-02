import { AlertTriangle, CheckCircle, Flame, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportCardProps {
  score: number;
  roast: string;
  fixes: Array<{ problem: string; solution: string }>;
}

export default function ReportCard({ score, roast, fixes }: ReportCardProps) {
  // Determine Grade and Color
  let grade = "F";
  let colorClass = "text-red-500 border-red-500/50 bg-red-500/10";

  if (score >= 90) { grade = "A"; colorClass = "text-green-400 border-green-400/50 bg-green-400/10"; }
  else if (score >= 80) { grade = "B"; colorClass = "text-emerald-400 border-emerald-400/50 bg-emerald-400/10"; }
  else if (score >= 70) { grade = "C"; colorClass = "text-yellow-400 border-yellow-400/50 bg-yellow-400/10"; }
  else if (score >= 60) { grade = "D"; colorClass = "text-orange-400 border-orange-400/50 bg-orange-400/10"; }

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-sm">
            <Terminal size={16} />
            <span>ROAST_RESULTS.JSON</span>
          </div>
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8 font-mono">
          {/* Score Section */}
          <div className="flex flex-col md:flex-row gap-8 items-center justify-center">
            <div className={cn("relative w-32 h-32 flex items-center justify-center border-4 rounded-full", colorClass)}>
              <div className="text-center">
                <span className="text-4xl font-black block">{grade}</span>
                <span className="text-sm opacity-80">{score}/100</span>
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-zinc-500 text-xs uppercase tracking-widest mb-2">The Verdict</h3>
              <p className="text-lg md:text-xl text-zinc-100 font-bold leading-relaxed">
                "{roast}"
              </p>
            </div>
          </div>

          <div className="h-px bg-zinc-800 w-full" />

          {/* Fixes Section */}
          <div>
            <h3 className="flex items-center gap-2 text-zinc-500 text-xs uppercase tracking-widest mb-4">
              <Flame size={14} className="text-orange-500" />
              Required Fixes
            </h3>
            <ul className="space-y-4">
              {fixes.map((fix, i) => (
                <li key={i} className="flex items-start gap-3 text-zinc-300 bg-zinc-950/50 p-4 rounded border border-zinc-800/50">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <div className="text-sm">
                      <span className="text-red-400 font-semibold">Problem: </span>
                      <span className="text-zinc-400">{fix.problem}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-green-400 font-semibold">Solution: </span>
                      <span>{fix.solution}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
