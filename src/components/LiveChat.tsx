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
    timestamp: new Date(Date.now() - 300000),
    isSystem: true,
  },
  {
    id: "2",
    author: "게임러버",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gamer",
    message: "안녕하세요! 같이 게임하실 분~",
    timestamp: new Date(Date.now() - 180000),
  },
];

export function LiveChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(42);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 임시 유저 데이터
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

  // 랜덤 메시지 시뮬레이션
  useEffect(() => {
    const interval = setInterval(() => {
      const randomMsgs = [
        "누구 같이 게임할 사람?",
        "초성 퀴즈 고고!",
        "방금 판 대박 ㅋㅋ",
      ];
      const names = ["플레이어A", "게이머B", "퀴즈왕"];
      const name = names[Math.floor(Math.random() * names.length)];

      const newMsg: ChatMessage = {
        id: Date.now().toString(),
        author: name,
        authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        message: randomMsgs[Math.floor(Math.random() * randomMsgs.length)],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, newMsg]);
      setOnlineCount((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      author: user.name,
      authorAvatar: user.avatar,
      message: newMessage,
      timestamp: new Date(),
    };

    setMessages([...messages, message]);
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
