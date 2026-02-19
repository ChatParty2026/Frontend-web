import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, Users, Hash, Crown } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../constants/events";
import type { ChatMessage } from "../types/chat";
import ChatMessageItem from "../components/atoms/ChatMessageItem";

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "welcome-msg",
    author: "SYSTEM",
    authorAvatar: "",
    message: "즐거운 채팅방에 오신 것을 환영합니다! 🎮",
    timestamp: new Date(),
    isSystem: true,
  },
];

const JustChatRoom = () => {
  const { roomId } = useParams();
  const { getLatestPlayers, getRoomInfo, sendMessage, isConnected, user } = useSocket();
  const navigate = useNavigate();

  const [roomTitle, setRoomTitle] = useState("즐거운 채팅방");
  const [gameType, setGameType] = useState("");
  const [hostName, setHostName] = useState("");
  // ✅ string[]에서 any[]로 변경 (서버에서 {nickname, avatar} 객체로 오기 때문)
  const [participants, setParticipants] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isMyMessageRef = useRef(false);

  // 1. 연결 체크
  useEffect(() => {
    if (!isConnected) navigate("/rooms", { replace: true });
  }, [isConnected, navigate]);

  // 2. 초기 데이터 로드
  const loadRoomData = useCallback(() => {
    if (!roomId) return;
    const info = getRoomInfo(roomId);
    if (info) {
      setRoomTitle(info.title);
      setGameType(info.gameType);
      setHostName(info.hostName || "");
    }
    const players = getLatestPlayers(roomId);
    if (players && players.length > 0) setParticipants(players);
  }, [roomId, getRoomInfo, getLatestPlayers]);

  useEffect(() => {
    if (isConnected) loadRoomData();
  }, [isConnected, loadRoomData]);

  // 3. 스크롤 제어
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const bottom = scrollHeight - scrollTop <= clientHeight + 100;
      setIsAtBottom(bottom);
    }
  };

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  useEffect(() => {
    if (isMyMessageRef.current || isAtBottom) {
      const timer = setTimeout(() => {
        scrollToBottom(isMyMessageRef.current ? "smooth" : "auto");
        isMyMessageRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // 4. 소켓 이벤트 리스너
  useEffect(() => {
    if (!roomId) return;

    const handleNewChat = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.timestamp}-${Math.random().toString(36).substring(2, 7)}`,
          author: data.sender,
          authorAvatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
          message: data.message,
          timestamp: new Date(),
          isSystem: false,
        },
      ].slice(-100));
    };

    const handleNotice = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        author: "SYSTEM",
        authorAvatar: "",
        message: data.message,
        timestamp: new Date(),
        isSystem: true,
      }].slice(-100));
    };

    const handlePlayerUpdate = (e: any) => {
      const data = e.detail;
      if (data.roomId !== roomId) return;
      
      // ✅ 서버 데이터 구조에 맞게 상태 업데이트
      if (data.players) setParticipants(data.players);
      if (data.title) setRoomTitle(data.title);
      // 서버에서 hostName 혹은 hostNickname으로 올 수 있음
      const hName = data.hostName || data.hostNickname || data.payload?.hostNickname;
      if (hName) setHostName(hName);
    };

    window.addEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
    window.addEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNotice);
    window.addEventListener("PLAYER_LIST_UPDATE", handlePlayerUpdate);
    // GAME_INFO 이벤트도 여기서 처리하거나 SocketContext에서 처리 확인 필요
    window.addEventListener("GAME_INFO", handlePlayerUpdate);

    return () => {
      window.removeEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
      window.removeEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNotice);
      window.removeEventListener("PLAYER_LIST_UPDATE", handlePlayerUpdate);
      window.removeEventListener("GAME_INFO", handlePlayerUpdate);
    };
  }, [roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !user || !roomId) return;
    isMyMessageRef.current = true;
    sendMessage({ type: "CHAT", gameType: "JUST_CHAT", roomId, message });
    setMessage("");
  };

  const handleExit = () => {
    if (isConnected && user && roomId) sendMessage({ type: "LEAVE", roomId, gameType: "JUST_CHAT" });
    navigate("/rooms", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-6 font-sans">
      {/* 헤더 영역 */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-[#121212] p-5 rounded-[2rem] border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl"><MessageSquare className="w-6 h-6 text-purple-400" /></div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">{roomTitle}</h2>
              {gameType && <span className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] font-bold text-purple-400 uppercase">{gameType}</span>}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Hash className="w-3 h-3" />
              <span className="text-xs font-mono tracking-widest uppercase opacity-50">{roomId?.split("-")[0]} SESSION</span>
            </div>
          </div>
        </div>
        <button onClick={handleExit} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-black text-sm border border-red-500/20 active:scale-95 cursor-pointer">
          <LogOut className="w-4 h-4" /> EXIT
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-180px)]">
        {/* 참여자 목록 영역 */}
        <div className="lg:col-span-1 bg-[#121212] border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Participants</span>
            </div>
            <div className="bg-purple-600 px-3 py-1 rounded-full"><span className="text-sm font-black text-white">{participants.length}</span></div>
          </div>
          
          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {participants.map((p, i) => {
              // ✅ 데이터가 객체인지 문자열인지 판별 (방어 코드)
              const nick = typeof p === 'string' ? p : p.nickname;
              const avatar = typeof p === 'string' ? "" : p.avatar;
              
              if (!nick) return null;

              const isHost = nick === hostName;
              const isMe = nick === user?.nickname;

              return (
                <div key={`${nick}-${i}`} className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isMe ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"}`}>
                  <div className="flex items-center gap-3">
                    {/* ✅ 아바타(프사) 렌더링 */}
                    <div className={`relative w-9 h-9 rounded-xl overflow-hidden border ${isHost ? "border-yellow-500/40" : "border-white/10"}`}>
                      {avatar ? (
                        <img src={avatar} alt={nick} className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center text-xs font-black ${isHost ? "bg-yellow-500/20 text-yellow-500" : "bg-purple-500/20 text-purple-400"}`}>
                          {nick[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isMe ? "text-purple-300" : "text-gray-300"}`}>
                        {nick} {isMe && <span className="text-[10px] opacity-50 ml-0.5">(Me)</span>}
                      </span>
                      {isHost && <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest leading-none mt-0.5">Leader</span>}
                    </div>
                  </div>
                  {isHost && <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20 animate-pulse" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="lg:col-span-3 bg-[#121212] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
          <div 
            ref={scrollRef} 
            onScroll={handleScroll}
            className="flex-1 p-6 overflow-y-auto space-y-6 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent pb-0"
          >
            {messages.map((msg) => (
              <ChatMessageItem 
                key={msg.id} 
                msg={msg} 
                isMe={msg.author === user?.nickname} 
              />
            ))}
            <div ref={messagesEndRef} className="h-px w-full" />
          </div>

          <form onSubmit={handleSendMessage} className="p-5 bg-black/20 border-t border-white/5 flex gap-3">
            <input 
              type="text" 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="메시지를 입력하세요..." 
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-600 outline-none" 
            />
            <button 
              type="submit" 
              disabled={!message.trim()} 
              className="px-6 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all font-black flex items-center justify-center disabled:opacity-20 cursor-pointer active:scale-95 shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JustChatRoom;