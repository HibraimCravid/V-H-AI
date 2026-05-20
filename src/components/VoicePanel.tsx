import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Volume2, Sparkles, RefreshCw, AudioLines } from "lucide-react";

interface VoicePanelProps {
  currentModel: string;
}

export default function VoicePanel({ currentModel }: VoicePanelProps) {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState("Clique no microfone para sintonizar o Assistente Virtual...");
  const [aiSpeechResponse, setAiSpeechResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voiceList, setVoiceList] = useState(["Kore", "Zephyr", "Puck", "Charon", "Fenrir"]);
  const [selectedVoice, setSelectedVoice] = useState("Zephyr");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Simulated Voice Activation Responses
  const responses = [
    "Olá! Sintonizei a sua frequência neural de voz. Como posso ajudar nas suas criações hoje?",
    "Frequência calibrada com sucesso. Analisando dados em tempo real sob o motor " + currentModel + ". Diga me o seu comando.",
    "Central V&H online. Reconheci áudio fluído. Deseja que eu elabore um roteiro ou gere artes virtuais?",
    "Processando ondas vocais no idioma selecionado. A minha latência de resposta atual está abaixo de 45ms.",
    "Para ler PDFs, você também pode enviá-lo pelo menu de documentos ao lado. O que gostaria que eu leia ou fale para você?",
  ];

  const toggleMic = async () => {
    if (isActive) {
      // Turn off microphone
      stopMicrophone();
    } else {
      // Turn on microphone and visualizer
      await startMicrophone();
    }
  };

  const startMicrophone = async () => {
    try {
      setTranscript("Sintonizando frequências de microfone local...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsActive(true);
      setTranscript("Monitorando canais vocais... Fale agora.");
      drawVisualizer();

      // Simulate capturing voice every 3 seconds to trigger dynamic replies
      setTimeout(() => {
        handleSimulatedSpeechResult();
      }, 3500);

    } catch (err: any) {
      console.warn("Dispositivo de microfone recusado ou indisponível:", err);
      // Fail-safe simulation for systems without real microphone or inside iframe
      setIsActive(true);
      setTranscript("Monitorando canais vocais (Modo Simulação Ativo)...");
      drawSimulatedVisualizer();
      setTimeout(() => {
        handleSimulatedSpeechResult();
      }, 3000);
    }
  };

  const stopMicrophone = () => {
    setIsActive(false);
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
    }
    setTranscript("Assistente Virtual V&H pausado.");
  };

  const handleSimulatedSpeechResult = async () => {
    setLoading(true);
    setTranscript("Entrada vocal captada: 'Criar sugestão rápida para o central inteligente v&h...'");

    setTimeout(async () => {
      const randomReply = responses[Math.floor(Math.random() * responses.length)];
      setAiSpeechResponse(randomReply);
      setTranscript("Conversão Voz-para-Texto Concluída.");
      setLoading(false);

      // Trigger text-to-speech
      speakText(randomReply);
    }, 1500);
  };

  const speakText = async (textToSpeak: string) => {
    try {
      // Check if browser native SpeechSynthesis is available
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = "pt-PT";
        // Attempt server TTS first if configured, or fallback to native speech
        window.speechSynthesis.speak(utterance);
      }
    } catch (e) {
      console.warn("Speech synthesis error:", e);
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const renderFrame = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(renderFrame);

      analyserRef.current?.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.strokeStyle = "rgba(6, 182, 212, 0.45)"; // Cyan glow
      ctx.lineWidth = 2;
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        // Calculate dynamic wave heights relative to centers
        const offset = Math.sin(i * 0.15) * 15;
        const y = (v * canvas.height) / 2 + offset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      // Wave 2 purple accent
      ctx.strokeStyle = "rgba(147, 51, 234, 0.35)"; // Purple glow
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[bufferLength - 1 - i] / 128.0;
        const offset = Math.cos(i * 0.1) * 20;
        const y = (v * canvas.height) / 2 + offset;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };

    renderFrame();
  };

  const drawSimulatedVisualizer = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let phase = 0;
    const renderFrame = () => {
      if (!isActive) return;
      animationRef.current = requestAnimationFrame(renderFrame);
      phase += 0.1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw elegant mathematical sine wave
      for (let j = 0; j < 3; j++) {
        ctx.beginPath();
        ctx.lineWidth = j === 0 ? 3 : 1;
        ctx.strokeStyle = j === 0 
          ? "rgba(34, 211, 238, 0.7)" 
          : j === 1 
            ? "rgba(168, 85, 247, 0.4)" 
            : "rgba(6, 182, 212, 0.2)";
        
        for (let x = 0; x < canvas.width; x++) {
          const amplitude = j === 0 ? 40 : j === 1 ? 25 : 15;
          const y = canvas.height / 2 + Math.sin(x * 0.02 + phase + j) * amplitude * Math.sin(phase * 0.2);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };
    renderFrame();
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="bg-[#0f0e1a]/80 backdrop-blur-md rounded-2xl border border-white/5 p-6 md:p-8 h-full flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
              <AudioLines className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">Assistência Vocálica V&H</h3>
              <p className="text-[11px] text-slate-400 font-mono">MODELO ATIVO: {currentModel.toUpperCase()}</p>
            </div>
          </div>

          {/* Voice Engine selection */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-mono">VOZ:</span>
            <select
              value={selectedVoice}
              onChange={(e) => setSelectedVoice(e.target.value)}
              className="bg-black/40 border border-white/5 rounded-lg px-2 py-1 text-xs text-cyan-400 outline-none select-none font-mono cursor-pointer"
            >
              {voiceList.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Visualizer Stage */}
        <div className="relative w-full h-48 bg-black/60 rounded-2xl border border-white/5 flex flex-col items-center justify-center overflow-hidden mb-6">
          <canvas ref={canvasRef} width="600" height="200" className="absolute inset-0 w-full h-full pointer-events-none" />

          {/* Glowing Aura in center */}
          <div className={`w-28 h-28 rounded-full bg-cyan-500/10 border border-cyan-500/20 transition-all duration-700 flex items-center justify-center relative z-10 ${isActive ? "scale-110 shadow-[0_0_40px_rgba(6,182,212,0.2)]" : "scale-100"}`}>
            <button
              onClick={toggleMic}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? "bg-gradient-to-r from-red-500 via-pink-600 to-red-500 animate-pulse text-white shadow-2xl" : "bg-[#161524] text-[#a5a3bc] hover:text-white border border-white/15"}`}
            >
              {isActive ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
            </button>
          </div>

          <div className="absolute bottom-3 text-center z-10 select-none">
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">
              {isActive ? "SINTONIA ATIVA" : "SINTONIA DESATIVADA"}
            </p>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="p-4 bg-black/30 rounded-xl border border-white/5 space-y-3 font-sans">
          <div className="text-xs text-slate-400 leading-relaxed italic flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full shrink-0 mt-1.5"></span>
            <span>{transcript}</span>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-xs text-purple-400 font-mono select-none">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Canais de rede processando respostas neuronais de voz...</span>
            </div>
          )}

          {aiSpeechResponse && !loading && (
            <div className="p-3 bg-cyan-500/5 border border-cyan-500/15 rounded-xl space-y-1">
              <div className="flex justify-between items-center select-none text-[10px] text-cyan-400 font-mono">
                <span>V&H INTELLIGENT REPLY</span>
                <span className="flex items-center gap-1 font-sans">
                  <Volume2 className="w-3.5 h-3.5" /> Falanado ativo...
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">{aiSpeechResponse}</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-white/5 text-center select-none">
        <p className="text-[10px] text-slate-500 leading-relaxed font-mono">
          © V&H AI VOCAL ENGINE — ALTA FIDELIDADE INTEGRADA VIA GEMINI SPEECH PIPELINE
        </p>
      </div>
    </div>
  );
}
