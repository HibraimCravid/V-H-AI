import { useState } from "react";
import { CONTENT_TEMPLATES } from "../constants";
import { GraduationCap, PenTool, Video, CheckSquare, Sparkles, Send, Copy, ClipboardCheck, ArrowRight, RefreshCw } from "lucide-react";

interface ContentPanelProps {
  currentModel: string;
}

export default function ContentPanel({ currentModel }: ContentPanelProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("summary");
  const [prompt, setPrompt] = useState("");
  const [tonality, setTonality] = useState("profissional");
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Map icon strings to Lucide components
  const renderIcon = (id: string, className: string) => {
    switch (id) {
      case "summary": return <GraduationCap className={className} />;
      case "exercise": return <PenTool className={className} />;
      case "script": return <Video className={className} />;
      case "correct": return <CheckSquare className={className} />;
      default: return <Sparkles className={className} />;
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setGeneratedResult(null);

    try {
      const res = await fetch("/api/ai/write", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedTemplate,
          topic: prompt,
          style: tonality,
          language: "pt",
        }),
      });

      const data = await res.json();
      if (data.error) {
        setGeneratedResult(`Erro do Servidor: ${data.error}`);
      } else {
        setGeneratedResult(data.text);
      }
    } catch (err: any) {
      setGeneratedResult(`Erro de conexão com a central de conteúdo V&H AI: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedResult) return;
    navigator.clipboard.writeText(generatedResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTpl = CONTENT_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full text-slate-100 font-sans">
      {/* Parameters & Picker */}
      <div className="lg:col-span-5 flex flex-col gap-4">
        <div className="bg-[#0f0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5 p-5">
          <h3 className="text-sm font-semibold mb-4 text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Selecione a Ferramenta de Criação
          </h3>

          <div className="flex flex-col gap-2.5">
            {CONTENT_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => {
                  setSelectedTemplate(tpl.id);
                  setPrompt("");
                  setGeneratedResult(null);
                }}
                className={`w-full p-3 text-left rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${selectedTemplate === tpl.id ? "bg-cyan-500/10 border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)] text-white" : "bg-black/20 border-white/5 hover:border-white/10 text-slate-400"}`}
              >
                <span className={`p-2 rounded-lg shrink-0 ${selectedTemplate === tpl.id ? "bg-cyan-500/20 text-cyan-400" : "bg-white/5 text-slate-400"}`}>
                  {renderIcon(tpl.id, "w-5 h-5")}
                </span>
                <div>
                  <h4 className="text-xs font-semibold">{tpl.title}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{tpl.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Input parameters */}
        <div className="bg-[#0f0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5 p-5 flex flex-col gap-3.5">
          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
              Tom de Voz do Texto
            </label>
            <div className="grid grid-cols-3 gap-1 px-1 py-1 rounded-xl bg-black/40 border border-white/5">
              {["profissional", "criativo", "didático"].map((t) => (
                <button
                  key={t}
                  onClick={() => setTonality(t)}
                  className={`text-[10px] font-medium py-1.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer ${tonality === t ? "bg-cyan-500/25 text-white stroke-cyan-400" : "text-slate-500 hover:text-slate-200"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-widest mb-1.5">
              Instruções e Temas
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={currentTpl?.placeholder}
              rows={4}
              className="w-full bg-black/40 rounded-xl border border-white/5 p-3 text-xs text-slate-100 outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 placeholder-slate-600 leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border border-cyan-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Processando no {currentModel}...
              </>
            ) : (
              <>
                Gerar Conteúdo Acadêmico
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output screen */}
      <div className="lg:col-span-7 bg-[#0f0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5 p-5 md:p-6 flex flex-col h-full min-h-[400px]">
        {generatedResult ? (
          <div className="flex flex-col h-full">
            <div className="flex justify-between items-center pb-4 border-b border-white/5 mb-4 select-none">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span>TEXTO GERADO VIA V&H content-studio</span>
              </div>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 text-[11px] rounded-lg border border-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-sans"
              >
                {copied ? (
                  <>
                    <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Conteúdo
                  </>
                )}
              </button>
            </div>

            {/* Markdown-style content view area */}
            <div className="flex-1 overflow-y-auto pr-1 text-slate-300 text-xs leading-relaxed space-y-3 font-sans max-h-[420px] scrollbar-none">
              {generatedResult.split("\n").map((para, i) => {
                if (!para.trim()) return <div key={i} className="h-2" />;
                if (para.startsWith("#")) {
                  return <h3 key={i} className="text-sm font-bold text-white tracking-tight mt-3 mb-1">{para.replace(/#/g, "").trim()}</h3>;
                }
                if (para.startsWith("- ") || para.startsWith("* ")) {
                  return <li key={i} className="ml-4 list-disc marker:text-cyan-400 pl-1">{para.substring(2)}</li>;
                }
                return <p key={i}>{para}</p>;
              })}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 select-none">
            <div className="w-12 h-12 rounded-xl bg-slate-500/5 border border-white/5 flex items-center justify-center text-slate-500 mb-3">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-semibold text-slate-400">Pronto para criar conteúdo</h4>
            <p className="text-[11px] text-slate-500 max-w-sm mt-1 leading-relaxed">
              Escolha uma modalidade de tarefa inteligente acadêmica, detalhe as instruções no painel esquerdo e clique em gerar para ver o resultado consolidado aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
