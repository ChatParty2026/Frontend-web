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

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // WebSocket 객체를 유지하기 위한 ref
  const socketRef = useRef<WebSocket | null>(null);

  // 임시 유저 데이터 (나중에 AuthContext 연동)
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

  // WebSocket 연결 설정
  useEffect(() => {
    // 네티 서버 주소로 연결
    const ws = new WebSocket("ws://localhost:8081/ws");
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ 서버에 연결되었습니다.");
      setOnlineCount((prev) => prev + 1);
    };

    ws.onmessage = (event) => {
      const serverData = event.data;

      // 서버에서 온 메시지를 ChatMessage 형식으로 변환
      const incomingMsg: ChatMessage = {
        id: Date.now().toString(),
        author: "서버유저", // 실제로는 서버에서 보낸 JSON 데이터를 파싱해서 사용하세요
        authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=server`,
        message: serverData,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, incomingMsg]);
    };

    ws.onclose = () => {
      console.log("❌ 서버와 연결이 끊겼습니다.");
      setOnlineCount((prev) => Math.max(0, prev - 1));
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socketRef.current) return;

    // 1. 서버로 메시지 전송
    socketRef.current.send(newMessage);

    // 2. 내 화면에 메시지 즉시 표시
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
    <div className="card bg-base-100 shadow-sm border border-base-200 h-[600px] flex flex-col">
      <div className="card-body p-6 flex flex-col h-full">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4 border-b border-base-200 pb-4">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-6 h-6 text-secondary" />
            <h2 className="card-title font-bold text-xl">실시간 채팅</h2>
          </div>
          <div className="badge badge-success badge-outline gap-1 px-3 py-3 font-semibold">
            <Users className="w-4 h-4" />
            {onlineCount}명 접속 중
          </div>
        </div>

        {/* 메시지 리스트 */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {messages.map((msg) => (
            <div key={msg.id}>
              {msg.isSystem ? (
                <div className="flex justify-center my-4">
                  <span className="badge badge-ghost text-xs py-3">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div
                  className={`chat ${msg.author === user.name ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full border border-base-200 shadow-sm">
                      <img src={msg.authorAvatar} alt={msg.author} />
                    </div>
                  </div>
                  <div className="chat-header mb-1 opacity-60 text-xs">
                    {msg.author}
                    <time className="ml-1 uppercase">
                      {msg.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                  </div>
                  <div
                    className={`chat-bubble min-h-0 ${
                      msg.author === user.name
                        ? "chat-bubble-primary shadow-md"
                        : "bg-base-200 text-base-content border-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력창 */}
        <form
          onSubmit={handleSubmit}
          className="mt-4 flex gap-2 pt-4 border-t border-base-200"
        >
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="메시지를 입력하세요..."
            className="input input-bordered flex-1 focus:input-primary rounded-xl"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="btn btn-primary rounded-xl px-4 shadow-md"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
