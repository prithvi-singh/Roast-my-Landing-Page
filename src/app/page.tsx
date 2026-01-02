"use client";

import { useState } from "react";
import { Link2, FileText, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ReportCard from "@/components/ReportCard";

type RoastResult = {
  score: number;
  roast: string;
  fixes: Array<{ problem: string; solution: string }>;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"url" | "text">("url");
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RoastResult | null>(null);

  const handleRoast = async () => {
    if (!inputValue.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ type: activeTab, content: inputValue }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-indigo-500/30 font-mono">
      <div className="max-w-4xl mx-auto px-4 py-20">
        
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs tracking-widest font-bold uppercase mb-4">
            Beta v1.0
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-500">
            ROAST MY LANDING PAGE
          </h1>
          <p className="text-zinc-500 max-w-lg mx-auto">
            Get a brutal, honest critique from a cynical VC AI. 
            Prepare to cry.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2 max-w-2xl mx-auto shadow-xl">
          {/* Tabs */}
          <div className="grid grid-cols-2 gap-1 mb-2 bg-zinc-950/50 p-1 rounded-lg">
            <button
              onClick={() => { setActiveTab("url"); setError(null); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                activeTab === "url" 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Link2 size={16} /> URL Scraper
            </button>
            <button
              onClick={() => { setActiveTab("text"); setError(null); }}
              className={cn(
                "flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-md transition-all",
                activeTab === "text" 
                  ? "bg-zinc-800 text-white shadow-sm" 
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <FileText size={16} /> Paste Copy
            </button>
          </div>

          {/* Inputs */}
          <div className="p-4 space-y-4">
            {activeTab === "url" ? (
              <input
                type="url"
                placeholder="example.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            ) : (
              <textarea
                rows={6}
                placeholder="Paste your H1, H2, and subheader text here..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            )}

            <button
              onClick={handleRoast}
              disabled={loading || !inputValue}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={18} /> Analyzing...
                </>
              ) : (
                <>
                  Roast Me <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <ReportCard 
            score={result.score} 
            roast={result.roast} 
            fixes={result.fixes} 
          />
        )}
      </div>
    </main>
  );
}