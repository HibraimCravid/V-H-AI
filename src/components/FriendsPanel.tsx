import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  CheckCircle, 
  Globe, 
  Clock, 
  Smile, 
  AlertCircle,
  HelpCircle
} from "lucide-react";

interface Friend {
  id: string;
  name: string;
  location: string;
  avatarSeed: string;
  status: "pending" | "accepted" | "declined";
  age: number;
  bio: string;
}

export default function FriendsPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newFriendName, setNewFriendName] = useState("");
  const [newFriendRegion, setNewFriendRegion] = useState("Lisboa, Portugal 🇵🇹");
  const [newFriendAge, setNewFriendAge] = useState<number>(20);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize mock friend requests on first loading
  useEffect(() => {
    const stored = localStorage.getItem("vh_friends_list");
    if (stored) {
      setFriends(JSON.parse(stored));
    } else {
      const initialRequests: Friend[] = [
        {
          id: "fr-1",
          name: "Diego Santos",
          location: "Lisboa, Portugal 🇵🇹",
          avatarSeed: "diego",
          status: "pending",
          age: 21,
          bio: "Desenvolvedor júnior entusiasmado com robótica e IA! Quer trocar dicas?"
        },
        {
          id: "fr-2",
          name: "Mariana Costa",
          location: "São Paulo, Brasil 🇧🇷",
          avatarSeed: "mariana",
          status: "pending",
          age: 19,
          bio: "Web designer e apaixonada por esquemas de cores brancas minimalistas."
        },
        {
          id: "fr-3",
          name: "John Miller",
          location: "New York, USA 🇺🇸",
          avatarSeed: "john",
          status: "pending",
          age: 25,
          bio: "Fascinado pela central de inteligência V&H, quero trocar perguntas inteligentes!"
        },
        {
          id: "fr-4",
          name: "Carlos Mendes",
          location: "Luanda, Angola 🇦🇴",
          avatarSeed: "carlos",
          status: "accepted",
          age: 22,
          bio: "Fisicamente longe, mas conectado no V&H Hub!"
        },
        {
          id: "fr-5",
          name: "Marie Dubois",
          location: "Paris, France 🇫🇷",
          avatarSeed: "marie",
          status: "pending",
          age: 18,
          bio: "Estudante e usuária assídua de geradores de imagem da central."
        }
      ];
      localStorage.setItem("vh_friends_list", JSON.stringify(initialRequests));
      setFriends(initialRequests);
    }
  }, []);

  // Update localStorage and trigger change listeners so Chat component learns about state
  const saveFriends = (updated: Friend[]) => {
    setFriends(updated);
    localStorage.setItem("vh_friends_list", JSON.stringify(updated));
    // Dispatch a custom storage event so other components (like App.tsx/Chat) can update dynamically instanstly
    window.dispatchEvent(new Event("storage"));
  };

  const handleAccept = (id: string, name: string) => {
    const updated = friends.map((f) => 
      f.id === id ? { ...f, status: "accepted" as const } : f
    );
    saveFriends(updated);
    setSuccessMessage(`Você aceitou o pedido de amizade de ${name}! 🎉 Canal de modo local ativo com este utilizador.`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleDecline = (id: string, name: string) => {
    const updated = friends.map((f) => 
      f.id === id ? { ...f, status: "declined" as const } : f
    );
    saveFriends(updated);
    setSuccessMessage(`Pedido de amizade de ${name} foi arquivado.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Allow sending custom friend requests ("não importa de onde!")
  const handleSendCustomRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFriendName.trim()) return;

    const newRequest: Friend = {
      id: "fr-custom-" + Date.now(),
      name: newFriendName.trim(),
      location: newFriendRegion,
      avatarSeed: newFriendName.toLowerCase().replace(/[^a-z]/g, "") || "custom",
      status: "pending",
      age: newFriendAge,
      bio: "Nova conexão enviada da Central V&H!"
    };

    const updated = [newRequest, ...friends];
    saveFriends(updated);
    setNewFriendName("");
    setSuccessMessage(`Solicitação enviada por ${newRequest.name} (${newRequest.location}) no painel da central! 🚀`);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  // Remove connections helper
  const handleRemoveFriend = (id: string) => {
    const updated = friends.filter((f) => f.id !== id);
    saveFriends(updated);
    setSuccessMessage(`Conexão de amizade excluída.`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Filter lists
  const pendingRequests = friends.filter((f) => f.status === "pending" && f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const acceptedFriends = friends.filter((f) => f.status === "accepted" && f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-2xl p-5 md:p-6 text-slate-100 font-sans h-full flex flex-col justify-between shadow-[0_15px_50px_rgba(0,0,0,0.5)]">
      <div className="space-y-6">
        {/* Header with connection badges */}
        <div className="flex justify-between items-center pb-4 border-b border-white/10 select-none">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-semibold">Central Global de Pedidos de Amizade</h3>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-mono font-bold text-indigo-300">
            <Globe className="w-3.5 h-3.5 animate-spin text-indigo-400" />
            MODO LOCAL ATIVO: {acceptedFriends.length} CONEXÕES AUTORIZADAS
          </div>
        </div>

        {/* Global info reminder */}
        <div className="p-3.5 bg-indigo-500/5 rounded-xl border border-indigo-500/15 text-xs text-slate-300 flex items-start gap-2 select-none leading-relaxed">
          <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <p>
            <strong>Regra de Restrição Local:</strong> Sempre que a central estiver no <span className="text-amber-400 font-semibold font-mono">Modo Local Seguro</span>, somente utilizadores que adicionaram ou aceitaram amizades podem conversar com o robô V&H AI. Gerencie os pedidos abaixo para habilitar o canal de bate-papo! 🛰️💬
          </p>
        </div>

        {/* Action alert display */}
        {successMessage && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-300 rounded-xl text-xs flex items-center gap-2 shadow-inner">
            <CheckCircle className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Main Interface Layout grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Column A: Received requests & Search (Left side) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Search filter bar */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                placeholder="Filtrar conexões de amizade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-black/45 rounded-xl border border-white/10 text-xs text-slate-100 outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-500 transition-all font-sans"
              />
            </div>

            {/* Substage 1: Pending Connections ("pedidos de amizades") */}
            <div>
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 select-none">
                📥 Pedidos de Amizade Recebidos ({pendingRequests.length})
              </span>

              {pendingRequests.length === 0 ? (
                <div className="text-center p-6 bg-black/20 rounded-xl border border-dashed border-white/5 text-slate-500 text-xs italic select-none">
                  Nenhuma solicitação pendente no momento.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {pendingRequests.map((req) => (
                    <div 
                      key={req.id} 
                      className="p-3.5 bg-black/30 border border-white/10 rounded-xl flex items-start justify-between gap-3 hover:bg-black/40 transition"
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${req.avatarSeed}`}
                          alt={req.name}
                          className="w-10 h-10 rounded-xl bg-indigo-950/40 p-1 border border-indigo-500/20 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-slate-100 text-xs">{req.name}</h4>
                            <span className="bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400">{req.age} anos</span>
                          </div>
                          <span className="text-[10px] text-indigo-400 font-mono block mb-1">{req.location}</span>
                          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{req.bio}</p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-1.5 shrink-0 select-none">
                        <button
                          onClick={() => handleAccept(req.id, req.name)}
                          className="p-1.5 sm:px-3 sm:py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer transition-all border border-indigo-400/20"
                          title="Aceitar Pedido"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Aceitar</span>
                        </button>
                        <button
                          onClick={() => handleDecline(req.id, req.name)}
                          className="p-1.5 sm:px-3 sm:py-1 bg-white/5 hover:bg-white/10 text-slate-400 rounded-lg flex items-center justify-center gap-1 text-[10px] cursor-pointer transition-all border border-white/5"
                          title="Ignorar"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ignorar</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Substage 2: Already Approved Friends */}
            <div className="pt-2">
              <span className="block text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2 select-none">
                🤝 Amizades Conectadas e Ativas ({acceptedFriends.length})
              </span>

              {acceptedFriends.length === 0 ? (
                <div className="text-center p-6 bg-black/20 rounded-xl border border-dashed border-white/5 text-slate-500 text-xs italic select-none">
                  Nenhuma amizade aceita ainda. Aceite pedidos pendentes ou crie um simulado de qualquer lugar!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {acceptedFriends.map((friend) => (
                    <div 
                      key={friend.id} 
                      className="p-3 bg-indigo-500/5 hover:bg-indigo-500/10 border border-indigo-500/15 rounded-xl flex items-center justify-between gap-2 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img 
                          src={`https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${friend.avatarSeed}`}
                          alt={friend.name}
                          className="w-8 h-8 rounded-lg bg-black p-0.5 border border-indigo-500/30 shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-100 text-xs truncate">{friend.name}</h4>
                          <span className="text-[9px] text-emerald-400 font-mono flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            CONECTADO • {friend.location.split(",")[0]}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveFriend(friend.id)}
                        className="p-1.5 bg-black/20 hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 rounded-lg transition-colors cursor-pointer border border-transparent"
                        title="Desfazer Amizade"
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Column B: Request Generator Hub ("n importa de onde") */}
          <div className="lg:col-span-4 bg-black/35 border border-white/10 p-4 rounded-xl flex flex-col justify-between h-max">
            <form onSubmit={handleSendCustomRequest} className="space-y-4">
              <div className="select-none">
                <span className="block text-[10px] font-mono text-indigo-300 uppercase tracking-widest font-bold">
                  ⚡ Simular Pedido de Amizade
                </span>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Crie ou simule um pedido de amizade vindo de qualquer lugar do planeta!
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Nome do Solicitante
                </label>
                <input
                  type="text"
                  placeholder="Ex: Gabriel Coder"
                  value={newFriendName}
                  onChange={(e) => setNewFriendName(e.target.value)}
                  className="w-full bg-black/50 rounded-lg border border-white/10 py-1.5 px-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              {/* Location (não importa de onde!) */}
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Localização / Região
                </label>
                <select
                  value={newFriendRegion}
                  onChange={(e) => setNewFriendRegion(e.target.value)}
                  className="w-full bg-black/50 rounded-lg border border-white/10 py-1.5 px-2 text-xs text-slate-100 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Porto, Portugal 🇵🇹">Porto, Portugal 🇵🇹</option>
                  <option value="Luanda, Angola 🇦🇴">Luanda, Angola 🇦🇴</option>
                  <option value="Maputo, Moçambique 🇲🇿">Maputo, Moçambique 🇲🇿</option>
                  <option value="Praia, Cabo Verde 🇨🇻">Praia, Cabo Verde 🇨🇻</option>
                  <option value="Faro, Portugal 🇵🇹">Faro, Portugal 🇵🇹</option>
                  <option value="Rio de Janeiro, Brasil 🇧🇷">Rio de Janeiro, Brasil 🇧🇷</option>
                  <option value="Macau, China 🇲🇴">Macau, China 🇲🇴</option>
                </select>
              </div>

              {/* Age (Para estatísticas) */}
              <div>
                <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                  Idade do Amigo
                </label>
                <input
                  type="number"
                  min={10}
                  max={99}
                  value={newFriendAge}
                  onChange={(e) => setNewFriendAge(parseInt(e.target.value) || 20)}
                  className="w-full bg-black/50 rounded-lg border border-white/10 py-1.5 px-2.5 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-all border border-indigo-400/20 shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Receber Pedido Simulado
              </button>
            </form>
          </div>
        </div>

      </div>

      <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-500 font-mono select-none">
        <span>SISTEMA AUTOMÁTICO DE AMIZADES V&H v3.8</span>
        <span>MODO ENCRIPTADO DE PAR-A-PAR</span>
      </div>
    </div>
  );
}
