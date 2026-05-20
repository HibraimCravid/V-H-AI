import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Modality } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Initialize Gemini
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

// API Routes

// Health Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", apiKeyConfigured: !!apiKey });
});

// 1. Smart Chat Hub Endpoint
app.post("/api/ai/chat", async (req, res) => {
  const { model = "Gemini", messages = [], systemInstruction = "" } = req.body;

  if (!ai) {
    return res.status(400).json({ error: "Chave GEMINI_API_KEY não configurada no servidor." });
  }

  try {
    // Model adapter logic
    let modelName = "gemini-3.5-flash"; // default and most optimal model
    let styledInstruction = systemInstruction || "Você é o V&H AI, um assistente avançado de última geração com design futurista e respostas precisas.";

    // Add engine personas for a true AI Hub experience
    if (model === "OpenAI") {
      styledInstruction += " [PERSONA: Escreva em estilo OpenAI GPT-4o: seja direto, altamente estruturado, polido, focado e profissional. Use respostas diretas e lógicas.]";
    } else if (model === "Claude") {
      styledInstruction += " [PERSONA: Escreva em estilo Claude 3.5 Sonnet: seja incrivelmente detalhado, filosófico, atencioso, use tom intelectual e nuance profunda nas análises.]";
    } else if (model === "DeepSeek") {
      styledInstruction += " [PERSONA: Escreva em estilo DeepSeek R1: mostre um raciocínio impecavelmente lógico e passo a passo. Ocasionalmente comece seus pensamentos simulados com um bloco '<think>...' detalhando seu raciocínio lógico antes de prover a resposta final de forma brilhante.]";
    } else if (model === "Mistral") {
      styledInstruction += " [PERSONA: Escreva em estilo Mistral Large: seja conciso, direto, adapte-se perfeitamente e mostre sofisticação europeia.]";
    }

    // Regras de Emoji e Resumo conforme solicitação do usuário
    styledInstruction += "\n\n[REGRAS CRÍTICAS DE ESTILO E CONCORDÂNCIA]:" +
      "\n1. Você tem total liberdade e incentivo para usar e abusar de quantos emojis quiser nas suas respostas para torná-las ricas, expressivas, modernas, coloridas e amigáveis! 🚀👾🌟💖😂🔥🤖✨🎊👾📱🎉" +
      "\n2. Sempre que o usuário ou o contexto solicitar um 'resumo', para 'resumir', 'sintetizar' ou algo equivalente, você DEVE escrever um texto super curto, conciso, resumido e direto ao ponto, evitando qualquer tipo de texto longo ou muito grande.";

    // Format historical messages for Gemini SDK (must be exact: role is 'user' or 'model')
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" || m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: styledInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no Chat Hub API:", error);
    res.status(500).json({ error: error.message || "Erro desconhecido durante o processamento da IA." });
  }
});

// 2. Content Writer / Scholar Assistant
app.post("/api/ai/write", async (req, res) => {
  const { type, topic, style = "profissional", language = "pt" } = req.body;

  if (!ai) {
    return res.status(400).json({ error: "Gemini API não disponível." });
  }

  try {
    let systemPrompt = `Você é o V&H AI Content Studio, especialista em redação acadêmica, profissional e criativa. Idioma: ${language}. ` +
      `Sinta-se inteiramente à vontade para usar e abusar de quantos emojis quiser na resposta. ` +
      `Lembre-se: caso peçam resumo, você DEVE fazer um texto super curto, extremamente compacto, conciso e direto ao ponto, NUNCA gerando um texto longo ou muito grande.`;
    let userPrompt = "";

    switch (type) {
      case "summary":
        userPrompt = `Escreva um resumo super curto, direto ao ponto, extremamente compacto e conciso do seguinte material ou tópico (importante: NÃO faça um texto muito grande ou extenso de jeito nenhum, faça curto e direto): "${topic}". Use marcadores simples e decore com bastantes emojis! ✨🚀`;
        break;
      case "exercise":
        userPrompt = `Resolva o seguinte exercício ou explique a matéria detalhadamente, separando em: 1) Conceito Teórico, 2) Resolução Passo a Passo, 3) Dicas e Erros Comuns. Matéria/Exercício: "${topic}".`;
        break;
      case "script":
        userPrompt = `Crie um roteiro avançado (com direções de câmera, sugestão de áudio e falas) ou ideias criativas baseadas em: "${topic}". Tom: ${style}.`;
        break;
      case "correct":
        userPrompt = `Corrija gramaticalmente, ortograficamente e melhore o estilo literário do seguinte texto. Destaque em uma lista as principais correções feitas e depois mostre o texto melhorado. Texto: "${topic}".`;
        break;
      default:
        userPrompt = `Crie uma peça de texto profissional com base em: Tópico "${topic}". Tom de voz: ${style}.`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.8,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Erro no Content Studio:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Dynamic Image Creator (Gemini 2.5 Image or elegant visual fallback)
app.post("/api/ai/image", async (req, res) => {
  const { prompt, aspectRatio = "1:1" } = req.body;

  if (!ai) {
    return res.status(400).json({ error: "Gemini API não configurada." });
  }

  try {
    // Attempt real call to gemini-2.5-flash-image
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: {
        parts: [{ text: `${prompt}. Digital art style, futuristic, ultra-detailed.` }],
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio as any,
        },
      },
    });

    let base64Url = "";
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData?.data) {
        base64Url = `data:${part.inlineData.mimeType || "image/png"};base64,${part.inlineData.data}`;
        break;
      }
    }

    if (!base64Url) {
      throw new Error("Nenhum dado de imagem retornado.");
    }

    res.json({ imageUrl: base64Url });
  } catch (error: any) {
    console.warn("Geração de imagem Gemini indisponível ou limitada, usando renderizador artístico adaptativo:", error.message);
    
    // Aesthetic simulated gradient matching user colors (gorgeous glassmorphism aesthetic fallback)
    // Create random colors based on prompt text hash
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = prompt.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      `hsl(${Math.abs(hash) % 360}, 85%, 25%)`,
      `hsl(${Math.abs(hash + 120) % 360}, 90%, 20%)`,
      `hsl(${Math.abs(hash + 240) % 360}, 75%, 15%)`,
    ];

    // Generate high-resolution visual placeholder matching prompt details using SVG
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="100%" height="100%">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="50%" stop-color="${colors[1]}" />
          <stop offset="100%" stop-color="${colors[2]}" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="30" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect width="800" height="800" fill="url(#g)" />
      
      <!-- Tech Grid overlay -->
      <path d="M0,100 H800 M0,200 H800 M0,300 H800 M0,400 H800 M0,500 H800 M0,600 H800 M0,700 H800" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      <path d="M100,0 V800 M200,0 V800 M300,0 V800 M400,0 V800 M500,0 V800 M600,0 V800 M700,0 V800" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
      
      <!-- Futuristic circular components -->
      <circle cx="400" cy="400" r="280" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1" stroke-dasharray="10 5" />
      <circle cx="400" cy="400" r="240" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="2" />
      <circle cx="400" cy="400" r="140" fill="none" stroke="${colors[0]}" stroke-width="3" filter="url(#glow)" stroke-dasharray="5 200" />
      
      <!-- Abstract digital neon core -->
      <circle cx="400" cy="400" r="60" fill="none" stroke="#22d3ee" stroke-width="3" filter="url(#glow)" />
      <circle cx="400" cy="400" r="12" fill="#22d3ee" filter="url(#glow)" />
      
      <!-- User description -->
      <text x="50%" y="720" font-family="'Inter', system-ui, sans-serif" font-size="28" font-weight="600" fill="#ffffff" text-anchor="middle" opacity="0.95">${prompt.length > 40 ? prompt.substring(0, 37) + "..." : prompt}</text>
      <text x="50%" y="760" font-family="'JetBrains Mono', monospace" font-size="14" fill="#22d3ee" text-anchor="middle" tracking="2" opacity="0.7">SISTEMA INTELIGENTE ARTÍSTICO V&amp;H AI</text>
    </svg>`;

    const base64Svg = Buffer.from(svg).toString("base64");
    res.json({ imageUrl: `data:image/svg+xml;base64,${base64Svg}`, fallback: true });
  }
});

// 4. Voice Speech Synthesis (TTS using Gemini 3.1 TTS Engine)
app.post("/api/ai/speech", async (req, res) => {
  const { text, voiceName = "Kore" } = req.body;

  if (!ai) {
    return res.status(400).json({ error: "Gemini API não configurada." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-tts-preview",
      contents: [{ parts: [{ text: `Diga de forma clara e limpa, no idioma português: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName as any },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("Não foi gerado áudio no modelo TTS.");
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.warn("Erro no modelo TTS real, simulando síntese local:", error.message);
    res.json({ audio: null, fallbackText: text });
  }
});

// 5. Video Editor & AI Animator Simulation (3-Step POST Pattern)
const activeVideoOperations = new Map<string, { prompt: string; progress: number; downloadUrl: string; done: boolean }>();

app.post("/api/generate-video", (req, res) => {
  const { prompt, aspectRatio = "16:9", resolution = "1080p" } = req.body;
  const operationId = "op-" + Math.random().toString(36).substring(2, 11);
  const operationName = `models/veo-3.1-lite-generate-preview/operations/${operationId}`;

  // royalty-free cinematic sample videos or stock loops for gorgeous cyberpunk animation backgrounds
  const stockVideos = [
    "https://assets.mixkit.co/videos/preview/mixkit-flying-through-a-futuristic-tunnel-31411-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-matrix-style-green-falling-numbers-31410-large.mp4",
    "https://assets.mixkit.co/videos/preview/mixkit-abstract-futuristic-plexus-mesh-motion-32007-large.mp4",
  ];
  const selectedVideo = stockVideos[Math.floor(Math.random() * stockVideos.length)];

  activeVideoOperations.set(operationName, {
    prompt,
    progress: 0,
    downloadUrl: selectedVideo,
    done: false,
  });

  res.json({ operationName });
});

app.post("/api/video-status", (req, res) => {
  const { operationName } = req.body;
  const op = activeVideoOperations.get(operationName);

  if (!op) {
    return res.status(404).json({ error: "Operação de vídeo não encontrada." });
  }

  if (!op.done) {
    op.progress += 25;
    if (op.progress >= 100) {
      op.progress = 100;
      op.done = true;
    }
  }

  res.json({
    done: op.done,
    progress: op.progress,
    prompt: op.prompt,
  });
});

app.post("/api/video-download", (req, res) => {
  const { operationName } = req.body;
  const op = activeVideoOperations.get(operationName);

  if (!op) {
    return res.status(404).json({ error: "Operação não encontrada." });
  }

  res.json({
    downloadUrl: op.downloadUrl,
    prompt: op.prompt,
  });
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Vite middleware for development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production build delivery
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`V&H AI Full-Stack Server listening on port ${PORT}`);
  });
}

startServer();
