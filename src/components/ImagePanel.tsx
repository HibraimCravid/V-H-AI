import { useState } from "react";
import { Sparkles, Image, Wand2, RefreshCw, FileImage, Layers, Eraser } from "lucide-react";

export default function ImagePanel() {
  const [activeTab, setActiveTab] = useState<"generate" | "removeBg">("generate");
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgRemovedUrl, setBgRemovedUrl] = useState<string | null>(null);
  const [removingBg, setRemovingBg] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Dynamic image generation
  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setImageUrl(null);

    try {
      const res = await fetch("/api/ai/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, aspectRatio }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        console.error("Image generation error");
      }
    } catch (err) {
      console.error("Image prompt failure:", err);
    } finally {
      setLoading(false);
    }
  };

  // Simulate background removal
  const handleBackgroundRemoval = () => {
    if (!selectedFile) return;
    setRemovingBg(true);
    setBgRemovedUrl(null);

    // Dynamic step simulator for visual immersion
    setTimeout(() => {
      // Crop isolated subject with a beautiful transparency aesthetic mock
      setBgRemovedUrl(selectedFile);
      setRemovingBg(false);
    }, 3000);
  };

  const handleMockUpload = (id: string) => {
    const mockImages: Record<string, string> = {
      p1: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80", // female portrait
      p2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80", // male portrait
      p3: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80", // boy portrait
    };
    setSelectedFile(mockImages[id] || null);
    setBgRemovedUrl(null);
  };

  return (
    <div className="bg-white/3 border border-white/10 backdrop-blur-2xl rounded-2xl p-5 md:p-6 text-slate-100 font-sans h-full flex flex-col justify-between shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
      <div>
        {/* Sub tabs */}
        <div className="flex border-b border-white/10 mb-6 select-none">
          <button
            onClick={() => setActiveTab("generate")}
            className={`pb-3 text-xs uppercase tracking-wider font-semibold mr-6 transition-all border-b-2 cursor-pointer ${activeTab === "generate" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            Estúdio de Criação
          </button>
          <button
            onClick={() => setActiveTab("removeBg")}
            className={`pb-3 text-xs uppercase tracking-wider font-semibold border-b-2 transition-all cursor-pointer ${activeTab === "removeBg" ? "border-indigo-500 text-white" : "border-transparent text-slate-500 hover:text-slate-300"}`}
          >
            Remover Fundo de Fotos
          </button>
        </div>

        {activeTab === "generate" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Input Options */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Proporção de Tela
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/50 border border-white/10">
                  {["1:1", "16:9", "9:16"].map((r) => (
                    <button
                      key={r}
                      onClick={() => setAspectRatio(r)}
                      className={`text-[10px] py-1.5 rounded-lg font-mono transition-all cursor-pointer ${aspectRatio === r ? "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]" : "text-slate-500 border border-transparent hover:text-slate-300"}`}
                    >
                      {r === "1:1" ? "1:1 QD" : r === "16:9" ? "16:9 HD" : "9:16 PT"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
                  Descrição Visual (Prompt)
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Ex: Robô futurista segurando um skate neon flutuante, estilo pintura digital cibernética..."
                  rows={4}
                  className="w-full bg-black/55 rounded-xl border border-white/10 p-3 text-xs outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 placeholder-slate-600 leading-relaxed resize-none transition-all"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !prompt.trim()}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-400/20 shadow-[0_4px_20px_rgba(99,102,241,0.25)] hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Pintando Tela Inteligente...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    Gerar Arte Digital Realista
                  </>
                )}
              </button>
            </div>

            {/* Stage Output */}
            <div className="lg:col-span-7 flex flex-col h-full bg-black/30 border border-white/5 rounded-2xl overflow-hidden min-h-[350px]">
              {imageUrl ? (
                <div className="relative w-full h-full flex items-center justify-center p-4">
                  <img
                    src={imageUrl}
                    alt="AI Generated Artwork"
                    referrerPolicy="no-referrer"
                    className="max-h-[300px] md:max-h-[340px] rounded-xl object-contain shadow-2xl transition-all duration-300"
                  />
                  <div className="absolute top-4 left-4 flex gap-1.5">
                    <span className="px-2.5 py-1 bg-black/80 text-[9px] font-mono rounded-md border border-white/10 text-cyan-400">
                      RESOLUÇÃO: 1024x1024 px
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                  <div className="w-12 h-12 rounded-xl bg-slate-500/5 border border-white/5 flex items-center justify-center text-slate-500 mb-3">
                    <Image className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-semibold text-slate-400">Pronto para pintar</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Personalize o formato orbital ao lado e digite uma frase criativa. Nossa IA gerará uma imagem digital de altíssima fidelidade.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Background removal tab */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left selector */}
            <div className="bg-[#07060d]/60 border border-white/5 rounded-2xl p-5 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-slate-200 mb-2">Selecione uma Imagem para Isolar</h4>
                <p className="text-[11px] text-slate-500 mb-4Leading-relaxed">
                  Para fins experimentais de alta fidelidade na central V&H, sugerimos testar com fotos de exemplo com alta variação de cores contrastantes:
                </p>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "p1", name: "Estúdio Feminino", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80" },
                    { id: "p2", name: "Moda Masculina", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80" },
                    { id: "p3", name: "Avatar Jovem", src: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=150&q=80" },
                  ].map((img) => (
                    <button
                      key={img.id}
                      onClick={() => handleMockUpload(img.id)}
                      className={`relative aspect-square rounded-xl overflow-hidden border transition-all cursor-pointer ${selectedFile === img.src ? "ring-2 ring-cyan-400 border-indigo-400 scale-[0.98]" : "border-white/10 hover:border-white/20"}`}
                    >
                      <img src={img.src} alt={img.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/70 py-1 text-center">
                        <span className="text-[8px] font-medium text-slate-300">{img.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {selectedFile && (
                <button
                  onClick={handleBackgroundRemoval}
                  disabled={removingBg}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-400/20 disabled:opacity-50"
                >
                  {removingBg ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Excluindo pixels de fundo...
                    </>
                  ) : (
                    <>
                      <Eraser className="w-4 h-4" />
                      Isolar Sujeito (Remover Fundo)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Right preview with transparency grid */}
            <div className="border border-white/5 rounded-2xl overflow-hidden bg-black/40 min-h-[300px] flex flex-col justify-between p-4 relative">
              {removingBg && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6 select-none font-sans">
                  <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-3"></div>
                  <h5 className="text-xs font-semibold text-cyan-400 mb-1">Processando Redes Neurais</h5>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-500">Separando contornos anatômicos faciais...</p>
                    <p className="text-[8px] font-mono text-purple-400">LATENCY APX: 120ms</p>
                  </div>
                </div>
              )}

              {bgRemovedUrl ? (
                <div className="flex-1 flex flex-col items-center justify-center relative">
                  {/* Checkerboard transparency mockup background */}
                  <div className="absolute inset-0 bg-[#161524]/60 border border-white/5 rounded-xl flex flex-wrap p-1 select-none pointer-events-none opacity-60">
                    {Array.from({ length: 121 }).map((_, i) => (
                      <div key={i} className={`w-8 h-8 ${i % 2 === 0 ? "bg-white/5" : "bg-transparent"}`} />
                    ))}
                  </div>

                  {/* Isolated image overlay */}
                  <div className="relative z-10 p-2 max-w-[180px] md:max-w-[200px] flex items-center justify-center transition-all">
                    <img
                      src={bgRemovedUrl}
                      alt="Isolated PNG"
                      className="rounded-xl object-contain drop-shadow-[0_4px_30px_rgba(34,211,238,0.45)]"
                    />
                  </div>
                </div>
              ) : selectedFile ? (
                <div className="flex-1 flex flex-col items-center justify-center select-none p-4">
                  <p className="text-[10px] text-slate-500 font-mono mb-2">VISTA DE ENTRADA ATUAL</p>
                  <img src={selectedFile} alt="Target file" className="max-h-[160px] rounded-xl object-contain" />
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
                  <Layers className="w-8 h-8 text-indigo-500/20 mb-2" />
                  <h4 className="text-xs font-semibold text-slate-400">Canal Isolador Prontificado</h4>
                  <p className="text-[10px] text-slate-500 max-w-xs mt-1 leading-relaxed">
                    Submeta um de nossos avatares de exemplo e clique em isolar. A rede do V&H AI segmentará o sujeito, apagando o plano de fundo.
                  </p>
                </div>
              )}

              {bgRemovedUrl && (
                <div className="pt-3 border-t border-white/5 flex justify-between items-center text-[9px] font-mono text-cyan-400 select-none">
                  <span>SEGMENTAÇÃO: CONCLUÍDA</span>
                  <span className="text-emerald-400">TIPO: IMAGEM ALTA TRANSPARÊNCIA</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center select-none">
        <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
          PULSO DE ARTE GRAPHICS V&H AI — REPOSITÓRIO GERAL COMPATÍVEL COM ANDROID, IOS &amp; WEB CORES DE RELEVO
        </p>
      </div>
    </div>
  );
}
