import { Send, MessageCircle, UserCircle } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AuthUser } from "../types/auth";
import axios from "axios";

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
    id: "welcome-msg",
    author: "시스템",
    authorAvatar: "",
    message: "채팅방에 오신 것을 환영합니다! 🎮",
    timestamp: new Date(),
    isSystem: true,
  },
];

interface LiveChatProps {
  user: AuthUser | null;
}

const LiveChat = ({ user }: LiveChatProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const currentNickname = user?.nickname;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // -----------------------------
  // WebSocket 연결 함수
  // -----------------------------
  const connect = (token: string, nickname: string) => {
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          type: "JOIN",
          gameType: "MAIN",
          roomId: "main",
          sender: nickname,
        }),
      );
      console.log("✅ WebSocket connected:", nickname);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case "CHAT":
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(2, 9),
              author: data.sender,
              authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
              message: data.message,
              timestamp: new Date(),
              isSystem: data.sender === "SYSTEM" || data.sender === "시스템",
            },
          ]);
          break;
        case "ROOM_LIST_UPDATE":
          if (data.payload?.lobbyCount !== undefined) {
            setOnlineCount(data.payload.lobbyCount);
          }
          break;
      }
    };

    ws.onclose = async (event) => {
      console.log("🔌 WebSocket closed:", event.code);

      // 토큰 만료 시 (서버에서 4001 코드 보낸다고 가정)
      if (event.code === 4001) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return;

        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );

          localStorage.setItem("accessToken", data.accessToken);
          localStorage.setItem("refreshToken", data.refreshToken);

          // 재귀 호출로 재연결
          connect(data.accessToken, nickname);
        } catch {
          localStorage.clear();
          window.location.href = "/";
        }
      }
    };

    ws.onerror = (err) => console.log("⚠️ WebSocket error:", err);
  };

  // -----------------------------
  // useEffect: 닉네임 확인 + connect 호출
  // -----------------------------
  useEffect(() => {
    if (!currentNickname) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return;

    connect(token, currentNickname);

    return () => {
      console.log("🧹 Cleaning up WebSocket");
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [currentNickname]);

  // -----------------------------
  // 메시지 전송
  // -----------------------------

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // socketRef.current.readyState === WebSocket.OPEN 조건을 추가하여
    // 연결 중(CONNECTING)일 때 send가 호출되는 것을 방지합니다.
    if (
      !newMessage.trim() ||
      !socketRef.current ||
      socketRef.current.readyState !== WebSocket.OPEN ||
      !currentNickname
    )
      return;

    socketRef.current.send(
      JSON.stringify({
        type: "CHAT",
        gameType: "MAIN",
        roomId: "main",
        sender: currentNickname,
        message: newMessage,
      }),
    );

    setNewMessage("");
  };

  if (!user)
    return <div className="p-10 text-center text-gray-500">Connecting...</div>;

  // -----------------------------
  // JSX 렌더링
  // -----------------------------
  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* 헤더 섹션 */}
      <div className="shrink-0 p-6 flex items-center justify-between border-b border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg">
            <MessageCircle className="w-5 h-5 text-pink-500" />
          </div>
          <h2 className="text-xl font-black italic tracking-tight text-white uppercase">
            Live Chat
          </h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
            {onlineCount} ONLINE
          </span>
        </div>
      </div>

      {/* 채팅 메시지 영역 */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
      >
        {messages.map((msg) => {
          const isMe = msg.author === currentNickname;
          const isGuestAuthor = isMe
            ? user.role === "GUEST"
            : msg.author.startsWith("G");

          return (
            <div key={msg.id}>
              {msg.isSystem ? (
                <div className="flex justify-center">
                  <span className="px-4 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {msg.message}
                  </span>
                </div>
              ) : (
                <div
                  className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div className="avatar shrink-0">
                    <div className="w-9 h-9 rounded-xl border border-white/10 ring-1 ring-white/5 overflow-hidden bg-white/5 flex items-center justify-center">
                      {isGuestAuthor ? (
                        <UserCircle className="w-6 h-6 text-white/20" />
                      ) : (
                        <img
                          src={isMe ? user.avatar : msg.authorAvatar}
                          alt={msg.author}
                        />
                      )}
                    </div>
                  </div>

                  <div
                    className={`flex flex-col space-y-1.5 max-w-[75%] ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 px-1">
                      <span className="text-[10px] font-black text-gray-400 uppercase italic">
                        {isMe ? "YOU" : msg.author}
                      </span>
                      <span className="text-[8px] font-bold text-gray-600 uppercase">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </span>
                    </div>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-lg ${
                        isMe
                          ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none"
                          : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 섹션 */}
      <div className="shrink-0 p-6 bg-white/5 border-t border-white/5">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`${currentNickname}님, 메시지를 입력하세요...`}
            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium text-white placeholder:text-gray-600 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-30 disabled:grayscale cursor-pointer disabled:cursor-default"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;
