import { Send, Users, MessageCircle } from "lucide-react";
import { useState, useEffect, useRef } from "react";

interface ChatMessage {
  id: string;
  author: string;
  authorAvatar: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}

const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "1",
    author: "시스템",
    authorAvatar: "",
    message: "채팅방에 오신 것을 환영합니다! 🎮",
    timestamp: new Date(),
    isSystem: true,
  },
];

const LiveChat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(1); // 테스트를 위해 1로 시작
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // 임시 유저 데이터 (Home.tsx의 user와 연동 전 fallback)
  const user = {
    name: "나",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=me",
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8081/ws");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ 서버에 연결되었습니다.");
    };

    ws.onmessage = (event) => {
      const incomingMsg: ChatMessage = {
        id: Date.now().toString(),
        author: "서버유저",
        authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=server`,
        message: event.data,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, incomingMsg]);
    };

    return () => ws.close();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.send(newMessage);

    const myMsg: ChatMessage = {
      id: Date.now().toString(),
      author: user.name,
      authorAvatar: user.avatar,
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, myMsg]);
    setNewMessage("");
  };

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* 헤더 섹션 */}
      <div className="p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Live Chat</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-500 tracking-widest">
            {onlineCount} ONLINE
          </span>
        </div>
      </div>

      {/* 채팅 내역 영역 */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.isSystem ? (
              <div className="flex justify-center">
                <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  {msg.message}
                </span>
              </div>
            ) : (
              <div className={`flex gap-3 ${msg.author === user.name ? "flex-row-reverse" : "flex-row"}`}>
                <div className="avatar shrink-0">
                  <div className="w-9 h-9 rounded-xl border border-white/10 ring-1 ring-white/5">
                    <img src={msg.authorAvatar} alt={msg.author} />
                  </div>
                </div>
                <div className={`flex flex-col space-y-1.5 max-w-[75%] ${msg.author === user.name ? "items-end" : "items-start"}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase italic">{msg.author}</span>
                    <span className="text-[8px] font-bold text-gray-600 uppercase">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })}
                    </span>
                  </div>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                      msg.author === user.name
                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none shadow-purple-500/10"
                        : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 섹션 */}
      <div className="p-6 bg-white/5 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium text-white placeholder:text-gray-600 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-30 disabled:grayscale shadow-lg shadow-purple-500/20 group-hover:scale-105 active:scale-95"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;