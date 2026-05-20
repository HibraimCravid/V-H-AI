import { useState } from "react";
import { WALLPAPERS, AI_MODELS } from "../constants";
import { UserProfile } from "../types";
import { 
  User, 
  Image, 
  Monitor, 
  Settings, 
  Sparkles, 
  LogOut, 
  CheckCircle, 
  Smartphone, 
  Wifi, 
  Palette, 
  Sliders,
  RotateCcw
} from "lucide-react";

interface SettingsPanelProps {
  user: UserProfile;
  isLocalMode: boolean;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onLogout: () => void;
}

export default function SettingsPanel({ user, isLocalMode, onUpdateProfile, onLogout }: SettingsPanelProps) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(user.uid);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Editable user states for Custom Intelligence
  const [activeAge, setActiveAge] = useState<number>(() => {
    return parseInt(localStorage.getItem("vh_active_age") || "18") || 18;
  });
  const [activeBehavior, setActiveBehavior] = useState<string>(() => {
    return localStorage.getItem("vh_active_behavior") || user.behaviorInstruction || "Amigável com muitos emojis coloridos! 🚀🌈✨";
  });

  // Available avatars seeds
  const avatarSeeds = ["nova", "orion", "cosmos", "luna", "pulse", "cyber"];

  const handleSaveProfile = () => {
    // Persist new values
    localStorage.setItem("vh_active_age", activeAge.toString());
    localStorage.setItem("vh_active_behavior", activeBehavior);

    onUpdateProfile({
      displayName,
      photoUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${selectedAvatarSeed}`,
      age: activeAge,
      behaviorInstruction: activeBehavior,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleWallpaperChange = (id: string) => {
    onUpdateProfile({
      preferences: {
        ...user.preferences,
        wallpaper: id,
      },
    });
  };

  const handleThemeChange = (theme: "light" | "dark" | "cyberpunk") => {
    // Also clear custom color overrides when switching main CSS themes for visual safety
    onUpdateProfile({
      backgroundColor: undefined,
      textColor: undefined,
      preferences: {
        ...user.preferences,
        theme,
      },
    });
  };

  // Custom Color actions
  const applyCustomColors = (bg: string | undefined, text: string | undefined) => {
    onUpdateProfile({
      backgroundColor: bg,
      textColor: text,
    });
  };

  const activeBg = user.backgroundColor !== undefined ? user.backgroundColor : "#0a0a0f";
  const activeText = user.textColor !== undefined ? user.textColor : "#ffffff";

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-5 md:p-6 text-slate-100 font-sans h-full flex flex-col justify-between shadow-[0_15px_50px_rgba(0,0,0,0.4)]">
      <div>
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold">Configurações e Perfil do Utilizador</h3>
          </div>
          <div className="flex items-center gap-2 px-2.5 py-1 bg-white/5 rounded-full border border-white/10 text-[10px] font-mono">
            {isLocalMode ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span className="text-amber-500 font-bold">MODO CENTRAL LOCAL</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-indigo-400 font-bold font-mono">FIREBASE NUVEM ONLINE</span>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Personal Profile & Age Display */}
          <div className="space-y-5">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <User className="w-4 h-4 text-indigo-400" /> Perfil de IA Customizado
            </h4>

            {/* Avatar picker */}
            <div className="flex items-center gap-4 p-4 bg-black/30 border border-white/10 rounded-xl">
              <div className="relative">
                <img
                  src={user.photoUrl}
                  alt={user.displayName}
                  className="w-16 h-16 rounded-xl border border-indigo-400/40 bg-black p-1 shadow-[0_0_15px_rgba(99,102,241,0.25)] select-none"
                />
              </div>

              <div className="flex-1 space-y-2">
                <label className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase select-none">Mudar Semente do Avatar</label>
                <div className="flex gap-1.5 flex-wrap">
                  {avatarSeeds.map((seed) => (
                    <button
                      key={seed}
                      onClick={() => {
                        setSelectedAvatarSeed(seed);
                        onUpdateProfile({
                          photoUrl: `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}`,
                        });
                      }}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all uppercase cursor-pointer ${selectedAvatarSeed === seed ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300" : "bg-black/40 border border-transparent text-slate-500 hover:text-slate-300"}`}
                    >
                      {seed}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Display name Input */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                Nome de Utilizador
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-black/50 rounded-xl border border-white/10 py-2.5 px-3.5 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans font-semibold"
              />
            </div>

            {/* General Profile Logs & Customizing Behaviour */}
            <div className="bg-black/30 p-4 rounded-xl border border-white/10 space-y-4 text-xs font-sans">
              <div className="flex justify-between items-center select-none pb-2 border-b border-white/5">
                <span className="text-slate-400 font-sans">E-mail Registado:</span>
                <span className="font-mono text-indigo-300 font-semibold">{user.email || "vh-simulado@exemplo.com"}</span>
              </div>

              {/* Edit Age in Settings */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest select-none font-bold">
                  Idade de Adaptação Escolar
                </label>
                <input
                  type="number"
                  min={6}
                  max={120}
                  value={activeAge}
                  onChange={(e) => setActiveAge(parseInt(e.target.value) || 18)}
                  className="w-full bg-black/50 rounded-xl border border-white/10 py-2 px-3 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans font-semibold"
                />
                <span className="block text-[8px] text-slate-500 font-mono select-none">
                  A IA adapta o vocabulário das respostas educativas com base na idade.
                </span>
              </div>

              {/* Edit Behavior Instruction in Settings */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest select-none font-bold">
                  Instruções de Comportamento do Robô
                </label>
                <textarea
                  rows={3}
                  value={activeBehavior}
                  onChange={(e) => setActiveBehavior(e.target.value)}
                  placeholder="Escreva como você quer que o robô inteligente se comporte (seja alegre, didático, curto etc)..."
                  className="w-full bg-black/50 rounded-xl border border-white/10 p-2.5 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-sans font-semibold resize-none leading-relaxed"
                />
                <span className="block text-[8px] text-indigo-400 font-mono select-none font-bold">
                  ✨ Escreva exatamente como deseja que a IA inteligente se comporte!
                </span>
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  Perfil Atualizado!
                </>
              ) : (
                "Guardar Alterações"
              )}
            </button>
          </div>

          {/* Right Column: Theme & Custom Color Customizer ("qualquer cor que ele quiser") */}
          <div className="space-y-5">
            <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5 select-none">
              <Palette className="w-4 h-4 text-indigo-400" /> Estúdio de Cores & Design
            </h4>

            {/* Theme picker */}
            <div>
              <label className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1.5 select-none">
                Papéis de Parede do Fundo
              </label>
              <div className="grid grid-cols-2 gap-2">
                {WALLPAPERS.slice(0, 4).map((w) => (
                  <button
                    key={w.id}
                    onClick={() => {
                      applyCustomColors(undefined, undefined); // Clear solid overrides to reveal wallpaper!
                      handleWallpaperChange(w.id);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${user.preferences.wallpaper === w.id && user.backgroundColor === undefined ? "ring-2 ring-indigo-400 border-indigo-400" : "border-white/5 bg-black/20 hover:border-white/10"}`}
                  >
                    <span className={`w-7 h-7 rounded-lg shrink-0 border ${w.preview}`} style={{ background: w.value }} />
                    <span className="text-[10px] text-slate-300 font-medium truncate">{w.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Background and Text Colors (as requested "coloque a cor branca e letras brancas, mas se quiser trocar usa qualquer cor") */}
            <div className="bg-black/30 border border-white/10 p-4 rounded-xl space-y-3">
              <span className="block text-[10px] font-mono text-indigo-300 uppercase tracking-widest select-none font-bold">
                🎨 Customização de Cores orbital
              </span>

              {/* Presets Grid */}
              <div className="space-y-2">
                <span className="block text-[9px] text-slate-500 font-mono">SELECIONE UM PRESET RÁPIDO:</span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => applyCustomColors("#ffffff", "#ffffff")}
                    className="py-1.5 px-2 bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 text-[9px] font-bold rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>Branco & Branco 🤍</span>
                    <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                  </button>
                  <button
                    onClick={() => applyCustomColors("#ffffff", "#1e293b")}
                    className="py-1.5 px-2 bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 text-[9px] font-bold rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>Branco Legível 📄</span>
                    <span className="w-3 h-3 rounded-full bg-slate-900" />
                  </button>
                  <button
                    onClick={() => applyCustomColors("#0c0a15", "#ffffff")}
                    className="py-1.5 px-2 bg-slate-950 text-white border border-white/10 hover:bg-slate-900 text-[9px] font-bold rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>Preto Imersivo 🌌</span>
                    <span className="w-3 h-3 rounded-full bg-indigo-500" />
                  </button>
                  <button
                    onClick={() => applyCustomColors("#0f3c15", "#39ff14")}
                    className="py-1.5 px-2 bg-emerald-950 text-emerald-300 border border-white/10 hover:bg-emerald-900 text-[9px] font-bold rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <span>Matrix Hacker 💚</span>
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                  </button>
                </div>
              </div>

              {/* Dynamic Color Pickers Sliders ("se o utilizador quiser trocar pode usar qualquer cor") */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-white/5">
                <div>
                  <label className="block text-[9px] text-slate-400 font-mono mb-1 select-none">FUNDO DA APP:</label>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <input
                      type="color"
                      value={activeBg}
                      onChange={(e) => applyCustomColors(e.target.value, user.textColor || "#ffffff")}
                      className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{activeBg.toUpperCase()}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-slate-400 font-mono mb-1 select-none">COR DA LETRA:</label>
                  <div className="flex items-center gap-2 bg-black/40 p-1.5 rounded-lg border border-white/5">
                    <input
                      type="color"
                      value={activeText}
                      onChange={(e) => applyCustomColors(user.backgroundColor || "#ffffff", e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <span className="text-[10px] font-mono text-slate-300">{activeText.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              {/* Reset Custom Colors */}
              {(user.backgroundColor !== undefined || user.textColor !== undefined) && (
                <button
                  type="button"
                  onClick={() => applyCustomColors(undefined, undefined)}
                  className="w-full mt-2 py-1.5 bg-white/5 hover:bg-white/15 border border-white/10 text-[9px] font-mono uppercase rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar Tema Padrão
                </button>
              )}
            </div>

            {/* Responsive platform details */}
            <div className="p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10 space-y-1 select-none">
              <div className="flex items-center gap-1 text-[9px] font-mono text-indigo-400">
                <Smartphone className="w-3.5 h-3.5" /> COMPATIBILIDADE ADAPTATIVA ATIVA
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                A cor de fundo e o texto serão aplicados de forma instantânea em todo o workspace e painel de controle orbital.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 pt-4 border-t border-white/10 flex justify-between items-center select-none font-sans">
        <span className="text-[10px] text-slate-500 font-mono uppercase">V&H CENTRAL DE PREFERÊNCIAS</span>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs rounded-xl font-medium cursor-pointer border border-red-500/20 transition-all uppercase tracking-wider"
        >
          <LogOut className="w-3.5 h-3.5" /> Terminar Sessão
        </button>
      </div>
    </div>
  );
}
