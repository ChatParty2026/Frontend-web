import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, Users, UserCircle, Hash, Crown } from "lucide-react";
import { useSocket } from "../context/SocketContext";
import type { ChatMessage } from "../types/chat";

const JustChatRoom = () => {
  const { roomId } = useParams();
  const { getLatestPlayers, getRoomInfo, sendMessage, isConnected, user } = useSocket();
  const navigate = useNavigate();

  // 1. 상태 관리 (방장 이름 필드 추가)
  const [roomTitle, setRoomTitle] = useState("즐거운 채팅방");
  const [gameType, setGameType] = useState("");
  const [hostName, setHostName] = useState("");
  const [participants, setParticipants] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // 2. 새로고침 및 연결 끊김 감지 -> 즉시 로비로 이동
  useEffect(() => {
    if (!isConnected) {
      // alert 없이 바로 이동하고 싶다면 alert 줄을 지우세요.
      navigate("/rooms", { replace: true });
    }
  }, [isConnected, navigate]);

  // 3. 데이터 초기화 및 캐시 동기화
  useEffect(() => {
    if (!isConnected || !roomId) return;

    const info = getRoomInfo(roomId);
    if (info) {
      setRoomTitle(info.title || "즐거운 채팅방");
      setGameType(info.gameType || "");
      setHostName(info.hostName || "");
    }
    const players = getLatestPlayers(roomId);
    if (players.length > 0) {
      setParticipants(players);
    }
  }, [isConnected, roomId, getRoomInfo, getLatestPlayers]);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // 4. 소켓 이벤트 리스너
  useEffect(() => {
    if (!roomId) return;

    const handleNewChat = (e: any) => {
      const data = e.detail;
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          author: data.sender,
          authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
          message: data.message,
          timestamp: new Date(),
          isSystem: false,
        }]);
      }
    };

    const handleNotice = (e: any) => {
      const data = e.detail;
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, {
          id: crypto.randomUUID(),
          author: "SYSTEM",
          message: data.message,
          timestamp: new Date(),
          isSystem: true,
        }]);
      }
    };

    const handlePlayerUpdate = (e: any) => {
      const data = e.detail;
      if (data.roomId === roomId) {
        if (data.players) setParticipants(data.players);
        if (data.title) setRoomTitle(data.title);
        if (data.hostName) setHostName(data.hostName); // 방장 정보 업데이트
      }
    };

    window.addEventListener("NEW_CHAT", handleNewChat);
    window.addEventListener("SYSTEM_NOTICE", handleNotice);
    window.addEventListener("PLAYER_LIST_UPDATE", handlePlayerUpdate);

    return () => {
      window.removeEventListener("NEW_CHAT", handleNewChat);
      window.removeEventListener("SYSTEM_NOTICE", handleNotice);
      window.removeEventListener("PLAYER_LIST_UPDATE", handlePlayerUpdate);
    };
  }, [roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !user || !roomId) return;
    sendMessage({ type: "CHAT", gameType: "JUST_CHAT", roomId, sender: user.nickname, message });
    setMessage("");
  };

  const handleExit = () => {
    if (isConnected && user && roomId) {
      sendMessage({ type: "LEAVE", roomId, sender: user.nickname, gameType: "JUST_CHAT" });
    }
    navigate("/rooms", { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-6 font-sans">
      {/* 헤더 영역 */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-[#121212] p-5 rounded-[2rem] border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight uppercase">{roomTitle}</h2>
              {gameType && (
                <span className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] font-bold text-purple-400 uppercase">
                  {gameType}
                </span>
              )}
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
        {/* 참여자 목록 사이드바 */}
        <div className="lg:col-span-1 bg-[#121212] border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">Participants</span>
            </div>
            <div className="bg-purple-600 px-3 py-1 rounded-full">
              <span className="text-sm font-black text-white">{participants.length}</span>
            </div>
          </div>
          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {participants.map((name, i) => {
              const isHost = name === hostName; // 수정된 상태값 사용
              const isMe = name === user?.nickname;

              return (
                <div 
                  key={`${name}-${i}`} 
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    isMe ? "bg-purple-500/10 border-purple-500/30" : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black border ${
                      isHost 
                        ? "bg-yellow-500/20 text-yellow-500 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]" 
                        : "bg-purple-500/20 text-purple-400 border-purple-500/20"
                    }`}>
                      {name[0].toUpperCase()}
                    </div>
                    
                    <div className="flex flex-col">
                      <span className={`text-sm font-bold ${isMe ? "text-purple-300" : "text-gray-300"}`}>
                        {name} {isMe && "(Me)"}
                      </span>
                      {isHost && (
                        <span className="text-[9px] text-yellow-500 font-black uppercase tracking-widest leading-none mt-0.5">
                          Host
                        </span>
                      )}
                    </div>
                  </div>

                  {isHost && (
                    <div className="flex items-center gap-1">
                      <Crown className="w-4 h-4 text-yellow-500 fill-yellow-500/20 animate-pulse" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 채팅 영역 */}
        <div className="lg:col-span-3 bg-[#121212] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
          <div ref={scrollRef} className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-purple-500/5 via-transparent to-transparent">
            {messages.map((msg) => {
              const isMe = msg.author === user?.nickname;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-4">
                    <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-gray-500 font-black uppercase tracking-widest border border-white/5 shadow-inner">
                      {msg.message}
                    </span>
                  </div>
                );
              }
              return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-2 self-end mb-1 border border-white/5">
                      <UserCircle className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && <span className="text-[10px] font-black text-gray-500 mb-1 ml-1 uppercase">{msg.author}</span>}
                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[350px] break-words shadow-sm leading-relaxed ${isMe ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-none" : "bg-[#1e1e1e] text-gray-300 border border-white/10 rounded-tl-none"}`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
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