import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Send, LogOut, Info, HelpCircle, Timer, Ghost } from "lucide-react";

interface Player {
  id: number;
  nickname: string;
  isLiar: boolean;
  hasVoted: boolean;
}

const LiarGameRoom = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [gameState, setGameState] = useState<"DISCUSS" | "VOTE" | "RESULT">(
    "DISCUSS",
  );

  // 게임 데이터 예시
  const players: Player[] = [
    { id: 1, nickname: "김채티", isLiar: false, hasVoted: false },
    { id: 2, nickname: "개발왕", isLiar: true, hasVoted: false },
    { id: 3, nickname: "뉴비입니당", isLiar: false, hasVoted: false },
  ];

  const category = "음식";
  const keyword = "치킨"; // 라이어는 이 키워드를 모름

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6 flex flex-col items-center">
      {/* 상단 정보 바 */}
      <div className="w-full max-w-6xl flex justify-between items-center mb-6 px-4">
        <div className="flex items-center gap-6">
          {/* 게임 타입 뱃지 추가 */}
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
            <Ghost className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-black italic uppercase tracking-wider text-blue-500">
              Liar Game
            </span>
          </div>

          <div className="h-6 w-[1px] bg-white/10" />

          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-pink-500" />
            <span className="text-2xl font-black italic tracking-tighter">
              01:30
            </span>
          </div>
          <div className="h-6 w-[1px] bg-white/10" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
              Category
            </span>
            <span className="text-sm font-bold">{category}</span>
          </div>
        </div>

        <button
          onClick={() => navigate("/rooms")}
          className="p-3 bg-white/5 hover:bg-red-500/20 rounded-2xl transition-all group"
        >
          <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
        </button>
      </div>

      <div className="container max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-180px)]">
        {/* 좌측: 플레이어 카드 섹션 (8명 기준 그리드) */}
        <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {players.map((player) => (
            <div
              key={player.id}
              className={`relative bg-[#121212] border-2 rounded-[2rem] p-6 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer hover:border-purple-500/50 ${
                gameState === "VOTE"
                  ? "hover:scale-[1.05] bg-purple-500/5 border-purple-500/20"
                  : "border-white/5"
              }`}
            >
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                <User className="w-8 h-8 text-gray-600" />
              </div>
              <span className="font-bold text-sm">{player.nickname}</span>
              {gameState === "VOTE" && (
                <div className="absolute top-4 right-4 w-3 h-3 rounded-full bg-gray-800" />
              )}
            </div>
          ))}
          {/* 빈 슬롯 표시 생략 가능 */}
        </div>

        {/* 우측: 게임 컨트롤 및 채팅 섹션 */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          {/* 제시어 카드 (라이어 여부에 따라 다르게 보임) */}
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <Info className="w-4 h-4 text-white/70" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                  Your Mission
                </span>
              </div>
              <h2 className="text-3xl font-black italic tracking-tighter mb-1">
                {keyword}
              </h2>
              <p className="text-xs font-medium text-white/60">
                라이어에게 들키지 않게 설명하세요!
              </p>
            </div>
            <HelpCircle className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 -rotate-12" />
          </div>

          {/* 채팅 영역 */}
          <div className="flex-1 bg-[#121212] border border-white/10 rounded-[2.5rem] flex flex-col overflow-hidden">
            <div className="flex-1 p-6 overflow-y-auto space-y-4 text-sm custom-scrollbar">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-500">
                  System
                </span>
                <p className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5 text-gray-400">
                  발언 시간이 시작되었습니다. 한 명씩 돌아가며 설명해주세요.
                </p>
              </div>
              {/* 유저 채팅 메시지 예시 */}
              <div className="flex flex-col gap-1 items-end">
                <span className="text-[10px] font-bold text-purple-400">
                  나
                </span>
                <p className="bg-purple-600 p-3 rounded-2xl rounded-tr-none text-white">
                  이거 진짜 맛있는데.. 야식의 왕이죠.
                </p>
              </div>
            </div>

            {/* 채팅 입력 */}
            <div className="p-4 bg-black/20 border-t border-white/5 flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="메시지 입력..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 transition-all"
              />
              <button className="p-3 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiarGameRoom;
