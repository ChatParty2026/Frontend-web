import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import ChatMessageItem from "../atoms/ChatMessageItem"; 
import type { ChatMessage } from "../../types/chat";

interface GameChatProps {
  messages: ChatMessage[];
  currentTurn: string;
  myNickname: string;
  onSendMessage: (msg: string) => void;
  isVotePhase: boolean;
}

const GameChat = ({ messages, currentTurn, myNickname, onSendMessage, isVotePhase }: GameChatProps) => {
  const [inputMsg, setInputMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // ✅ 사용자가 채팅칠 수 있는 상태인지 판단
  // 1. 투표(DISCUSSION) 단계이거나
  // 2. 발언(INGAME) 단계이면서 내 차례일 때
  const canIChat = isVotePhase || (currentTurn === myNickname);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll && scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, shouldAutoScroll]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !canIChat) return; // 권한 체크 추가
    onSendMessage(inputMsg);
    setInputMsg("");
  };

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden">
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
      >
        {messages.map((msg) => (
          <ChatMessageItem 
            key={msg.id} 
            msg={msg} 
            isMe={msg.author === myNickname} 
          />
        ))}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-zinc-900/50 border-t border-white/5 relative">
        <div className="max-w-4xl mx-auto relative group">
          <input 
            // 🚀 수정: canIChat 변수를 사용하여 투표 단계에서도 활성화
            disabled={!canIChat}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            placeholder={
              isVotePhase ? "자유롭게 토론하고 라이어를 지목하세요!" : 
              canIChat ? "설명을 입력하고 엔터를 누르세요!" : 
              `${currentTurn}님의 차례입니다...`
            }
            className={`w-full bg-black/50 border-2 rounded-xl py-3 px-5 pr-14 text-sm font-medium transition-all outline-none
              ${canIChat ? "border-purple-500/50 focus:border-purple-500" : "border-white/5 opacity-40"}
            `}
          />
          <button 
            type="submit"
            // 🚀 수정: 권한이 있고 메시지가 있을 때만 활성화
            disabled={!canIChat || !inputMsg.trim()}
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all
              ${canIChat ? "text-purple-500 hover:bg-purple-500/10" : "text-zinc-600"}
            `}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GameChat;