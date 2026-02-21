import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Crown, Send, LogOut, Settings, Play, CheckCircle2, MessageSquare, Users } from "lucide-react";
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
  
  // ✅ 설정 모달 상태
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMyMessageRef = useRef(false);

  const isMeHost = hostName === user?.nickname;
  const myStatus = players.find(p => (typeof p === 'string' ? p : p.nickname) === user?.nickname);
  const isMeReady = typeof myStatus === 'object' ? myStatus.isReady : false;

  const loadRoomData = useCallback(() => {
    if (!roomId || !isConnected) return;
    const info = getRoomInfo(roomId);
    if (info) {
      setRoomTitle(info.title);
      setGameType(info.gameType);
      setHostName(info.hostName || "");
      if (info.maxPlayers) setMaxPlayers(info.maxPlayers);
    }
    const latestPlayers = getLatestPlayers(roomId);
    if (latestPlayers && latestPlayers.length > 0) setPlayers(latestPlayers);
  }, [roomId, isConnected, getRoomInfo, getLatestPlayers]);

  useEffect(() => {
    loadRoomData();
  }, [loadRoomData]);

  useEffect(() => {
    if (!roomId) return;
    const handleUpdate = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      const playersList = data.payload?.players || data.players;
      if (playersList) setPlayers(playersList);
      const hName = data.payload?.hostNickname || data.hostNickname || data.hostName;
      if (hName) setHostName(hName);
      const title = data.payload?.title || data.title;
      if (title) setRoomTitle(title);
      const maxP = data.payload?.maxPlayers || data.maxPlayers;
      if (maxP) setMaxPlayers(maxP);
    };

    const handleNewChat = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        author: data.sender,
        authorAvatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
        message: data.message,
        timestamp: new Date(),
        isSystem: data.sender === "SYSTEM"
      }].slice(-100));
    };

    window.addEventListener("PLAYER_LIST_UPDATE", handleUpdate);
    window.addEventListener("GAME_INFO", handleUpdate);
    window.addEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
    window.addEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNewChat);
    return () => {
      window.removeEventListener("PLAYER_LIST_UPDATE", handleUpdate);
      window.removeEventListener("GAME_INFO", handleUpdate);
      window.removeEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
      window.removeEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNewChat);
    };
  }, [roomId]);

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
    sendMessage({ type: "ACTION", actionType: "START", roomId, gameType });
  };

  // ✅ 설정 저장 핸들러
  const handleSaveSettings = (newSettings: any) => {
    if (!isMeHost) return;
    sendMessage({
      type: "ACTION",
      actionType: "UPDATE_SETTINGS",
      roomId,
      gameType,
      payload: newSettings
    });
    setIsSettingsOpen(false);
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
        
        {/* 헤더 */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-2xl hidden sm:block">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter">{roomTitle}</h1>
                <span className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] font-bold text-purple-400 uppercase">{gameType}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-500">
                <Users className="w-3 h-3" />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {players.length} / {maxPlayers} PLAYERS
                </span>
              </div>
            </div>
          </div>
          <button onClick={handleExit} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-black text-sm hover:bg-red-500 hover:text-white transition-all active:scale-95">
            <LogOut className="w-4 h-4" /> EXIT
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 참여자 목록 */}
          <div className="w-full md:w-[320px] border-r border-white/5 p-6 overflow-y-auto bg-black/20 custom-scrollbar">
            <div className="space-y-3">
              {players.map((p, i) => {
                const nick = typeof p === 'string' ? p : (p.nickname || p.sender);
                const avatar = typeof p === 'object' ? p.avatar : "";
                const isReady = typeof p === 'object' ? p.isReady : false;
                const isHost = nick === hostName;
                const isMe = nick === user?.nickname;
                if (!nick) return null;
                return (
                  <div key={`${nick}-${i}`} className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${isMe ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`relative w-10 h-10 rounded-xl overflow-hidden border ${isHost ? "border-yellow-500/50" : "border-white/10"}`}>
                        {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : (
                          <div className={`w-full h-full flex items-center justify-center text-xs font-black ${isHost ? "bg-yellow-500/20 text-yellow-500" : "bg-purple-500/20 text-purple-400"}`}>
                            {nick[0]?.toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-sm font-bold ${isMe ? "text-purple-300" : "text-gray-300"}`}>{nick}</span>
                          {isMe && <span className="text-[9px] bg-purple-500/20 text-purple-400 px-1 rounded font-black">ME</span>}
                        </div>
                        <span className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${isHost ? "text-yellow-500" : isReady ? "text-emerald-500" : "text-gray-600"}`}>
                          {isHost ? "Leader" : isReady ? "READY" : "WAITING"}
                        </span>
                      </div>
                    </div>
                    {isHost && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />}
                    {!isHost && isReady && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우측: 채팅창 */}
          <div className="hidden md:flex flex-1 flex-col bg-[#121212]">
            <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar text-left">
              {messages.map((msg) => (
                <ChatMessageItem key={msg.id} msg={msg} isMe={msg.author === user?.nickname} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-6 bg-black/40 border-t border-white/5 space-y-4">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white outline-none"
                />
                <button type="submit" disabled={!message.trim()} className="px-5 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all active:scale-95 shadow-lg">
                  <Send className="w-5 h-5" />
                </button>
              </form>

              <div className="flex gap-3">
                {/* ✅ 방장 전용 세팅 버튼 */}
                {isMeHost && (
                  <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center hover:bg-white/10 transition-all active:scale-95 group shadow-xl"
                  >
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

      {/* ✅ 게임 설정 모달 */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        gameType={gameType}
        onSave={handleSaveSettings}
        initialMaxPlayers={maxPlayers}
      />
    </div>
  );
};

export default GameWaitingRoom;