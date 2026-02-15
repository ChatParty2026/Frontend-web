import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Send, LogOut, MessageSquare, Users } from "lucide-react";

const JustChatRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  // 임시 데이터 (실제로는 소켓 데이터와 연동)
  const participants = ["따뜻한만두112", "개발자A", "리액트장인"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center p-4 md:p-6">
      {/* 상단 정보 바 */}
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
          onClick={() => navigate("/rooms")}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          EXIT
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 h-[calc(100vh-160px)]">
        {/* 좌측: 참여자 목록 */}
        <div className="lg:col-span-1 bg-[#121212] border border-white/10 rounded-[2.5rem] p-6 flex flex-col">
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
                key={i}
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
          <div className="flex-1 p-6 overflow-y-auto space-y-4 custom-scrollbar">
            {/* 시스템 메시지 */}
            <div className="flex justify-center">
              <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Chat session started
              </span>
            </div>
          </div>

          {/* 입력창 */}
          <div className="p-4 bg-black/20 border-t border-white/5 flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="자유롭게 이야기를 나눠보세요..."
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-white"
            />
            <button className="px-6 bg-white text-black hover:bg-purple-500 hover:text-white rounded-2xl transition-all font-black flex items-center justify-center">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JustChatRoom;
