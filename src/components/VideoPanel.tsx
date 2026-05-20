import { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Film, Play, AlertTriangle, MonitorPlay, Video, Calendar, ArrowUpRight } from "lucide-react";

export default function VideoPanel() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [resolution, setResolution] = useState("1080p");
  const [loading, setLoading] = useState(false);
  const [operationName, setOperationName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  // Tips for high-fidelity video generation
  const processingTips = [
    "Sincronizando paletas retrofuturistas cibernéticas...",
    "Suavizando transições e quadros por segundo...",
    "Gerando trilha vetorial volumétrica...",
    "Redirecionando buffers cinematográficos da GPU de inteligência...",
    "Renderizando simulação Veo AI — Resolução de Relevo...",
  ];
  const [cT, setCT] = useState(0);

  useEffect(() => {
    let interval: any;
    if (loading && !done) {
      interval = setInterval(() => {
        setCT((prev) => (prev + 1) % processingTips.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [loading, done]);

  // Launch video operation
  const handleStart = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setVideoUrl(null);
    setDone(false);
    setProgress(0);
    setOperationName(null);

    try {
      const res = await fetch("/api/generate-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio, resolution }),
      });
      const data = await res.json();
      if (data.operationName) {
        setOperationName(data.operationName);
        // Start polling immediately
        pollStatus(data.operationName);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Poll video operation status (3-Step POST pattern)
  const pollStatus = (opName: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/video-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ operationName: opName }),
        });
        const data = await res.json();
        
        setProgress(data.progress || 0);

        if (data.done) {
          clearInterval(interval);
          setDone(true);
          // Download video download url (3-Step POST pattern)
          downloadVideo(opName);
        }
      } catch (err) {
        console.error("Poller issue:", err);
        clearInterval(interval);
        setLoading(false);
      }
    }, 1500);
  };

  // Download video result
  const downloadVideo = async (opName: string) => {
    try {
      const res = await fetch("/api/video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operationName: opName }),
      });
      const data = await res.json();
      if (data.downloadUrl) {
        setVideoUrl(data.downloadUrl);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0f0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5 p-5 md:p-6 text-slate-100 font-sans h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <span className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Film className="w-5 h-5" />
          </span>
          <div>
            <h3 className="text-sm font-semibold">Cinema Studio &amp; AI Video Creator</h3>
            <p className="text-[10px] text-slate-500 font-mono">GERADOR INTEGRADO VIA REDE VEO-3.1-LITE-PREVIEW</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Options Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3 mb-1">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Resolução Máxima
                </label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 outline-none select-none font-mono cursor-pointer"
                >
                  <option value="720p">HD Lite (720p)</option>
                  <option value="1080p">Alt. Def. (1080p)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1">
                  Enquadramento
                </label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="w-full bg-black/40 border border-white/5 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 outline-none select-none font-mono cursor-pointer"
                >
                  <option value="16:9">Horizontal (16:9)</option>
                  <option value="9:16">Vertical (9:16)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                Descrição do Roteiro (Prompt)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ex: Viagem interdimensional por um portal de luz, estrelas caindo aceleradas e néons cibernéticos se expandindo..."
                rows={4}
                className="w-full bg-black/40 rounded-xl border border-white/5 p-3 text-xs outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-600 leading-relaxed resize-none"
              />
            </div>

            <button
              onClick={handleStart}
              disabled={loading || !prompt.trim()}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-cyan-400/20 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Sintonizando satélites cinematográficos...
                </>
              ) : (
                <>
                  <Video className="w-4 h-4" />
                  Iniciar Operação de Vídeo IA
                </>
              )}
            </button>
          </div>

          {/* Player Display Stage */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center h-full bg-black/30 border border-white/5 rounded-2xl overflow-hidden min-h-[300px] relative p-4">
            {loading ? (
              <div className="w-full flex flex-col items-center justify-center p-6 text-center select-none z-10 font-sans">
                <div className="relative mb-6">
                  {/* Spinning loader outer ring */}
                  <div className="w-20 h-20 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin"></div>
                  {/* Internal core badge */}
                  <div className="absolute inset-2 bg-[#0e0d16] rounded-full flex items-center justify-center text-xs font-mono text-cyan-400">
                    {progress}%
                  </div>
                </div>

                <h5 className="text-xs font-semibold text-slate-200 mb-1">Processando Redações de Pixels</h5>
                <p className="text-[10px] text-cyan-400 font-mono mb-4">OP: {operationName ? operationName.split("/").slice(-1)[0] : "CALIBRANDO"}</p>
                <p className="text-[11px] text-slate-400 max-w-xs italic animate-pulse transition-all">{processingTips[cT]}</p>

                {/* Simulated dynamic Progress Bar */}
                <div className="w-full max-w-xs bg-white/5 h-1.5 rounded-full overflow-hidden mt-6 border border-white/5">
                  <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            ) : videoUrl ? (
              <div className="w-full h-full flex flex-col justify-between">
                <div className="relative rounded-xl overflow-hidden border border-white/5 shadow-2xl bg-black flex items-center justify-center">
                  <video
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    className="max-h-[220px] md:max-h-[260px] object-cover"
                  ></video>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-cyan-400 select-none pt-4">
                  <span>RENDERIZAÇÃO: VEO-3.1 COMPLETA</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <MonitorPlay className="w-3.5 h-3.5" /> 1080P PROPORÇÃO {aspectRatio}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8 select-none">
                <div className="w-12 h-12 rounded-xl bg-slate-500/5 border border-white/5 flex items-center justify-center text-slate-500 mb-3">
                  <MonitorPlay className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-semibold text-slate-400">Pronto para renderização</h4>
                <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                  Digite seu roteiro ao lado e inicie o processor. Sintonizaremos nossa GPU para renderizar um vídeo cinematográfico digital em alta definição.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center select-none">
        <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
          NÚCLEO GRÁFICO PORTÁTIL V&H CINEMA STUDIO — EXIBIÇÃO EM TEMPO DE COMPILALÇÃO DESEJÁVEL
        </p>
      </div>
    </div>
  );
}
