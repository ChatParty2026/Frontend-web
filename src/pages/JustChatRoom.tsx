import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, Users, UserCircle, Hash } from "lucide-react";
import { useSocket } from "../context/SocketContext";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const JustChatRoom = () => {
  const { roomId } = useParams();
  const { getLatestPlayers, sendMessage, socket, isConnected, user } = useSocket();
  const navigate = useNavigate();

  // 상태 관리
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roomTitle, setRoomTitle] = useState("로딩 중..."); // 방 제목 상태
  const [gameType, setGameType] = useState(""); // 게임 타입 상태
  const [participants, setParticipants] = useState<string[]>(() => {
    return roomId ? getLatestPlayers(roomId) : [];
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  const handleExit = () => {
    if (isConnected && user && roomId) {
      sendMessage({
        type: "LEAVE",
        roomId: roomId,
        sender: user.nickname,
        gameType: "JUST_CHAT",
      });
    }
    navigate("/rooms");
  };

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleSocketMessage = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (data.roomId !== roomId) return;

        switch (data.type) {
          case "CHAT":
            setMessages((prev) => [
              ...prev,
              {
                id: crypto.randomUUID(), // 더 안전한 ID 생성
                sender: data.sender,
                message: data.message,
                timestamp: new Date(),
                isSystem: data.sender === "SYSTEM",
              },
            ]);
            break;

          case "GAME_INFO":
            // 서버에서 내려주는 방 제목과 게임 타입 저장
            if (data.title) setRoomTitle(data.title);
            if (data.gameType) setGameType(data.gameType);
            if (data.payload?.players) {
              setParticipants(data.payload.players);
            }
            break;

          case "PLAYER_LIST_UPDATE":
            if (data.payload?.players) {
              setParticipants(data.payload.players);
            }
            break;
        }
      } catch (e) {
        console.error("Parsing error", e);
      }
    };

    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket, roomId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !isConnected || !user || !roomId) return;

    sendMessage({
      type: "CHAT",
      gameType: "JUST_CHAT",
      roomId: roomId,
      sender: user.nickname,
      message: message,
    });
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-6">
      {/* 상단 정보 바 */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-[#121212] p-5 rounded-[2rem] border border-white/10 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-tight uppercase tracking-tighter">
                {roomTitle}
              </h2>
              {gameType && (
                <span className="px-2 py-0.5 bg-white/10 border border-white/10 rounded text-[10px] font-bold text-purple-400 uppercase">
                  {gameType}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Hash className="w-3 h-3" />
              <span className="text-xs font-mono tracking-widest uppercase opacity-50">Room Session</span>
            </div>
          </div>
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-black text-sm border border-red-500/20 active:scale-95"
        >
          <LogOut className="w-4 h-4" /> EXIT
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-180px)]">
        {/* 좌측: 참여자 목록 */}
        <div className="lg:col-span-1 bg-[#121212] border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden shadow-2xl">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Participants
              </span>
            </div>
            {/* 참여자 수 강조 디자인 */}
            <div className="bg-purple-600 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(147,51,234,0.3)]">
              <span className="text-sm font-black text-white leading-none">
                {participants.length}
              </span>
            </div>
          </div>
          
          <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1">
            {participants.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                  name === user?.nickname 
                  ? "bg-purple-500/10 border-purple-500/30" 
                  : "bg-white/5 border-white/5"
                }`}
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center text-[11px] font-black text-purple-400 border border-purple-500/20">
                  {name[0].toUpperCase()}
                </div>
                <span className={`text-sm font-bold ${name === user?.nickname ? "text-purple-300" : "text-gray-300"}`}>
                  {name} {name === user?.nickname && "(Me)"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 메인 채팅 창 */}
        <div className="lg:col-span-3 bg-[#121212] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl">
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar"
          >
            <div className="flex justify-center pb-4">
              <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] border border-white/5">
                Chat session started
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender === user?.nickname;
              const isSystem = msg.isSystem;

              if (isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="text-[11px] font-bold text-purple-400/80 bg-purple-400/5 px-3 py-1 rounded-lg border border-purple-400/10">
                      {msg.message}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-2 self-end mb-1 border border-white/5">
                      <UserCircle className="w-5 h-5 text-gray-600" />
                    </div>
                  )}
                  <div className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-[10px] font-black text-gray-500 mb-1 ml-1 uppercase tracking-tighter">
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm max-w-[320px] break-words shadow-sm ${
                        isMe
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form
            onSubmit={handleSendMessage}
            className="p-5 bg-black/20 border-t border-white/5 flex gap-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="자유롭게 이야기를 나눠보세요..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white placeholder:text-gray-600"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-6 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all font-black flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-lg"
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