import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Trash2,
  Send,
  Sparkles,
  Menu,
  X,
  Paperclip,
  LogOut,
  GraduationCap,
  PenTool,
  Image as ImageIcon,
  Video as VideoIcon,
  Mic,
  Settings,
  ArrowRight,
  User,
  Activity,
  Search,
  ChevronRight,
  Volume2,
  Smartphone,
  Info,
  Users,
} from "lucide-react";
import LoginScreen from "./components/LoginScreen";
import VoicePanel from "./components/VoicePanel";
import ContentPanel from "./components/ContentPanel";
import ImagePanel from "./components/ImagePanel";
import VideoPanel from "./components/VideoPanel";
import SettingsPanel from "./components/SettingsPanel";
import FriendsPanel from "./components/FriendsPanel";
import { Message, ChatSession, UserProfile } from "./types";
import { AI_MODELS, WALLPAPERS } from "./constants";

export default function App() {
  // Auth state
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLocalMode, setIsLocalMode] = useState(true);

  // Active view
  const [activeTab, setActiveTab] = useState<"chat" | "content" | "image" | "video" | "voice" | "settings" | "friends">("chat");

  // Track if accepted friends list is populated
  const [hasAcceptedFriends, setHasAcceptedFriends] = useState<boolean>(true);

  // Sidebar / list controls
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatSearch, setChatSearch] = useState("");

  // Chat engine states
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentModel, setCurrentModel] = useState("Gemini");
  const [promptInput, setPromptInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  // Suggested Prompts
  const suggestionPrompts = [
    { label: "Corrigir texto", prompt: "Por favor corrija as concordâncias gramaticais deste parágrafo: " },
    { label: "Roteiro p/ Reels", prompt: "Crie ideias de roteiro curto e cativante para o TikTok sobre Inteligência Artificial..." },
    { label: "Resolver Exercício", prompt: "Resolva e me explique o passo a passo de: " },
    { label: "Poema Futurista", prompt: "Crie um poema cibernético sobre a evolução da inteligência orgânica..." },
  ];

  // PDF drag-and-drop state
  const [pdfExtractedText, setPdfExtractedText] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string | null>(null);

  // Bootstrapping user authentication state / Local caching fallback
  const handleAuthSuccess = (authUser: any, localMode: boolean) => {
    setIsLocalMode(localMode);

    // Build complete user profile
    const profile: UserProfile = {
      uid: authUser.uid,
      displayName: authUser.displayName || "Explorador V&H",
      email: authUser.email || "",
      photoUrl: authUser.photoURL || `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${authUser.uid}`,
      preferences: {
        theme: "cyberpunk",
        wallpaper: "neon-dark",
        aiModel: "Gemini",
        voiceName: "Zephyr",
        language: "pt",
      },
    };

    // Load custom profile if already exists
    const cachedProfile = localStorage.getItem(`profile_${authUser.uid}`);
    if (cachedProfile) {
      try {
        const parsed = JSON.parse(cachedProfile);
        profile.displayName = parsed.displayName || profile.displayName;
        profile.photoUrl = parsed.photoUrl || profile.photoUrl;
        profile.preferences = parsed.preferences || profile.preferences;
        profile.age = parsed.age;
        profile.behaviorInstruction = parsed.behaviorInstruction;
        profile.backgroundColor = parsed.backgroundColor;
        profile.textColor = parsed.textColor;
      } catch (e) {
        console.warn("Could not parse cached custom profile preferences");
      }
    }

    setUser(profile);
    setSelectedWallpaper(profile.preferences.wallpaper);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const updateProfile = (updatedFields: Partial<UserProfile>) => {
    if (!user) return;
    const nextUser = { ...user, ...updatedFields };
    setUser(nextUser);

    // Sync full profile configuration to local memory
    localStorage.setItem(`profile_${user.uid}`, JSON.stringify(nextUser));
    if (updatedFields.preferences?.wallpaper) {
      setSelectedWallpaper(updatedFields.preferences.wallpaper);
    }

    // Dynamic Instant feedback: Also re-tune welcome-1 message context if it exists in current conversations list!
    const userAge = localStorage.getItem("vh_active_age") || "18";
    const userBehavior = localStorage.getItem("vh_active_behavior") || nextUser.behaviorInstruction || "Amigável com muitos emojis coloridos! 🚀🌈✨";

    setChatSessions((prev) => {
      const updated = prev.map((session) => {
        if (session.id === "session-init") {
          return {
            ...session,
            messages: session.messages.map((m) => {
              if (m.id === "msg-welcome-1") {
                return {
                  ...m,
                  content: `Olá **${nextUser.displayName}**! Bem-vindo(a) ao **V&H AI**, sua central inteligente absoluta.

Sintonizei o meu núcleo neural para servir especificamente utilizadores com **${userAge} anos** de idade sob o comportamento definido abaixo:

🎯 **"${userBehavior}"**

Você pode interagir livremente comigo neste canal e alternar o comportamento quando desejar no painel de configurações orbital. No que posso ajudar hoje? 🛸✨`
                };
              }
              return m;
            })
          };
        }
        return session;
      });
      localStorage.setItem(`chats_${user.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const [selectedWallpaper, setSelectedWallpaper] = useState("neon-dark");

  // Keep track of active friendships in real time
  useEffect(() => {
    const handleSyncFriends = () => {
      const stored = localStorage.getItem("vh_friends_list");
      if (stored) {
        try {
          const list = JSON.parse(stored);
          const hasFriend = list.some((f: any) => f.status === "accepted");
          setHasAcceptedFriends(hasFriend);
        } catch (err) {
          setHasAcceptedFriends(false);
        }
      } else {
        // By default, the base template spawns "Carlos Mendes" as accepted, so initial holds true
        setHasAcceptedFriends(true);
      }
    };

    handleSyncFriends();
    window.addEventListener("storage", handleSyncFriends);
    return () => {
      window.removeEventListener("storage", handleSyncFriends);
    };
  }, []);

  // Load chat session on user login
  useEffect(() => {
    if (!user) return;
    const historyKey = `chats_${user.uid}`;
    const cachedChats = localStorage.getItem(historyKey);
    if (cachedChats) {
      const parsed = JSON.parse(cachedChats);
      setChatSessions(parsed);
      if (parsed.length > 0) {
        setActiveSessionId(parsed[0].id);
      }
    } else {
      // Bootstrap default setup conversation
      const userAge = localStorage.getItem("vh_active_age") || "18";
      const userBehavior = localStorage.getItem("vh_active_behavior") || user.behaviorInstruction || "Amigável com muitos emojis coloridos! 🚀🌈✨";
      
      const welcomeSession: ChatSession = {
        id: "session-init",
        userId: user.uid,
        title: "Benvindo ao V&H AI Hub",
        model: "Gemini",
        category: "chat",
        messages: [
          {
            id: "msg-welcome-1",
            role: "assistant",
            content: `Olá **${user.displayName}**! Bem-vindo(a) ao **V&H AI**, sua central inteligente absoluta.

Sintonizei o meu núcleo neural para servir especificamente utilizadores com **${userAge} anos** de idade sob o comportamento definido abaixo:

🎯 **"${userBehavior}"**

Você pode interagir livremente comigo neste canal e alternar o comportamento quando desejar no painel de configurações orbital. No que posso ajudar hoje? 🛸✨`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
        updatedAt: new Date().toISOString(),
      };
      setChatSessions([welcomeSession]);
      setActiveSessionId(welcomeSession.id);
      localStorage.setItem(historyKey, JSON.stringify([welcomeSession]));
    }
  }, [user]);

  // Helper sync utility
  const saveSessions = (sessionsList: ChatSession[]) => {
    if (!user) return;
    setChatSessions(sessionsList);
    localStorage.setItem(`chats_${user.uid}`, JSON.stringify(sessionsList));
  };

  // Chat Actions
  const createNewChat = () => {
    if (!user) return;
    const newId = "session-" + Math.random().toString(36).substring(2, 11);
    const newSession: ChatSession = {
      id: newId,
      userId: user.uid,
      title: "Nova conversa inteligente",
      model: currentModel,
      category: "chat",
      messages: [],
      updatedAt: new Date().toISOString(),
    };

    const nextSessions = [newSession, ...chatSessions];
    saveSessions(nextSessions);
    setActiveSessionId(newId);
    setSidebarOpen(false);
  };

  const deleteSession = (e: React.MouseEvent, idToDelete: string) => {
    e.stopPropagation();
    const nextList = chatSessions.filter((s) => s.id !== idToDelete);
    saveSessions(nextList);

    if (activeSessionId === idToDelete) {
      if (nextList.length > 0) {
        setActiveSessionId(nextList[0].id);
      } else {
        setActiveSessionId(null);
      }
    }
  };

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || promptInput;
    if (!textToSend.trim() || !user || !activeSessionId) return;

    setPromptInput("");
    setChatLoading(true);

    // Create user message
    const userMsg: Message = {
      id: "msg-u-" + Math.random().toString(36).substring(2, 11),
      role: "user",
      content: textToSend + (pdfExtractedText ? `\n\n[CONTEÚDO DO DOCUMENTO ANEXADO "${pdfFileName}"]: ${pdfExtractedText}` : ""),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    // Reset document upload
    setPdfExtractedText(null);
    setPdfFileName(null);

    // Update active chat session
    const currentSessions = chatSessions.map((session) => {
      if (session.id === activeSessionId) {
        const titleText = session.messages.length === 0 ? (textToSend.substring(0, 24) + "...") : session.title;
        return {
          ...session,
          title: titleText,
          messages: [...session.messages, userMsg],
          updatedAt: new Date().toISOString(),
        };
      }
      return session;
    });

    saveSessions(currentSessions);

    // Show AI thinking item
    const thinkingMsg: Message = {
      id: "msg-ai-think",
      role: "assistant",
      content: "Analisando redes neurais...",
      timestamp: "",
      isThinking: true,
    };

    setChatSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return { ...s, messages: [...s.messages, thinkingMsg] };
        }
        return s;
      })
    );

    // Make Server-Side API Call
    try {
      const activeSession = currentSessions.find((s) => s.id === activeSessionId);
      const postMessages = activeSession
        ? activeSession.messages.map((m) => ({ role: m.role, content: m.content }))
        : [{ role: "user", content: textToSend }];

      const userAge = localStorage.getItem("vh_active_age") || "18";
      const userBehavior = localStorage.getItem("vh_active_behavior") || "Amigável com muitos emojis coloridos! 🚀🌈✨";

      const dynamicSystemInstruction = `Você é o robô central inteligente V&H AI de resposta ágil.
INFORMAÇÃO DO USUÁRIO CONECTADO:
- Idade do usuário: ${userAge} anos. IMPORTANTE: Adapte as perguntas adicionais, o nível de profundidade educativa e a complexidade de vocabulário especificamente para a idade de ${userAge} anos.
- Comportamento de Persona Desejado: "${userBehavior}". Siga esta diretriz de comportamento de forma brilhante.

REGRAS CRÍTICAS DE ESTILO:
1. Você tem total liberdade e incentivo de usar e abusar de quantos emojis quiser nas suas respostas nos diálogos para as tornar modernas, ricas e coloridas! 🚀👾🌟💖😂🔥🤖✨
2. Sempre que pedirem "resumo", "resumir", "sintetizar" ou equivalente, você DEVE gerar um texto super curto, extremamente compacto, conciso e direto ao ponto. NUNCA faça textos longos ou muito grandes de maneira nenhuma.`;

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: currentModel,
          messages: postMessages,
          systemInstruction: dynamicSystemInstruction,
        }),
      });

      const data = await res.json();

      const aiMsg: Message = {
        id: "msg-ai-" + Math.random().toString(36).substring(2, 11),
        role: "assistant",
        content: data.text || "Sem resposta. Verifique a chave da API no painel de segredos do estúdio.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      // Filter out thinking and update
      saveSessions(
        chatSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages.filter((m) => m.id !== "msg-ai-think"), aiMsg],
              updatedAt: new Date().toISOString(),
            };
          }
          return session;
        })
      );
    } catch (err: any) {
      console.error(err);
      const errMessage = `Erro do canal V&H AI: ${err.message || "A central inteligente de rede não respondeu no prazo."}`;
      const failMsg: Message = {
        id: "msg-ai-err",
        role: "assistant",
        content: errMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      saveSessions(
        chatSessions.map((session) => {
          if (session.id === activeSessionId) {
            return {
              ...session,
              messages: [...session.messages.filter((m) => m.id !== "msg-ai-think"), failMsg],
            };
          }
          return session;
        })
      );
    } finally {
      setChatLoading(false);
    }
  };

  // Speech TTS handler for Assistant replies
  const handleVoiceSpeak = (content: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const cleanContent = content.replace(/[#*`_]/g, ""); // clear markdown codes
      const utterance = new SpeechSynthesisUtterance(cleanContent.substring(0, 300));
      utterance.lang = "pt-PT";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock PDF upload and text parser simulation
  const handlePdfUploadMock = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfFileName(file.name);
    // Simulate text extraction
    setPdfExtractedText(
      `[MOCK PDF TEXT EXTRACTION OF FILE: ${file.name}] Este documento detalha a introdução e o roteamento de redes neurais do assistente V&H AI, apresentando o seu manifesto em ambiente sandbox com suporte local persistente e sincronização na nuvem através do SDK do FirebaseFirestore.`
    );
  };

  // Filter sessions inside the search
  const filteredSessions = chatSessions.filter((s) =>
    s.title.toLowerCase().includes(chatSearch.toLowerCase())
  );

  const activeSession = chatSessions.find((s) => s.id === activeSessionId);
  const wallpaperObj = WALLPAPERS.find((w) => w.id === selectedWallpaper) || WALLPAPERS[0];

  if (!user) {
    return <LoginScreen onAuthSuccess={handleAuthSuccess} />;
  }

  const customStyle: React.CSSProperties = user.backgroundColor ? {
    backgroundColor: user.backgroundColor,
    color: user.textColor || "#ffffff",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
  } : {
    backgroundImage: wallpaperObj.value,
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)"
  };

  const showBackgroundOverlays = !user.backgroundColor;

  return (
    <div
      className="min-h-screen flex overflow-hidden relative font-sans"
      style={customStyle}
    >
      {/* Background radial and grid overlays to amplify deep immersive atmosphere */}
      {showBackgroundOverlays && (
        <>
          <div className="absolute inset-0 bg-black/35 backdrop-blur-[2px] pointer-events-none z-0" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none active-glow opacity-80 z-0" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] pointer-events-none active-glow opacity-40 z-0" />
        </>
      )}

      {/* Sidebar - responsive drawers */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-[#0a0a0f]/85 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="flex flex-col flex-1 h-0">
          {/* Main Launcher Header */}
          <div className="p-4 flex items-center justify-between border-b border-white/10 select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-sm tracking-wider text-glow bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent">V&H AI HUB</span>
                <span className="block text-[8px] font-mono text-indigo-400/80 uppercase tracking-widest">CENTRAL INTELIGENTE</span>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Action Buttons */}
          <div className="p-4 flex flex-col gap-1.5">
            <button
              onClick={() => {
                createNewChat();
                setActiveTab("chat");
              }}
              className="w-full py-2.5 px-3 bg-white/5 hover:bg-indigo-500/10 text-slate-100 rounded-xl border border-white/10 hover:border-indigo-500/30 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all uppercase tracking-wider select-none text-glow shadow-sm"
            >
              <Plus className="w-4 h-4 text-indigo-400" />
              Novo Chat Inteligente
            </button>
          </div>

          {/* Chat List Search */}
          <div className="px-4 mb-2 select-none">
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-500 pointer-events-none">
                <Search className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Pesquisar histórico..."
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl py-1.5 pl-8 pr-3 text-[11px] outline-none text-slate-300 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all font-sans"
              />
            </div>
          </div>

          {/* Internal Chat History List */}
          <div className="flex-1 overflow-y-auto px-2 space-y-1 scrollbar-none select-none">
            {filteredSessions.length > 0 ? (
              filteredSessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setActiveTab("chat");
                    setSidebarOpen(false);
                  }}
                  className={`group w-full p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-between border ${activeSessionId === session.id && activeTab === "chat" ? "bg-indigo-500/15 border-indigo-500/30 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${activeSessionId === session.id && activeTab === "chat" ? "text-indigo-400" : "text-slate-500"}`} />
                    <div className="truncate">
                      <span className="text-[11px] font-semibold leading-none block">{session.title}</span>
                      <span className="text-[9px] font-mono text-slate-500 mt-0.5 block">{session.model.toUpperCase()}</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => deleteSession(e, session.id)}
                    className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-slate-500 hover:text-red-400 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[10px] text-slate-600 font-sans italic">
                Sem histórico registrado.
              </div>
            )}
          </div>

          {/* Category Tools Hub List */}
          <div className="p-4 border-t border-white/10 select-none space-y-1 font-sans">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest pl-2 mb-2 block">
              Módulos Inteligentes
            </span>

            {[
              { id: "chat", tag: "Conversar", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "content", tag: "Criação Escrita", icon: <GraduationCap className="w-4 h-4" /> },
              { id: "image", tag: "Gerador Gráfico", icon: <ImageIcon className="w-4 h-4" /> },
              { id: "video", tag: "Cinema Studio IA", icon: <VideoIcon className="w-4 h-4" /> },
              { id: "voice", tag: "Assistente Vocal", icon: <Mic className="w-4 h-4" /> },
              { id: "friends", tag: "Pedidos de Amizade 🤝", icon: <Users className="w-4 h-4" /> },
            ].map((tool) => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTab(tool.id as any);
                  setSidebarOpen(false);
                }}
                className={`w-full p-2.5 rounded-xl transition-all flex items-center gap-2.5 text-xs text-left cursor-pointer ${activeTab === tool.id ? "bg-gradient-to-r from-indigo-500/15 to-purple-500/5 text-white border-l-2 border-indigo-400 pl-2.5 shadow-sm" : "text-slate-400 hover:bg-white/5 hover:text-slate-200"}`}
              >
                <span className={activeTab === tool.id ? "text-indigo-400" : "text-slate-500"}>
                  {tool.icon}
                </span>
                <span className="font-semibold">{tool.tag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* User profile section at bottom of sidebar */}
        <div className="p-4 border-t border-white/10 bg-black/35 select-none pb-5">
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab("settings")}
              className="flex items-center gap-2.5 cursor-pointer max-w-[190px] group"
            >
              <img
                src={user.photoUrl}
                alt={user.displayName}
                className="w-10 h-10 rounded-xl border border-white/10 group-hover:border-cyan-400 transition-all p-0.5"
              />
              <div className="truncate">
                <span className="text-xs font-bold block text-slate-200 truncate group-hover:text-cyan-400 transition-all">{user.displayName}</span>
                <span className="text-[9px] font-mono text-slate-500 truncate block uppercase tracking-wider">configurações</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 bg-white/5 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl border border-white/5"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container Workspace */}
      <main className="flex-1 flex flex-col min-w-0 lg:pl-72 z-10 relative">
        {/* Workspace dynamic header */}
        <header className="h-[64px] bg-[#0c0a15]/40 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between select-none z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="p-1 px-3 bg-indigo-500/15 border border-indigo-500/35 text-indigo-300 text-[10px] font-mono uppercase rounded-full tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.1)]">
                {activeTab} mode
              </span>
            </div>
          </div>

          {/* Quick theme state status banner */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full text-[10px] text-slate-400 font-mono border border-white/5">
              <Activity className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>SISTEMA V&H ONLINE</span>
            </div>
          </div>
        </header>

        {/* Dynamic Inner views Content area */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === "chat" && (
            <div className="flex flex-col h-full max-w-4xl mx-auto justify-between">
              <div>
                {/* 1. Model choices picker */}
                <div className="mb-4">
                  <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest pl-1 mb-2">
                    Selecione o Motor de IA
                  </span>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2 select-none">
                    {AI_MODELS.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setCurrentModel(m.id)}
                        className={`p-3 rounded-2xl text-left border flex flex-col justify-between h-16 cursor-pointer transition-all duration-300 ${currentModel === m.id ? `bg-indigo-500/20 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.25)] text-white` : "bg-black/25 border-white/5 hover:border-white/15 text-slate-400 hover:text-slate-200"}`}
                      >
                        <span className={`text-[10px] font-bold block ${currentModel === m.id ? "text-indigo-300" : "text-slate-300"}`}>
                          {m.name}
                        </span>
                        <span className="text-[8px] text-slate-500 truncate leading-none block">{m.tagline}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Optional Alert showing uploaded doc */}
                {pdfFileName && (
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/25 rounded-xl flex items-center justify-between mb-4 shadow-sm">
                    <div className="flex items-center gap-2 text-xs">
                      <GraduationCap className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="font-semibold block">{pdfFileName}</span>
                        <span className="text-[10px] text-slate-500 font-mono text-glow">CONTEÚDO EXTRAÍDO DISPONÍVEL NO PRÓXIMO PROMPT</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setPdfFileName(null);
                        setPdfExtractedText(null);
                      }}
                      className="p-1 hover:bg-white/10 text-slate-400 hover:text-white rounded transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Suggestions triggers when empty */}
                {(!activeSession || activeSession.messages.length === 0) && (
                  <div className="my-6">
                    <span className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest text-center select-none pt-2">
                      O que gostaria que eu pesquisasse agora?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 select-none">
                      {suggestionPrompts.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setPromptInput(s.prompt);
                            handleSendMessage(s.prompt);
                          }}
                          className="p-3 bg-white/3 hover:bg-indigo-500/10 text-xs text-left text-slate-300 hover:text-indigo-350 rounded-xl border border-white/5 hover:border-indigo-500/30 cursor-pointer transition-all duration-300 flex items-center justify-between"
                        >
                          <span className="truncate">{s.label}</span>
                          <ChevronRight className="w-4 h-4 shrink-0 text-slate-600 group-hover:text-indigo-400 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Chat message loops */}
                <div className="space-y-4 mb-4">
                  {activeSession?.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex gap-3 max-w-[85%] ${m.role === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
                    >
                      {/* Avatar badge */}
                      <div className="w-8 h-8 rounded-lg outlineoutline-white/5 bg-[#161524] p-0.5 shrink-0 flex items-center justify-center select-none shadow">
                        {m.role === "user" ? (
                          <img src={user.photoUrl} alt="User" />
                        ) : (
                          <Sparkles className="w-4.5 h-4.5 text-cyan-400" />
                        )}
                      </div>

                      {/* Msg Box */}
                      <div
                        className={`p-3.5 rounded-2xl border text-xs leading-relaxed space-y-1 ${m.role === "user" ? "bg-cyan-500/10 border-cyan-500/20 text-slate-100" : "bg-[#0e0d16]/80 backdrop-blur-md border-white/5 text-slate-200"}`}
                      >
                        {m.isThinking ? (
                          <div className="flex items-center gap-2 text-slate-500 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce delay-200"></span>
                            <span className="text-[10px]">Alinhando modelos neuronais...</span>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap font-sans">
                            {/* Parse custom bold syntax and thought blocks in layout responses */}
                            {m.content.split("\n\n").map((chunk, paragraphIndex) => {
                              if (chunk.startsWith("<think>")) {
                                return (
                                  <div key={paragraphIndex} className="p-3 py-2.5 bg-purple-500/5 border border-purple-500/15 text-purple-300 font-mono rounded-xl text-[10px] uppercase tracking-wide leading-relaxed my-2">
                                    <span className="font-bold block mb-1">Raciocínio Interno do R1:</span>
                                    {chunk.replace(/<think>|<\/think>/g, "")}
                                  </div>
                                );
                              }
                              return (
                                <p key={paragraphIndex} className="leading-relaxed">
                                  {chunk.split("**").map((subText, subIdx) => {
                                    if (subIdx % 2 === 1) {
                                      return <strong key={subIdx} className="font-bold text-white text-glow inline font-sans">{subText}</strong>;
                                    }
                                    return subText;
                                  })}
                                </p>
                              );
                            })}
                          </div>
                        )}

                        {/* Read out loud voice assist element */}
                        {m.role === "assistant" && !m.isThinking && (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleVoiceSpeak(m.content)}
                              className="text-[10px] text-slate-500 hover:text-cyan-400 flex items-center gap-1 transition-all cursor-pointer font-semibold"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Ouvir Voz
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input form box */}
              <div className="p-4 bg-white/3 backdrop-blur-xl rounded-2xl border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] select-none transition-all duration-300">
                {isLocalMode && !hasAcceptedFriends ? (
                  <div className="p-3 bg-indigo-500/10 border border-indigo-500/25 rounded-xl text-center select-none space-y-2">
                    <p className="text-xs text-indigo-300 font-semibold font-sans">
                      🔒 CANAL TEMPORARIAMENTE BLOQUEADO (RESTRIÇÃO DE MODO LOCAL)
                    </p>
                    <p className="text-[10px] text-slate-400 max-w-lg mx-auto leading-normal font-sans">
                      Olá! Você está com o <strong className="text-amber-400 font-mono">Modo Local Seguro</strong> ativo. Sob esta diretriz, apenas logins com amizades aceitas do sistema estão autorizados a enviar mensagens para a inteligência.
                    </p>
                    <button
                      onClick={() => setActiveTab("friends")}
                      className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                    >
                      Ir Para Pedidos de Amizade 🤝
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {/* File Upload Trigger */}
                    <label className="p-3 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/10 cursor-pointer flex items-center justify-center transition-all shrink-0">
                      <Paperclip className="w-5 h-5 animate-pulse" />
                      <input
                        type="file"
                        accept=".pdf,.txt,.docx"
                        onChange={handlePdfUploadMock}
                        className="hidden"
                      />
                    </label>

                    {/* Prompt Text block */}
                    <input
                      type="text"
                      value={promptInput}
                      onChange={(e) => setPromptInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSendMessage();
                      }}
                      placeholder={isLocalMode ? "Conversar em Modo Local Protegido (só amizades autorizadas)..." : "Envie sua direção ou pergunta para a IA central V&H..."}
                      className="flex-1 bg-black/55 rounded-xl border border-white/10 hover:border-white/15 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 px-4 text-xs text-slate-100 outline-none transition-all placeholder-slate-600 font-sans"
                    />

                    {/* Send Button */}
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={chatLoading}
                      className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl flex items-center justify-center cursor-pointer transition-all border border-indigo-400/20 shadow-[0_4px_20px_rgba(99,102,241,0.25)] shrink-0 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <p className="text-[9px] text-slate-500 mt-2 text-center font-mono select-none tracking-wider">
                  CONEXÃO ADAPTATIVA SEGURA E ENCRIPTADA • V&H NEURAL LAYER v3.8
                </p>
              </div>
            </div>
          )}

          {activeTab === "content" && <ContentPanel currentModel={currentModel} />}
          {activeTab === "image" && <ImagePanel />}
          {activeTab === "video" && <VideoPanel />}
          {activeTab === "voice" && <VoicePanel currentModel={currentModel} />}
          {activeTab === "friends" && <FriendsPanel />}
          {activeTab === "settings" && (
            <SettingsPanel
              user={user}
              isLocalMode={isLocalMode}
              onUpdateProfile={updateProfile}
              onLogout={handleLogout}
            />
          )}
        </div>
      </main>
    </div>
  );
}
