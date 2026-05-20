import { Wallpaper } from "./types";

export const WALLPAPERS: Wallpaper[] = [
  {
    id: "neon-dark",
    name: "Immersive Neo (Padrão)",
    value: "radial-gradient(circle at 50% 0%, #1a1a2e 0%, #050507 70%)",
    preview: "bg-radial from-[#1a1a2e] to-[#050507] border-indigo-500/20",
  },
  {
    id: "indigo-wave",
    name: "Futurismo Cibernético",
    value: "linear-gradient(135deg, #1e1b4b 0%, #311042 50%, #020617 100%)",
    preview: "bg-gradient-to-br from-indigo-950 via-[#311042] to-slate-950 border-purple-500/20",
  },
  {
    id: "aurora",
    name: "Brilho Aurora Boreada",
    value: "linear-gradient(135deg, #022c22 0%, #064e3b 50%, #020617 100%)",
    preview: "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 border-emerald-500/20",
  },
  {
    id: "stellar-light",
    name: "Claro Minimalista",
    value: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    preview: "bg-gradient-to-br from-slate-50 to-slate-200 border-slate-300",
  },
];

export const AI_MODELS = [
  {
    id: "Gemini",
    name: "Gemini 3.5 Flash",
    tagline: "Ultra rápido e multimodal nativo (Google)",
    color: "from-cyan-400 to-blue-500",
    icon: "Sparkles",
  },
  {
    id: "OpenAI",
    name: "GPT-4o (OpenAI)",
    tagline: "Excelente para tarefas executivas e códigos estruturados",
    color: "from-emerald-400 to-green-600",
    icon: "Zap",
  },
  {
    id: "Claude",
    name: "Claude 3.5 Sonnet",
    tagline: "Profundamente humano, textual e reflexivo (Anthropic)",
    color: "from-orange-400 to-amber-600",
    icon: "BookOpen",
  },
  {
    id: "DeepSeek",
    name: "DeepSeek R1",
    tagline: "Raciocínio lógico refinado e resolução incremental (R1)",
    color: "from-purple-400 to-indigo-600",
    icon: "Brain",
  },
  {
    id: "Mistral",
    name: "Mistral Large",
    tagline: "Compacto, poliglota de alta performance (Mistral)",
    color: "from-red-400 to-rose-600",
    icon: "Activity",
  },
];

export const CONTENT_TEMPLATES = [
  {
    id: "summary",
    title: "Resumo Escolar Automático",
    description: "Crie apostilas didáticas compactas e estruturadas com base em qualquer matéria acadêmica.",
    placeholder: "Ex: Segunda Guerra Mundial, fotossíntese vegetal, ou digite um texto para resumir...",
    icon: "GraduationCap",
  },
  {
    id: "exercise",
    title: "Resolução de Exercícios",
    description: "Insira perguntas, problemas ou fórmulas matemáticos-científicas para obter soluções explicadas passo a passo.",
    placeholder: "Ex: Calcule a derivada de f(x) = x^3 - 4x ou explique as leis de Newton...",
    icon: "PenTool",
  },
  {
    id: "script",
    title: "Criador de Roteiros & Ideias",
    description: "Crie roteiros cinematográficos completos para YouTube, Reels, TikTok ou ideias inovadoras.",
    placeholder: "Ex: Roteiro sobre 'Como economizar dinheiro em 2026' focado no público jovem...",
    icon: "Video",
  },
  {
    id: "correct",
    title: "Correção Ortográfica & Estilo",
    description: "Submeta seu texto para polimento ortográfico, gramatical e refinamento de vocabulário.",
    placeholder: "Ex: Cole aqui a redação ou parágrafo para correção detalhada...",
    icon: "CheckSquare",
  },
];
