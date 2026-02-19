import { Send, MessageCircle, ChevronRight } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import type { AuthUser } from "../types/auth";
import type { ChatMessage } from "../types/chat";
import { useSocket } from "../context/SocketContext";
import { SOCKET_EVENTS } from "../constants/events";
import ChatMessageItem from "./atoms/ChatMessageItem";

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

const LiveChat = ({ user, isOpen, onToggle }: { user: AuthUser | null; isOpen: boolean; onToggle: () => void }) => {
  const { sendMessage, isConnected } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [isAtBottom, setIsAtBottom] = useState(true);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // 최하단 지점 Ref
  const isMyMessageRef = useRef(false);
  const currentNickname = user?.nickname;

  // 스크롤 위치 감지
  const handleScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const bottom = scrollHeight - scrollTop <= clientHeight + 100; // 오차 범위 100px
      setIsAtBottom(bottom);
    }
  };

  // 최하단 이동 함수
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);

  // 메시지 갱신 시 스크롤 처리
  useEffect(() => {
    if (isMyMessageRef.current || isAtBottom) {
      // 렌더링 후 실행되도록 0ms 타이머 사용
      const timer = setTimeout(() => {
        scrollToBottom(isMyMessageRef.current ? "smooth" : "auto");
        isMyMessageRef.current = false;
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [messages, isAtBottom, scrollToBottom]);

  // 소켓 이벤트 핸들러
  const handleNewChat = useCallback((e: any) => {
    const data = e.detail;
    if (data.gameType === "MAIN") {
      setMessages((prev) => [
        ...prev,
        {
          id: `${data.timestamp}-${Math.random().toString(36).substring(2, 9)}`,
          author: data.sender,
          authorAvatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.sender}`,
          message: data.message,
          timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
          isSystem: data.sender === "SYSTEM",
        },
      ].slice(-100));
    }
  }, []);

  const handleNotice = useCallback((e: any) => {
    const data = e.detail;
    if (data.gameType === "MAIN") {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          author: "시스템",
          authorAvatar: "",
          message: data.message,
          timestamp: new Date(),
          isSystem: true,
        },
      ].slice(-100));
    }
  }, []);

  const handleRoomUpdate = useCallback((e: any) => {
    const payload = e.detail;
    if (payload?.lobbyCount !== undefined) setOnlineCount(payload.lobbyCount);
  }, []);

  useEffect(() => {
    window.addEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
    window.addEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNotice);
    window.addEventListener(SOCKET_EVENTS.ROOM_LIST_UPDATED, handleRoomUpdate);
    return () => {
      window.removeEventListener(SOCKET_EVENTS.NEW_CHAT, handleNewChat);
      window.removeEventListener(SOCKET_EVENTS.SYSTEM_NOTICE, handleNotice);
      window.removeEventListener(SOCKET_EVENTS.ROOM_LIST_UPDATED, handleRoomUpdate);
    };
  }, [handleNewChat, handleNotice, handleRoomUpdate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !isConnected) return;
    isMyMessageRef.current = true; // 내가 보낸 메시지임을 표시
    sendMessage({ type: "CHAT", gameType: "MAIN", roomId: "main", message: newMessage });
    setNewMessage("");
  };

  if (!user) return <div className="p-10 text-center text-gray-500">Connecting...</div>;

  return (
    <div className="w-full h-full flex flex-col bg-transparent">
      {/* 헤더 */}
      <div className="relative shrink-0 p-6 flex items-center justify-between border-b border-white/5 bg-white/5 rounded-tl-[2.5rem]">
        <button onClick={onToggle} className="absolute left-0 top-[37px] -translate-x-full z-50 flex items-center justify-center w-10 h-12 bg-[#121212] border border-white/10 border-r-0 rounded-l-2xl transition-all hover:bg-purple-600 group cursor-pointer shadow-[-4px_0_15px_rgba(0,0,0,0.5)]">
          {isOpen ? <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-white ml-1" /> : <MessageCircle className="w-4.5 h-4.5 text-gray-400 group-hover:text-white" />}
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-pink-500/10 rounded-lg"><MessageCircle className="w-5 h-5 text-pink-500" /></div>
          <h2 className="text-xl font-black italic tracking-tight text-white uppercase">Live Chat</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">{onlineCount} ONLINE</span>
        </div>
      </div>

      {/* 메시지 영역 */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide pb-0" // scroll-smooth 제거
      >
        {messages.map((msg) => (
          <ChatMessageItem key={msg.id} msg={msg} isMe={msg.author === currentNickname} />
        ))}
        {/* 스크롤 타겟 */}
        <div ref={messagesEndRef} className="h-px w-full" />
      </div>

      {/* 입력 섹션 */}
      <div className="shrink-0 p-6 bg-white/5 border-t border-white/5 rounded-bl-[2.5rem]">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={`${currentNickname}님, 메시지를 입력하세요...`}
            className="w-full bg-black/40 border border-white/10 focus:border-purple-500/50 rounded-2xl py-4 pl-5 pr-14 text-sm font-medium text-white placeholder:text-gray-600 transition-all outline-none"
          />
          <button type="submit" disabled={!newMessage.trim() || !isConnected} className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-xl transition-all disabled:opacity-30 cursor-pointer">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChat;