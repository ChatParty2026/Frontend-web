import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, Users, UserCircle } from "lucide-react";
import { useSocket } from "../context/SocketContext";

// 1. 메시지 인터페이스 정의
interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const JustChatRoom = () => {
  const { roomId } = useParams();
  const { getLatestPlayers, sendMessage, socket, isConnected, user } =
    useSocket();
  const navigate = useNavigate();

  // 상태 관리
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<string[]>(() => {
    return roomId ? getLatestPlayers(roomId) : [];
  });

  // 스크롤 제어를 위한 Ref
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

  // -----------------------------
  // 스크롤 하단 이동 로직
  // -----------------------------
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

  // -----------------------------
  // 소켓 이벤트 수신 (채팅 & 인원 업데이트)
  // -----------------------------
  useEffect(() => {
    if (!socket || !roomId) return;

    const handleSocketMessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data);

      // 현재 방과 관련된 메시지만 처리
      if (data.roomId !== roomId && data.roomld !== roomId) return;

      switch (data.type) {
        case "CHAT":
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              sender: data.sender,
              message: data.message,
              timestamp: new Date(),
              isSystem: data.sender === "SYSTEM",
            },
          ]);
          break;

        case "PLAYER_LIST_UPDATE":
          setParticipants(data.payload.players);
          break;
      }
    };

    socket.addEventListener("message", handleSocketMessage);
    return () => socket.removeEventListener("message", handleSocketMessage);
  }, [socket, roomId]);

  // -----------------------------
  // 메시지 전송 핸들러
  // -----------------------------
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !isConnected || !user || !roomId) return;

    sendMessage({
      type: "CHAT",
      gameType: "JUST_CHAT", // 고정값
      roomId: roomId,
      sender: user.nickname,
      message: message,
    });

    setMessage("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-6">
      {/* 상단 정보 바 (생략 - 기존 코드 유지) */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 bg-[#121212] p-4 rounded-[2rem] border border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="text-lg font-black italic uppercase tracking-tight">
              Just ChatTING
            </h2>
            <p className="text-[10px] text-gray-500 font-mono">{roomId}</p>
          </div>
        </div>
        <button
          onClick={handleExit}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" /> EXIT
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-160px)]">
        {/* 좌측: 참여자 목록 */}
        <div className="lg:col-span-1 bg-[#121212] border border-white/10 rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-6 ml-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-black uppercase tracking-widest text-purple-400">
              Participants
            </span>
            <span className="ml-auto text-xs font-bold text-gray-500">
              {participants.length}
            </span>
          </div>
          <div className="space-y-3 overflow-y-auto custom-scrollbar">
            {participants.map((name, i) => (
              <div
                key={`${name}-${i}`}
                className="flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/5"
              >
                <div className="w-8 h-8 bg-purple-500/20 rounded-xl flex items-center justify-center text-[10px] font-bold text-purple-400">
                  {name[0]}
                </div>
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 메인 채팅 창 */}
        <div className="lg:col-span-3 bg-[#121212] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden">
          {/* 메시지 리스트 */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar"
          >
            <div className="flex justify-center">
              <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Chat session started
              </span>
            </div>

            {messages.map((msg) => {
              const isMe = msg.sender === user?.nickname;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  {!isMe && (
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-2 self-end mb-1">
                      <UserCircle className="w-5 h-5 text-white/20" />
                    </div>
                  )}
                  <div
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    {!isMe && (
                      <span className="text-[10px] font-bold text-gray-500 mb-1 ml-1">
                        {msg.sender}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2 rounded-2xl text-sm max-w-[280px] break-words ${
                        isMe
                          ? "bg-purple-600 text-white rounded-tr-none"
                          : "bg-white/5 text-gray-300 border border-white/5 rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 입력창 */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-black/20 border-t border-white/5 flex gap-3"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="자유롭게 이야기를 나눠보세요..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-white"
            />
            <button
              type="submit"
              disabled={!message.trim()}
              className="px-6 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all font-black flex items-center justify-center disabled:opacity-30 cursor-pointer"
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
