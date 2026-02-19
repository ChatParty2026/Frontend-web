import { UserCircle } from "lucide-react";
import type { ChatMessage } from "../../types/chat"; // 경로 주의!

interface ChatMessageItemProps {
  msg: ChatMessage;
  isMe: boolean;
}

const ChatMessageItem = ({ msg, isMe }: ChatMessageItemProps) => {
  const hasAvatar = msg.authorAvatar && msg.authorAvatar.trim() !== "";

  // 1. 시스템 메시지 레이아웃
  if (msg.isSystem) {
    return (
      <div className="flex justify-center my-4 animate-in fade-in zoom-in duration-300">
        <span className="px-4 py-1.5 bg-white/5 rounded-full text-[10px] text-gray-500 font-black uppercase tracking-widest border border-white/5 shadow-inner">
          {msg.message}
        </span>
      </div>
    );
  }

  // 2. 일반 채팅 메시지 레이아웃
  return (
    <div className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} group animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* 프사 */}
      <div className="avatar shrink-0">
        <div className="w-9 h-9 rounded-xl border border-white/10 ring-1 ring-white/5 overflow-hidden bg-white/5 flex items-center justify-center transition-transform group-hover:scale-110">
          {hasAvatar ? (
            <img
              src={msg.authorAvatar}
              alt={msg.author}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.author}`;
              }}
            />
          ) : (
            <UserCircle className="w-6 h-6 text-white/20" />
          )}
        </div>
      </div>

      {/* 컨텐츠 (닉네임 + 시간 + 말풍선) */}
      <div className={`flex flex-col space-y-1.5 max-w-[75%] ${isMe ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 px-1">
          <span className="text-[10px] font-black text-gray-400 uppercase italic">
            {isMe ? "YOU" : msg.author}
          </span>
          <span className="text-[8px] font-bold text-gray-600 uppercase">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-sm font-medium leading-relaxed shadow-lg transition-all ${
            isMe
              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-tr-none hover:brightness-110"
              : "bg-white/5 text-gray-300 border border-white/10 rounded-tl-none hover:bg-white/10"
          }`}
        >
          {msg.message}
        </div>
      </div>
    </div>
  );
};

export default ChatMessageItem;