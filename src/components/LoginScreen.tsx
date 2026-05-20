import React, { useState, useEffect, useRef } from "react";
import { auth, isFirebaseConnected } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  Sparkles,
  Mail,
  Lock,
  User,
  ArrowRight,
  RefreshCw,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  ShieldAlert,
  Calendar,
  Smile,
  Users,
  Eye,
  EyeOff,
  Sliders,
  X,
  Trash2,
  LockOpen,
  Inbox
} from "lucide-react";

interface LoginScreenProps {
  onAuthSuccess: (user: any, isLocalMode: boolean) => void;
}

interface LoggedUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  age: number;
  behavior: string;
  dateTime: string;
}

export default function LoginScreen({ onAuthSuccess }: LoginScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isResetMode, setIsResetMode] = useState(false);
  
  // Inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(18);
  const [behavior, setBehavior] = useState("Amigável, atencioso e divertido com muitos emojis! 🚀👾🌟");
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [forceLocal, setForceLocal] = useState(!isFirebaseConnected);

  // Verification 100-Second Code parameters
  const [verificationPending, setVerificationPending] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [userInputCode, setUserInputCode] = useState("");
  const [timer, setTimer] = useState(100);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated Webmail Client reader state
  const [selectedMailId, setSelectedMailId] = useState<string>("vh-mail-secure-code");

  // Onboarding first login customization states
  const [onboardingUser, setOnboardingUser] = useState<any | null>(null);
  const [onboardingAge, setOnboardingAge] = useState<number>(18);
  const [onboardingBehavior, setOnboardingBehavior] = useState("Amigável com muitos emojis coloridos! 🚀🌈✨");
  const [onboardingThemePreset, setOnboardingThemePreset] = useState<"white" | "white_readable" | "dark">("dark");
  const [onboardingBgColor, setOnboardingBgColor] = useState<string | undefined>(undefined);
  const [onboardingTextColor, setOnboardingTextColor] = useState<string | undefined>(undefined);

  // Admin access state
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAdminPasswordPrompt, setShowAdminPasswordPrompt] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState("");
  const [adminPasswordError, setAdminPasswordError] = useState<string | null>(null);
  const [adminUsers, setAdminUsers] = useState<LoggedUser[]>([]);
  const [showPasswords, setShowPasswords] = useState(false);

  // Load registered users history for administrative audit
  const loadAdminUsers = () => {
    try {
      const stored = localStorage.getItem("vh_registered_users");
      if (stored) {
        setAdminUsers(JSON.parse(stored));
      } else {
        // Bootstrap mock accounts for initial demo visualization if empty
        const initialMocks: LoggedUser[] = [
          {
            id: "vh-admin-1",
            name: "Victor Hugo (Fundador)",
            email: "admin@vh-ai.com",
            password: "passe-central-suprema",
            age: 26,
            behavior: "Atendimento ultra profissional e hiper automatizado ⚡",
            dateTime: new Date().toLocaleDateString() + " 08:30"
          },
          {
            id: "vh-user-2",
            name: "Ana Luísa Silva",
            email: "ana.luisa@gmail.com",
            password: "ana123password",
            age: 22,
            behavior: "Estilo amigável repleto de emojis e metáforas ricas ✨",
            dateTime: new Date().toLocaleDateString() + " 07:12"
          }
        ];
        localStorage.setItem("vh_registered_users", JSON.stringify(initialMocks));
        setAdminUsers(initialMocks);
      }
    } catch (_) {
      console.warn("Could not read local mock accounts");
    }
  };

  useEffect(() => {
    loadAdminUsers();
  }, []);

  // Countdown timer for 100-seconds verification code
  useEffect(() => {
    if (verificationPending && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timer === 0) {
      setErrorMsg("O tempo limite de 100 segundos expirou! Por favor, gere um novo código.");
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [verificationPending, timer]);

  // Generates 6 digit verification code and starts the 100s timer
  const triggerCodeVerification = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setTimer(100);
    setVerificationPending(true);
    setUserInputCode("");
    
    // Simulate real mandatory notification alert system without spilling the code on the same page
    setSuccessMsg(`📩 [E-MAIL OUT-OF-BAND ENVIADO]: Enviámos um e-mail de segurança seguro contendo o seu código de validação único de 6 dígitos. Por favor, aceda à sua "Caixa de Entrada" (Simulada no ecran ao lado ou abaixo) para o ler com segurança.`);
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    // Initial validations
    if (!email) {
      setErrorMsg("O endereço de E-mail é obrigatório.");
      setLoading(false);
      return;
    }
    if (!isResetMode && !password) {
      setErrorMsg("A palavra-passe é obrigatória.");
      setLoading(false);
      return;
    }
    if (!isLogin && !name) {
      setErrorMsg("O nome completo é obrigatório para registo.");
      setLoading(false);
      return;
    }
    if (!isLogin && (!age || age <= 0)) {
      setErrorMsg("É obrigatório informar a idade por conta das perguntas personalizadas.");
      setLoading(false);
      return;
    }

    try {
      // Setup successful generation & initiate 100s countdown with random code
      setLoading(false);
      triggerCodeVerification();
    } catch (err: any) {
      setErrorMsg(err.message || "Ocorreu um erro no processamento das credenciais.");
      setLoading(false);
    }
  };

  // Triggers final auth validation after user submits the 6-digit code send to email
  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (timer <= 0) {
      setErrorMsg("Esse código expirou! Clique em 'Reenviar' para obter outro código com mais 100 segundos.");
      return;
    }

    if (userInputCode.trim() !== generatedCode) {
      setErrorMsg("Código de 6 dígitos incorreto. Consulte a sua Caixa de Entrada do Webmail Simulado para ver o código de segurança oficial recebido por email.");
      return;
    }

    // Success Authentication Workflow! Write database / register login event
    try {
      // 1. Log or update registered user lists inside Central Database (localStorage for Admin tab)
      const storedUsers = localStorage.getItem("vh_registered_users");
      let currentUsersListByAdmin: LoggedUser[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      const userUUID = "usr-" + email.replace(/[^a-zA-Z0-9]/g, "") + "-" + (Math.floor(Math.random() * 100));
      
      // Look for existing user
      const existingUserIdx = currentUsersListByAdmin.findIndex((u) => u.email.toLowerCase() === email.toLowerCase());
      
      const loggedUserPayload: LoggedUser = {
        id: existingUserIdx !== -1 ? currentUsersListByAdmin[existingUserIdx].id : userUUID,
        name: isLogin && existingUserIdx !== -1 ? currentUsersListByAdmin[existingUserIdx].name : (name || email.split("@")[0]),
        email: email,
        password: password,
        age: isLogin && existingUserIdx !== -1 ? currentUsersListByAdmin[existingUserIdx].age : age,
        behavior: isLogin && existingUserIdx !== -1 ? currentUsersListByAdmin[existingUserIdx].behavior : behavior,
        dateTime: new Date().toLocaleString()
      };

      if (existingUserIdx !== -1) {
        currentUsersListByAdmin[existingUserIdx] = loggedUserPayload;
      } else {
        currentUsersListByAdmin.push(loggedUserPayload);
      }
      localStorage.setItem("vh_registered_users", JSON.stringify(currentUsersListByAdmin));
      setAdminUsers(currentUsersListByAdmin);

      // Save active session metadata inside local keys to adjust AI's behavior based on age and user guidelines
      localStorage.setItem("vh_active_age", loggedUserPayload.age.toString());
      localStorage.setItem("vh_active_behavior", loggedUserPayload.behavior);

      const responseAuthUser = {
        uid: loggedUserPayload.id,
        displayName: loggedUserPayload.name,
        email: loggedUserPayload.email,
        photoURL: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${loggedUserPayload.name}`,
      };

      // Check if onboarding completed for this user email
      const onboardingCompleted = localStorage.getItem(`vh_onboarding_done_${loggedUserPayload.id}`);
      
      if (!onboardingCompleted) {
        // Clear successMsg notification to show the customization form nicely
        setSuccessMsg(null);
        setErrorMsg(null);
        // Store in onboarding state
        setOnboardingUser(responseAuthUser);
        setOnboardingAge(loggedUserPayload.age);
        setOnboardingBehavior(loggedUserPayload.behavior);
      } else {
        // Trigger direct successful login
        onAuthSuccess(responseAuthUser, forceLocal);
      }
    } catch (err: any) {
      setErrorMsg("Falha ao registrar sessão: " + err.message);
    }
  };

  // Completes the onboarding customization phase
  const handleOnboardingComplete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onboardingUser) return;

    try {
      const userId = onboardingUser.uid;

      // Persist age in localStorage
      localStorage.setItem("vh_active_age", onboardingAge.toString());
      localStorage.setItem("vh_active_behavior", onboardingBehavior);

      // Persist onboarding completed marker
      localStorage.setItem(`vh_onboarding_done_${userId}`, "true");

      // Save complete customized profile representation
      const userProfilePayload = {
        uid: userId,
        displayName: onboardingUser.displayName,
        email: onboardingUser.email,
        photoUrl: onboardingUser.photoURL,
        age: onboardingAge,
        behaviorInstruction: onboardingBehavior,
        backgroundColor: onboardingBgColor,
        textColor: onboardingTextColor,
        preferences: {
          theme: "cyberpunk",
          wallpaper: "neon-dark",
          aiModel: "Gemini",
          voiceName: "Zephyr",
          language: "pt"
        }
      };

      localStorage.setItem(`profile_${userId}`, JSON.stringify(userProfilePayload));

      // Trigger successful login with onboarding configuration!
      onAuthSuccess(onboardingUser, forceLocal);
    } catch (err: any) {
      setErrorMsg("Erro ao finalizar a personalização da sua central: " + (err.message || err));
    }
  };

  // Helper code generator
  const handleRegenerateCode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setTimer(100);
    setUserInputCode("");
    setSuccessMsg(`🔄 [NOVO E-MAIL DE SEGURANÇA REENVIADO]: Um novo código de confirmação de 6 dígitos foi gerado e enviado para ${email || "seu e-mail"}. Consulte o seu painel de Webmail abaixo.`);
    setErrorMsg(null);
  };

  // Delete simulated credentials
  const handleAdminDeleteUser = (idToDelete: string) => {
    const revised = adminUsers.filter(u => u.id !== idToDelete);
    setAdminUsers(revised);
    localStorage.setItem("vh_registered_users", JSON.stringify(revised));
    setSuccessMsg("Utilizador removido do painel da central com sucesso! 🛡️");
  };

  // Mock emails configuration sintonized dynamically to generated random codes
  const mockEmails = [
    {
      id: "vh-mail-secure-code",
      from: "Segurança V&H AI Hub",
      senderEmail: "security@vh-hub.com",
      subject: `🔒 Código de Confirmação: ${generatedCode || "******"}`,
      time: "Agora mesmo",
      unread: true,
      body: `Código temporário para verificação da sua central inteligente Victor Hugo.`
    },
    {
      id: "vh-mail-welcome",
      from: "Victor Hugo (Fundador)",
      senderEmail: "victorhugo@vh-hub.com",
      subject: "💡 Dicas de Introdução para usar o V&H AI Hub",
      time: "Há 12 minutos",
      unread: false,
      body: `Olá! Bem-vindo ao V&H AI Hub!

Estamos muito felizes em ver você por aqui na nossa central de inteligência de nova geração. Aqui estão três dicas fundamentais para dominar a sua central do estúdio:

1. Escolha o seu Modelo de Raciocínio Preferido no topo da barra de mensagens para obter respostas com tons estruturados diferentes (Claude, GPT-4o, DeepSeek, Google Gemini).
2. Se você ativou o Modo Local Seguro, tenha em atenção que apenas logins que possuam um par de amizades aceites poderão enviar mensagens diretas para o núcleo da IA. Passe por "Pedidos de Amizade 🤝" para verificar os status ativos.
3. Siga para o Estúdio de Design Lunar/Solar nas configurações para ajustar o visual, as cores do display, as fontes de leitura ou a sua idade conforme desejar.

Abraço,
Victor Hugo.`
    },
    {
      id: "vh-mail-newsletter",
      from: "Servidor Nuvem V&H",
      senderEmail: "cloud@vh-hub.com",
      subject: "🚀 Atualização de Segurança: V&H Neural Layer v3.8 Ativada",
      time: "Há 2 horas",
      unread: false,
      body: `Prezado Utilizador,

Informamos que a camada neural protetiva 'V&H Neural Layer v3.8' foi sintonizada com total sucesso neste dispositivo terminal. Todos os prompts, imagens, vozes processadas e dados de conexões simétricas estão sob protocolos de criptografia local em conformidade total.

Para auditoria de acessos, consulte o painel administrativo protegido "Acesso Admin" no topo usando o código supremo sintonizado em 2409.

Sua chave de acesso em nuvem está ativa e operacional.

Atenciosamente,
Sistemas Operacionais V&H AI.`
    }
  ];

  return (
    <div 
      className="min-h-screen w-full flex flex-col items-center justify-center p-4 text-slate-800 bg-[#fbfbfd] overflow-y-auto relative font-sans transition-colors duration-500"
    >
      {/* Visual background aesthetics: Warm lighting of White theme default branding */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-100/30 via-purple-100/10 to-transparent pointer-events-none z-0" />

      {/* Main Responsive Grid Wrapper */}
      <div className={`w-full ${verificationPending ? "max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" : "max-w-lg"} z-10 my-4`}>
        
        {/* Left Card: Login Form Box */}
        <div className={`w-full ${verificationPending ? "lg:col-span-6" : ""} bg-white border border-slate-200/80 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.06)] p-6 sm:p-8 relative overflow-hidden transition-all duration-300 flex flex-col justify-between`}>
          <div className="absolute top-0 left-0 w-full h-[3.5px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

          {/* Network Badge & Simulators */}
          <div className="flex justify-between items-center mb-6 select-none">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full border border-slate-200 text-[11px] font-mono font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse"></span>
              NUVEM V&H INTELIGENTE ATIVA
            </div>
            
            <button
              onClick={() => {
                setShowAdminPasswordPrompt(true);
                setAdminPasswordInput("");
                setAdminPasswordError(null);
              }}
              className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 hover:underline select-none font-semibold"
            >
              <Users className="w-4 h-4" />
              Acesso Admin 🔐
            </button>
          </div>

          {/* Header Branding */}
          <div className="text-center mb-6 select-none">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-3 shadow-[0_8px_25px_rgba(99,102,241,0.25)]">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              V&H AI HUB
            </h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Central Completa e Futurista • Versão Inteligente Adaptativa
            </p>
          </div>

          {/* Email Alert Simulator Display Container without leaking code on target block */}
          {successMsg && (
            <div className="p-4 mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex flex-col gap-2 shadow-sm animate-fadeIn">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold block tracking-wide text-[10px] text-emerald-600 uppercase font-mono">AVISO DE LOGIN ENVIADO POR E-MAIL 📧</span>
                  <p className="mt-1 leading-relaxed text-slate-700">{successMsg}</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Alerts */}
          {errorMsg && (
            <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span className="font-semibold">{errorMsg}</span>
            </div>
          )}

        {/* STAGE ONBOARDING: First Login Customization Wizard */}
        {onboardingUser ? (
          <form onSubmit={handleOnboardingComplete} className="space-y-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-4 rounded-2xl">
              <span className="text-xs text-indigo-700 font-mono font-bold block uppercase tracking-wide">
                🎨 Primeiro Login Detectado: Painel de Personalização
              </span>
              <p className="text-slate-600 text-[11px] mt-1.5 leading-relaxed">
                Olá, <strong className="text-slate-900">{onboardingUser.displayName}</strong>! Conclua o seu primeiro acesso escolhendo como deseja personalizar a sua experiência no V&H AI Hub.
              </p>
            </div>

            {/* Customization 1: Age */}
            <div>
              <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Informe sua Idade <span className="text-red-500 font-bold">*</span>
              </label>
              <input
                type="number"
                min={6}
                max={120}
                value={onboardingAge}
                onChange={(e) => setOnboardingAge(parseInt(e.target.value) || 18)}
                className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 text-slate-800 font-semibold font-sans"
                required
              />
              <span className="block text-[8px] text-slate-400 mt-1 font-mono leading-tight">
                Importante: Adaptamos o vocabulário das respostas educativas com base na sua idade!
              </span>
            </div>

            {/* Customization 2: Behavior/Persona */}
            <div>
              <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Smile className="w-4 h-4 text-indigo-500" />
                Como quer que o Robô V&H AI Inteligente se comporte?
              </label>
              <textarea
                rows={2}
                value={onboardingBehavior}
                onChange={(e) => setOnboardingBehavior(e.target.value)}
                placeholder="Ex de comportamento: Seja alegre, use muitos emojis..."
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 text-slate-800 leading-relaxed font-semibold resize-none font-sans"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                <button
                  type="button"
                  onClick={() => setOnboardingBehavior("Amigável com muitos emojis coloridos! 🚀🌈✨👾🌟")}
                  className={`text-[9.5px] px-2 py-0.5 rounded border transition-all ${onboardingBehavior.includes("emojis") ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold" : "bg-slate-50 border-transparent text-slate-500"}`}
                >
                  Emoji Alegre 🌈
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingBehavior("Directo e focado, explicando apenas o necessário de forma super curta e ágil. ⚡")}
                  className={`text-[9.5px] px-2 py-0.5 rounded border transition-all ${onboardingBehavior.includes("focado") ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold" : "bg-slate-50 border-transparent text-slate-500"}`}
                >
                  Focado / Curto ⚡
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingBehavior("Professor mestre didático que ensina com exemplos escolares passo a passo. 🧑‍🏫📖")}
                  className={`text-[9.5px] px-2 py-0.5 rounded border transition-all ${onboardingBehavior.includes("didático") ? "bg-indigo-50 border-indigo-200 text-indigo-600 font-bold" : "bg-slate-50 border-transparent text-slate-500"}`}
                >
                  Didático Escolar 📖
                </button>
              </div>
            </div>

            {/* Customization 3: Visual Colors Preset */}
            <div>
              <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-500" />
                Selecione o Esquema de Cores do Painel
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* White Background + White Letters (requested "coloque a app na cor branca e as letras brancas mas se quiser trocar usa qualquer cor") */}
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingThemePreset("white");
                    setOnboardingBgColor("#ffffff");
                    setOnboardingTextColor("#ffffff");
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${onboardingThemePreset === "white" ? "bg-white border-pink-500 ring-2 ring-pink-400" : "bg-white border-slate-200"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-300 flex items-center justify-center text-[10px]">🤍</span>
                  <span className="text-[9.5px] font-bold text-slate-800">Branco & Branco</span>
                  <span className="text-[7.5px] text-rose-500 font-semibold font-mono leading-none">Passe o mouse p/ ler / mude depois</span>
                </button>

                {/* White Background + Readable letters */}
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingThemePreset("white_readable");
                    setOnboardingBgColor("#ffffff");
                    setOnboardingTextColor("#1e293b");
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${onboardingThemePreset === "white_readable" ? "bg-white border-indigo-500 ring-2 ring-indigo-400 font-bold" : "bg-white border-slate-200"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[10px]">📄</span>
                  <span className="text-[9.5px] font-bold text-slate-800">Branco Legível</span>
                  <span className="text-[7.5px] text-slate-400 font-semibold font-mono leading-none">Fundo branco com letras escuras</span>
                </button>

                {/* Dark Espacial default theme */}
                <button
                  type="button"
                  onClick={() => {
                    setOnboardingThemePreset("dark");
                    setOnboardingBgColor(undefined);
                    setOnboardingTextColor(undefined);
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${onboardingThemePreset === "dark" ? "bg-slate-950 border-indigo-500 ring-2 ring-indigo-400 text-white" : "bg-white border-slate-200"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-slate-900 border border-slate-950 flex items-center justify-center text-[10px]">🌌</span>
                  <span className={`text-[9.5px] font-bold ${onboardingThemePreset === "dark" ? "text-indigo-300" : "text-slate-800"}`}>Fundo Dark</span>
                  <span className="text-[7.5px] text-slate-400 font-semibold font-mono leading-none">Visual Espacial V&H original</span>
                </button>
              </div>

              {onboardingThemePreset === "white" && (
                <div className="mt-2.5 p-2 bg-pink-50 border border-pink-100 rounded-lg text-[9px] text-pink-700 leading-normal select-none font-bold">
                  ⚠️ NOTA DO REQUISITO: Você ativou fundo branco e letras brancas! Quando quiser ler os textos ou alterar para qualquer outra cor, basta usar os novos selectores dinâmicos rápidos do Estúdio de Design no canto superior de configurações!
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-500 to-indigo-600 hover:opacity-90 active:scale-[0.98] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-indigo-200 shadow-lg border border-indigo-400/20"
            >
              Finalizar e Ativar Minha Central V&H 🌌
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        ) : verificationPending ? (
          <form onSubmit={handleVerifySubmit} className="space-y-5">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center">
              <span className="text-xs text-slate-500 font-medium block">
                Etapa Obrigatória de Segurança de Login
              </span>
              <p className="text-slate-700 text-xs mt-1.5 px-4">
                Por favor, insira o código aleatório de 6 dígitos que foi "enviado" para o seu endereço de e-mail <strong className="text-slate-900">{email}</strong>.
              </p>

              {/* Real Countdown Display */}
              <div className="mt-4 flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-100 rounded-xl py-2 w-max mx-auto px-4">
                <Clock className={`w-4.5 h-4.5 animate-spin ${timer < 30 ? "text-rose-500" : "text-indigo-600"}`} />
                <span className={`text-sm font-mono font-bold ${timer < 30 ? "text-rose-600 animate-pulse" : "text-indigo-900"}`}>
                  Tempo limite: {timer} segundos
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-slate-700 text-xs font-mono font-bold uppercase tracking-wider text-center">
                Código de Confirmação (6 Dígitos)
              </label>
              <input
                type="text"
                maxLength={6}
                value={userInputCode}
                onChange={(e) => setUserInputCode(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="Ex: 123456"
                className="w-full text-center py-3 bg-slate-50 rounded-xl border border-slate-200/80 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-xl font-bold font-mono outline-none tracking-widest text-slate-900"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={handleRegenerateCode}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 active:scale-[0.98] rounded-xl text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer"
              >
                Gerar Novo Código
              </button>

              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer shadow-indigo-200 shadow-md"
              >
                Confirmar Login
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setVerificationPending(false);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              className="w-full text-slate-500 hover:text-slate-800 text-xs underline font-medium text-center block pt-2 cursor-pointer"
            >
              Voltar ao formulário anterior
            </button>
          </form>
        ) : (
          /* STAGE B: Standard Sign In or Sign Up Form with behavior & age queries */
          <form onSubmit={handleAction} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/50 mb-2">
                
                {/* Age Input (Obrigatorio por conta das perguntas) */}
                <div>
                  <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    Idade <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="number"
                    min={6}
                    max={120}
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                    placeholder="Sua idade"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                    required
                  />
                  <span className="block text-[8px] text-slate-400 mt-1 font-mono leading-tight">
                    Ajuda a personalizar a dificuldade das perguntas.
                  </span>
                </div>

                {/* Name field */}
                <div>
                  <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-500" />
                    Nome <span className="text-red-500 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Victor Hugo"
                    className="w-full px-3 py-2 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 text-slate-800 font-semibold"
                    required
                  />
                  <span className="block text-[8px] text-slate-400 mt-1 font-mono leading-tight">
                    Como deseja ser chamado por nós.
                  </span>
                </div>

                {/* AI Persona config ('comporte') */}
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-slate-700 text-[10px] font-mono font-bold mb-1 uppercase tracking-wider flex items-center gap-1">
                    <Smile className="w-3.5 h-3.5 text-indigo-500" />
                    Como quer que ele se comporte?
                  </label>
                  <textarea
                    rows={2}
                    value={behavior}
                    onChange={(e) => setBehavior(e.target.value)}
                    placeholder="Ex: Responda em estilo socrático, amigável ou com muitos emojis coloridos..."
                    className="w-full p-2.5 bg-white rounded-xl border border-slate-200 text-xs outline-none focus:border-indigo-500 text-slate-800 leading-relaxed font-semibold resize-none"
                  />
                  <div className="flex flex-wrap gap-1 mt-1">
                    <button
                      type="button"
                      onClick={() => setBehavior("Super amigável e fofo, com direito a usar e abusar de emojis em cada frase! 😍🌈🚀🤖")}
                      className="text-[8px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600"
                    >
                      Alegre / Emoji 🌈
                    </button>
                    <button
                      type="button"
                      onClick={() => setBehavior("Ultra conciso e curto, directo ao ponto. Sem palavras grandes ou explicações desnecessárias. 🧠⚙️")}
                      className="text-[8px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600"
                    >
                      Focado/Curto ⚡
                    </button>
                    <button
                      type="button"
                      onClick={() => setBehavior("Estilo instrutor escolar paciente que explica tudo passo a passo como para uma criança. 🧑‍🏫📖")}
                      className="text-[8px] bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded text-slate-600"
                    >
                      Didático Escolar 📖
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-slate-700 text-xs font-mono font-bold mb-1.5 uppercase tracking-wider">
                Endereço de E-mail
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="utilizador@central-vh.com"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-semibold"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-slate-700 text-xs font-mono font-bold uppercase tracking-wider">
                  Palavra-passe
                </label>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 font-mono"
                  required
                />
              </div>
            </div>

            {/* Submit Action Button trigger security 6 code validation */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 active:scale-[0.98] rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all border border-indigo-400/20 shadow-[0_4px_15px_rgba(99,102,241,0.2)]"
            >
              {isLogin ? (
                <>
                  Seguir para Código de Segurança do E-mail
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  Registrar e Solicitar Código de Ativação
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Toggle Account Type */}
        {!verificationPending && (
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500 select-none">
            {isLogin ? (
              <p>
                Não possui conta ainda?{" "}
                <button
                  onClick={() => {
                    setIsLogin(false);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  Cadastre-se na Central
                </button>
              </p>
            ) : (
              <p>
                Já possui uma conta registada?{" "}
                <button
                  onClick={() => {
                    setIsLogin(true);
                    setErrorMsg(null);
                    setSuccessMsg(null);
                  }}
                  className="text-indigo-600 hover:text-indigo-800 font-bold underline cursor-pointer"
                >
                  Efetuar Entrada Direta
                </button>
              </p>
            )}
          </div>
        )}
      </div>

      {/* Right Card: Simulated Webmail Inbox Portal */}
      {verificationPending && (
        <div className="lg:col-span-6 w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 flex flex-col text-slate-100 animate-fadeIn h-full min-h-[500px]">
          {/* Mail Header */}
          <div className="bg-slate-950 px-4 py-3 border-b border-slate-850 flex items-center justify-between select-none">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 block animate-pulse"></span>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-indigo-400 shrink-0" />
                V&H Secure Webmail
              </span>
            </div>
            <span className="text-[8px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-bold">
              CONEXÃO ENCRIPTADA CRYPTO-TLS
            </span>
          </div>

          {/* Simulated Mail Client Grid / Tabs */}
          <div className="grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[440px]">
            
            {/* Inbox Sidebar List */}
            <div className="md:col-span-12 lg:col-span-5 border-r border-slate-850 bg-slate-950/20 p-3 space-y-2 overflow-y-auto">
              <div className="flex items-center justify-between px-1.5 pb-2 border-b border-slate-800/60 font-mono text-[9px]">
                <span className="font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  Caixa de Entrada (3)
                </span>
                <span className="bg-indigo-600/30 text-indigo-300 px-1.5 rounded-full font-bold">
                  1 Nova
                </span>
              </div>

              <div className="space-y-1.5 pt-1 select-none">
                {[
                  {
                    id: "vh-mail-secure-code",
                    from: "Segurança V&H Hub",
                    senderEmail: "security@vh-hub.com",
                    subject: "🔒 Código de Confirmação",
                    time: "Agora mesmo",
                    isNew: true,
                  },
                  {
                    id: "vh-mail-welcome",
                    from: "Victor Hugo (Fundador)",
                    senderEmail: "victorhugo@vh-hub.com",
                    subject: "💡 Dicas de Introdução",
                    time: "Há 12m",
                    isNew: false,
                  },
                  {
                    id: "vh-mail-newsletter",
                    from: "Servidor Nuvem V&H",
                    senderEmail: "cloud@vh-hub.com",
                    subject: "🚀 Atualização v3.8 Ativa",
                    time: "Há 2h",
                    isNew: false,
                  }
                ].map((emailItem) => {
                  const isSelected = selectedMailId === emailItem.id;
                  return (
                    <button
                      key={emailItem.id}
                      type="button"
                      onClick={() => setSelectedMailId(emailItem.id)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-indigo-600/25 border-indigo-500/50 hover:bg-indigo-600/35 text-white"
                          : "bg-slate-900/40 border-slate-850 hover:bg-slate-850/40 text-slate-300"
                      }`}
                    >
                      <div className="flex justify-between items-center w-full gap-1">
                        <span className={`text-[10px] font-extrabold truncate max-w-[85px] ${emailItem.isNew ? "text-slate-100" : "text-slate-400"}`}>
                          {emailItem.from}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 shrink-0">
                          {emailItem.time}
                        </span>
                      </div>
                      <span className={`text-[9.5px] truncate font-sans block ${emailItem.isNew && !isSelected ? "text-indigo-400 font-bold" : "text-slate-300"}`}>
                        {emailItem.subject}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email Reading Panel */}
            <div className="md:col-span-12 lg:col-span-7 bg-slate-900/45 p-4 flex flex-col justify-between overflow-y-auto min-h-[300px]">
              {(() => {
                const currentMail = mockEmails.find(m => m.id === selectedMailId);
                if (!currentMail) {
                  return (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500 select-none py-10">
                      <Mail className="w-8 h-8 opacity-40 mb-2 animate-bounce" />
                      <span className="text-xs">Selecione um e-mail para abrir</span>
                    </div>
                  );
                }
                return (
                  <div className="flex-1 flex flex-col justify-between h-full">
                    <div className="space-y-3 pb-3">
                      {/* Header details */}
                      <div className="border-b border-slate-800 pb-2 flex flex-col gap-1.5">
                        <span className="text-slate-500 text-[8px] font-mono font-bold uppercase tracking-widest block">ASSUNTO:</span>
                        <h4 className="font-extrabold text-xs text-white leading-snug">
                          {currentMail.subject}
                        </h4>

                        <div className="flex items-center gap-2 mt-2 select-none">
                          <div className="w-6.5 h-6.5 rounded-lg bg-indigo-500/20 text-indigo-300 font-black text-xs flex items-center justify-center uppercase font-mono">
                            {currentMail.from[0]}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-200 block leading-tight">{currentMail.from}</span>
                            <span className="text-[8px] font-mono text-slate-500 leading-none block mt-0.5">{currentMail.senderEmail}</span>
                          </div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="text-[11px] text-slate-300 leading-relaxed font-sans whitespace-pre-wrap select-text max-h-[220px] overflow-y-auto pr-1">
                        {currentMail.id === "vh-mail-secure-code" ? (
                          <>
                            Olá,<br /><br />
                            Recebemos uma solicitação de acesso temporário na sua central inteligente <strong>V&H AI Hub</strong>.<br /><br />
                            Para validar a sua identidade sob o nosso protocolo e carregar as suas configurações, por favor insira o seguinte código de validação único de 6 dígitos no formulário eletrônico ao lado:<br /><br />

                            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center my-2 shadow-inner select-all">
                              <span className="block text-[8px] font-mono uppercase tracking-widest text-indigo-400 mb-1 font-bold">Código de Segurança Temporário</span>
                              <span className="text-2xl font-mono tracking-widest bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent font-black block">
                                {generatedCode || "------"}
                              </span>
                              <div className="mt-3 flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(generatedCode);
                                    alert("Código copiado com sucesso! Agora basta colar no campo de login de confirmação do dispositivo.");
                                  }}
                                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white font-extrabold text-[9px] uppercase rounded-lg cursor-pointer transition-all"
                                >
                                  Copiar Código de Segurança 🔌
                                </button>
                              </div>
                            </div>

                            Este código é válido por 100 segundos e foi sintonizado com criptografia simétrica local.<br /><br />
                            Com os melhores cumprimentos,<br />
                            <strong>Departamento de Operações V&H AI Hub.</strong>
                          </>
                        ) : (
                          currentMail.body
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850 text-center select-none mt-auto">
                      <span className="text-[8px] font-mono text-slate-500 tracking-wider">
                        V&H SECURE MAIL GATEWAY v3.1 • {currentMail.time}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

          </div>
        </div>
      )}

    </div>

      {/* STAGE C.1: Admin Password Entry Prompt Modal (Password 2409) */}
      {showAdminPasswordPrompt && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white border border-slate-200/95 w-full max-w-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-indigo-500"></div>
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 select-none">
              <div className="flex items-center gap-2">
                <LockOpen className="w-5 h-5 text-amber-500 shrink-0" />
                <span className="font-extrabold text-sm text-slate-900 font-sans uppercase">Acesso Reservado Administrador</span>
              </div>
              <button
                type="button"
                onClick={() => setShowAdminPasswordPrompt(false)}
                className="p-1 hover:bg-slate-150 rounded text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form 
              onSubmit={(e) => {
                e.preventDefault();
                if (adminPasswordInput === "2409") {
                  setShowAdminPasswordPrompt(false);
                  setShowAdminPanel(true);
                  loadAdminUsers();
                  setAdminPasswordInput("");
                  setAdminPasswordError(null);
                } else {
                  setAdminPasswordError("Erro: Palavra-passe administrativa incorreta! Acesso negado.");
                }
              }} 
              className="mt-4 space-y-4"
            >
              <div className="space-y-1.5">
                <p className="text-slate-600 text-xs leading-relaxed">
                  Por favor, digite a palavra-passe suprema da central para desbloquear a auditoria de utilizadores e logins ativos:
                </p>
                <input
                  type="password"
                  placeholder="Introduza a palavra-passe..."
                  value={adminPasswordInput}
                  onChange={(e) => setAdminPasswordInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 rounded-lg border border-slate-250 text-xs outline-none focus:border-indigo-500 font-mono tracking-widest text-slate-900 font-bold"
                  required
                  autoFocus
                />
              </div>

              {adminPasswordError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{adminPasswordError}</span>
                </div>
              )}

              <div className="flex gap-2 pt-1 select-none">
                <button
                  type="button"
                  onClick={() => setShowAdminPasswordPrompt(false)}
                  className="flex-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-600 text-center cursor-pointer transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold text-center cursor-pointer transition-all shadow-md"
                >
                  Entrar no Painel ADM
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STAGE C: Immersive Administrative Panel Modal ("lado que os adm podem ter acesso") */}
      {showAdminPanel && (
        <div className="fixed inset-0 bg-[#07060d]/80 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 w-full max-w-3xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Admin Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between select-none">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm tracking-wide">PAINEL SUPREMO DO ADMINISTRADOR</h3>
                  <span className="text-[10px] text-slate-500 font-mono">CONEXÕES E LOGINS ATIVOS DO SISTEMA</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowAdminPanel(false)}
                className="p-1 px-2.5 bg-slate-200 hover:bg-slate-300 rounded-lg text-xs font-semibold text-slate-700 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" /> Fechar
              </button>
            </div>

            {/* Admin Controls */}
            <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 items-center justify-between text-xs text-slate-600">
              <span className="font-mono text-[10px] uppercase">Registros totais na central: <strong>{adminUsers.length}</strong></span>
              
              <button
                onClick={() => setShowPasswords(!showPasswords)}
                className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer font-semibold text-[11px]"
              >
                {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPasswords ? "Mascarar Palavras-Passe" : "Exibir Palavras-Passe"}
              </button>
            </div>

            {/* Users Data Viewer */}
            <div className="p-5 overflow-y-auto flex-1 text-xs">
              {adminUsers.length === 0 ? (
                <div className="text-center py-10 text-slate-400 select-none">
                  Nenhum utilizador ativo ou cadastrado na base central local.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-150 text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                        <th className="pb-2">Utilizador / Código</th>
                        <th className="pb-2">E-mail de Login</th>
                        <th className="pb-2">Palavra-passe</th>
                        <th className="pb-2 text-center">Idade</th>
                        <th className="pb-2">Comportamento IA</th>
                        <th className="pb-2">Último Acesso</th>
                        <th className="pb-2 text-center">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {adminUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition">
                          <td className="py-3">
                            <span className="font-bold text-slate-900 block">{u.name}</span>
                            <span className="text-[9px] font-mono text-slate-400">{u.id}</span>
                          </td>
                          <td className="py-3 font-mono text-indigo-600">{u.email}</td>
                          <td className="py-3 font-mono">
                            {showPasswords ? (
                              <span className="bg-amber-100 text-amber-950 px-1 py-0.5 rounded text-[11px] font-bold">{u.password || "Nuvem/Google"}</span>
                            ) : (
                              <span className="text-slate-300">••••••••</span>
                            )}
                          </td>
                          <td className="py-3 text-center">
                            <span className="bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full text-[10px]">
                              {u.age} anos
                            </span>
                          </td>
                          <td className="py-3 max-w-[150px] truncate text-slate-500 font-sans" title={u.behavior}>
                            {u.behavior}
                          </td>
                          <td className="py-3 text-[10px] text-slate-500 font-mono">{u.dateTime}</td>
                          <td className="py-3 text-center">
                            <button
                              onClick={() => handleAdminDeleteUser(u.id)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition"
                              title="Banir/Remover acesso"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-100 flex items-center justify-between text-[11px] text-slate-500 select-none">
              <span>⚠️ ESTE PAINEL FOI INJETADO EXCLUSIVAMENTE PARA ADMINISTRADORES DE CENTRAL DE AUDITORIA V&H</span>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Deseja apagar TODOS os registros locais desta central?")) {
                    localStorage.removeItem("vh_registered_users");
                    setAdminUsers([]);
                    setSuccessMsg("Banco de dados local limpo!");
                  }
                }}
                className="text-rose-600 hover:underline font-bold"
              >
                Limpar Todos os Logins
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
