"use client";

import { useState } from "react";
import { Copy, Link, AlertCircle, CheckCircle2, Loader2, Flame, Quote, MessageSquare } from "lucide-react";

export default function Home() {
  const [mode, setMode] = useState<"url" | "paste">("url");
  const [url, setUrl] = useState("https://");
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleRoast = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          url: mode === "url" ? url : "", 
          text: mode === "paste" ? text : "",
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-gray-200 font-mono p-4 flex flex-col items-center justify-center">
      <div className="max-w-3xl w-full space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-block bg-indigo-900/30 text-indigo-400 px-3 py-1 rounded-full text-xs border border-indigo-500/30">
            BETA V1.0
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white">
            ROAST MY LANDING PAGE
          </h1>
          <p className="text-gray-500 text-lg">
            Get a brutal, honest critique from a cynical VC AI. <br />
            Prepare to cry.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-2 md:p-6 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-2 mb-6 bg-black/40 p-1 rounded-lg">
            <button
              onClick={() => setMode("url")}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${
                mode === "url" ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Link size={16} /> URL Scraper
            </button>
            <button
              onClick={() => setMode("paste")}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-md transition-all ${
                mode === "paste" ? "bg-gray-800 text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Copy size={16} /> Paste Copy
            </button>
          </div>

          <div className="space-y-4">
            {mode === "url" ? (
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://your-startup.com"
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your H1, H2, and hero text here..."
                rows={6}
                className="w-full bg-black border border-gray-800 rounded-lg px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            )}

            <button
              onClick={handleRoast}
              disabled={loading || (mode === "url" ? !url : !text)}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Flame size={18} />}
              {loading ? "Roasting..." : "Roast Me →"}
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-900/50 text-red-400 p-4 rounded-lg flex items-center gap-3 text-sm">
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            
            {/* Score */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center relative overflow-hidden">
              <div className={`absolute top-0 left-0 w-full h-1 ${result.score > 50 ? 'bg-green-500' : 'bg-red-600'}`} />
              <div className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-2">Verdict Score</div>
              <div className={`text-8xl font-black ${result.score > 50 ? 'text-green-500' : 'text-red-500'}`}>
                {result.score}
              </div>
            </div>

            {/* Overall Summary */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">🔥</span> The Verdict
              </h3>
              <p className="text-xl text-gray-300 leading-relaxed italic">"{result.roast}"</p>
            </div>

            {/* THE NEW 3-LAYER CARDS */}
            <div className="grid gap-6">
              {result.fixes.map((fix: any, i: number) => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden shadow-lg">
                  
                  {/* Layer 1: The Quote (Context) */}
                  <div className="bg-gray-950/50 p-4 border-b border-gray-800 flex gap-3">
                    <Quote size={20} className="text-gray-500 shrink-0 mt-1" />
                    <div>
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Original Copy</span>
                      <p className="text-gray-300 font-mono text-sm opacity-80">"{fix.quote}"</p>
                    </div>
                  </div>

                  {/* Layer 2: The Roast (Fun) */}
                  <div className="bg-red-950/20 p-5 border-b border-red-900/10 flex gap-4">
                    <div className="bg-red-500/10 text-red-500 p-2 rounded-lg shrink-0 h-fit">
                      <Flame size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-1">The Roast</span>
                      <p className="text-red-200 font-medium text-lg">"{fix.roast}"</p>
                    </div>
                  </div>

                  {/* Layer 3: The Fix (Helpful) */}
                  <div className="bg-green-950/10 p-5 flex gap-4">
                    <div className="bg-green-500/10 text-green-500 p-2 rounded-lg shrink-0 h-fit">
                      <CheckCircle2 size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider block mb-1">The Fix</span>
                      <p className="text-green-100/90 leading-relaxed">{fix.fix}</p>
                    </div>
                  </div>

                </div>
              ))}
            </div>

            <div className="flex justify-center pt-8 pb-12">
               <a 
                 href={`https://twitter.com/intent/tweet?text=I%20just%20got%20roasted%20by%20AI.%20My%20site%20scored%20${result.score}/100.%20%F0%9F%92%80%20"${result.roast}"&url=https://roastmylandingpage.com`}
                 target="_blank"
                 className="bg-white text-black font-bold py-3 px-6 rounded-full hover:scale-105 transition-transform flex items-center gap-2"
               >
                 Share this disaster on Twitter
               </a>
             </div>

          </div>
        )}
      </div>
    </main>
  );
}