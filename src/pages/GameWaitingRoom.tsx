import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Crown, Send, LogOut, Settings, Play, CheckCircle2, MessageSquare, Users, Info, Ban } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../constants/events";
import ChatMessageItem from "../components/atoms/ChatMessageItem";
import type { ChatMessage } from "../types/chat";
import GameSettingsModal from "../modal/GameSettingsModal";

const GameWaitingRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { sendMessage, isConnected, user, getRoomInfo, getLatestPlayers } = useSocket();

  const [roomTitle, setRoomTitle] = useState("대기실 불러오는 중...");
  const [gameType, setGameType] = useState<string>("");
  const [hostName, setHostName] = useState("");
  const [players, setPlayers] = useState<any[]>([]);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [roomSettings, setRoomSettings] = useState({ theme: "fruit", discussionTime: 40, totalRounds: 2, maxPlayers: 8 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMyMessageRef = useRef(false);

  const safePlayers = Array.isArray(players) ? players : [];
  
  const isMeHost = hostName === user?.nickname;
  const myStatus = safePlayers.find(p => (typeof p === 'string' ? p : p?.nickname) === user?.nickname);
  const isMeReady = typeof myStatus === 'object' ? myStatus?.isReady : false;

  useEffect(() => {
    if (!roomId || !isConnected) return;

    const info = getRoomInfo(roomId) as any;
    console.log(info)
    if (info) {
      // 기존 필드 세팅
      setRoomTitle(prev => info.title || prev);
      setGameType(prev => info.gameType || prev);
      setHostName(prev => info.hostName || prev);
      
      const mP = info.maxPlayers || info.maxCount;
      if (mP) setMaxPlayers(mP);

      // 🎯 [핵심 추가] 캐시에 저장된 settings를 상태로 복사!
      if (info.settings && JSON.stringify(info.settings) !== JSON.stringify(roomSettings)) {
        console.log("🎯 서버 초기 설정값 로드:", info.settings);
        setRoomSettings(info.settings);
      }
    }

    const latestPlayers = getLatestPlayers(roomId);
    if (Array.isArray(latestPlayers) && latestPlayers.length > 0) {
      setPlayers(latestPlayers);
    }
  }, [roomId, isConnected]); // roomSettings를 의존성에 넣지 않도록 주의 (cascading 방지)

  useEffect(() => {
    if (!roomId) return;

    const handleUpdate = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      
      const playersList = data.payload?.players || data.players;
      if (Array.isArray(playersList)) setPlayers(playersList);
      
      const hName = data.payload?.hostNickname || data.hostNickname || data.hostName;
      if (hName) setHostName(hName);
      
      const title = data.payload?.title || data.title;
      if (title) setRoomTitle(title);
      
      const maxP = data.payload?.maxPlayers || data.payload?.maxCount || data.maxPlayers || data.maxCount;
      if (maxP) setMaxPlayers(maxP);

      const settings = data.payload?.settings || data.settings;
      if (settings) {
        setRoomSettings(settings);
        if (settings.maxPlayers) setMaxPlayers(settings.maxPlayers);
      }
    };

    const handleNewChat = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        author: data.sender || "SYSTEM",
        authorAvatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
        message: data.message || "",
        timestamp: new Date(),
        isSystem: data.sender === "SYSTEM"
      }].slice(-100));
    };

    const handleAction = (e: any) => {
      const { actionType, payload, roomId: targetId } = e.detail;
      if (String(targetId) !== String(roomId)) return;

      if (actionType === "PHASE_CHANGE") {
        const gameTypeToUse = payload?.gameType || gameType;
        let gamePath = `/game/liar/${roomId}`;
        if (gameTypeToUse?.toUpperCase() === "MAFIA") gamePath = `/game/mafia/${roomId}`;

        navigate(gamePath, { 
          state: { 
            gameData: payload,
            timestamp: Date.now() 
          } 
        });
      }

      // 🎯 강퇴당했을 때 로비로 튕겨내는 로직
      if (actionType === "KICKED" || actionType === "KICK") {
        if (payload?.targetNick === user?.nickname) {
          alert("방장에 의해 강퇴되었습니다.");
          navigate("/rooms"); // 로비(방 목록)로 이동
        }
      }
    };

    window.addEventListener("ACTION", handleAction);
    window.addEventListener("PLAYER_LIST_UPDATE", handleUpdate);
    window.addEventListener("GAME_INFO", handleUpdate);
    window.addEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
    window.addEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNewChat);

    return () => {
      window.removeEventListener("ACTION", handleAction);
      window.removeEventListener("PLAYER_LIST_UPDATE", handleUpdate);
      window.removeEventListener("GAME_INFO", handleUpdate);
      window.removeEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
      window.removeEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNewChat);
    };
  }, [roomId, navigate, gameType, user]);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (isMyMessageRef.current || isAtBottom) {
      setTimeout(() => scrollToBottom(isMyMessageRef.current ? "smooth" : "auto"), 50);
      isMyMessageRef.current = false;
    }
  }, [messages, isAtBottom, scrollToBottom]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !roomId) return;
    isMyMessageRef.current = true;
    sendMessage({ type: "CHAT", roomId, message, gameType });
    setMessage("");
  };

  const handleToggleReady = () => {
    sendMessage({ type: "ACTION", actionType: "READY", roomId, gameType });
  };

  const handleStartGame = () => {
    if (!isMeHost) return;
    sendMessage({ type: "ACTION", actionType: "START", roomId, gameType: gameType });
  };

  const handleSaveSettings = (newSettings: any) => {
    if (!isMeHost) return;
    sendMessage({ type: "ACTION", actionType: "UPDATE_SETTINGS", roomId, gameType, payload: newSettings });
    setIsSettingsOpen(false);
  };

  // 🎯 강퇴 처리 함수
  const handleKickPlayer = (targetNick: string) => {
    if (!isMeHost) return;
    if (window.confirm(`${targetNick}님을 방에서 강퇴하시겠습니까?`)) {
      sendMessage({
        type: "ACTION",
        actionType: "KICK",
        roomId,
        gameType,
        payload: { targetNick }
      });
    }
  };

  const handleExit = () => {
    if (window.confirm("정말 방에서 나가시겠습니까?")) {
      if (isConnected && roomId) sendMessage({ type: "LEAVE", roomId, gameType });
      navigate("/rooms");
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white p-4 md:p-6 flex items-center justify-center font-sans">
      <div className="container max-w-6xl w-full h-[85vh] bg-[#121212] rounded-[2.5rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* 헤더 부분 */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl hidden sm:block"><MessageSquare className="w-6 h-6 text-purple-400" /></div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">{roomTitle}</h1>
                <span className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] font-bold text-purple-400 uppercase">{gameType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-3 h-3" />
                <span className="text-[11px] font-bold uppercase tracking-widest">{safePlayers.length} / {maxPlayers} PLAYERS</span>
              </div>
            </div>
          </div>
          <button onClick={handleExit} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95">
            <LogOut className="w-4 h-4" /> EXIT
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 유저 리스트 영역 */}
          <div className="w-full md:w-[320px] border-r border-white/5 p-6 overflow-y-auto bg-black/20 custom-scrollbar">
            <div className="space-y-3 relative">
              {safePlayers.map((p, i) => {
                if (!p) return null;
                
                const nick = typeof p === 'string' ? p : (p?.nickname || p?.sender);
                if (!nick) return null;
                
                const avatar = typeof p === 'object' ? p?.avatar : "";
                const isReady = typeof p === 'object' ? p?.isReady : false;
                const isHost = nick === hostName;
                const isMe = nick === user?.nickname;
                
                const isSelected = selectedPlayer === nick;

                return (
                  <div key={`${nick}-${i}`} className={`relative ${isSelected ? 'z-50' : 'z-10'}`}>
                    
                    {isSelected && (
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={(e) => { e.stopPropagation(); setSelectedPlayer(null); }} 
                      />
                    )}

                    {/* 유저 카드 본체 */}
                    <div 
                      onClick={() => setSelectedPlayer(isSelected ? null : nick)}
                      className={`relative z-50 flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                        isMe ? "bg-purple-500/10 border-purple-500/30 hover:bg-purple-500/20" 
                        : isSelected ? "bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]" 
                        : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`relative w-10 h-10 rounded-xl overflow-hidden border ${isHost ? "border-yellow-500/50" : "border-white/10"}`}>
                          {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : (
                            <div className={`w-full h-full flex items-center justify-center text-xs font-black ${isHost ? "bg-yellow-500/20 text-yellow-500" : "bg-purple-500/20 text-purple-400"}`}>
                              {nick[0]?.toUpperCase() || "?"}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 text-left">
                            <span className={`text-sm font-bold ${isMe ? "text-purple-300" : "text-gray-300"}`}>{nick}</span>
                            {isMe && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1 rounded font-black">ME</span>}
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 text-left ${isHost ? "text-yellow-500" : isReady ? "text-emerald-500" : "text-gray-600"}`}>
                            {isHost ? "Leader" : isReady ? "READY" : "WAITING"}
                          </span>
                        </div>
                      </div>
                      {isHost && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />}
                      {!isHost && isReady && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    </div>

                    {/* 말풍선 디자인 */}
                    {isSelected && (
                      <div className="absolute top-[105%] right-0 z-50 mt-1 w-36 bg-[#2a2a2a] border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] p-1.5 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                        
                        {/* 꼬리 */}
                        <div className="absolute -top-1.5 right-6 w-3 h-3 bg-[#2a2a2a] border-t border-l border-white/10 rotate-45 rounded-tl-[2px]"></div>

                        <div className="relative z-10 flex flex-col gap-0.5">
                          <button 
                            onClick={(e) => { e.stopPropagation(); console.log('정보보기 로직 호출:', nick); setSelectedPlayer(null); }}
                            className="flex items-center gap-2.5 w-full p-2.5 hover:bg-white/5 rounded-xl text-xs font-bold text-gray-200 transition-colors"
                          >
                            <Info className="w-4 h-4 text-blue-400" /> 정보보기
                          </button>
                          
                          {/* 🎯 강퇴 버튼 클릭 시 handleKickPlayer 호출 */}
                          {isMeHost && !isMe && (
                            <button 
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                handleKickPlayer(nick); 
                                setSelectedPlayer(null); 
                              }}
                              className="flex items-center gap-2.5 w-full p-2.5 hover:bg-red-500/10 rounded-xl text-xs font-bold text-red-400 transition-colors group"
                            >
                              <Ban className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" /> 강퇴하기
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex flex-1 flex-col bg-[#121212]">
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-left text-sm">
              {Array.isArray(messages) && messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} isMe={msg.author === user?.nickname} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text" value={message} onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white outline-none"
                />
                <button type="submit" disabled={!message.trim()} className="px-5 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all active:scale-95 shadow-lg">
                  <Send className="w-5 h-5" />
                </button>
              </form>

              <div className="flex gap-3">
                {isMeHost && (
                  <button onClick={() => setIsSettingsOpen(true)} className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group shadow-xl">
                    <Settings className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
                  </button>
                )}
                <button
                  onClick={isMeHost ? handleStartGame : handleToggleReady}
                  className={`flex-1 h-14 rounded-2xl flex items-center justify-center gap-3 font-black italic transition-all shadow-xl uppercase tracking-widest active:scale-[0.98] ${
                    isMeHost ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white" : isMeReady ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-purple-500 hover:text-white"
                  }`}
                >
                  {isMeHost ? <><Play className="w-5 h-5 fill-current" /> Start Game</> : <><CheckCircle2 className="w-5 h-5" /> {isMeReady ? "Ready Complete" : "Ready"}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <GameSettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        gameType={gameType} 
        onSave={handleSaveSettings} 
        initialMaxPlayers={maxPlayers} 
        initialSettings={roomSettings} 
      />
    </div>
  );
};

export default GameWaitingRoom;