import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Crown, Send, LogOut, Settings, Play } from "lucide-react";

interface Player {
  id: number;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  avatar?: string;
}

const GameWaitingRoom = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  // 와이어프레임의 3/8 인원 표시 반영
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, nickname: "김채티", isHost: true, isReady: true },
    { id: 2, nickname: "개발왕", isHost: false, isReady: true },
    { id: 3, nickname: "뉴비입니당", isHost: false, isReady: false },
  ]);

  const maxPlayers = 8;

  const handleExit = () => {
    if (window.confirm("정말 방에서 나가시겠습니까?")) {
      navigate("/rooms");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex items-center justify-center">
      <div className="container max-w-6xl w-full h-[800px] bg-[#121212] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* 상단 헤더: 와이어프레임의 '대기중' 타이틀 및 인원수 */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
              Waiting Room
            </h1>
            <div className="px-4 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 font-bold text-sm">
              {players.length} / {maxPlayers} PLAYERS
            </div>
          </div>
          <button
            onClick={handleExit}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            나가기
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* 좌측: 유저 리스트 (와이어프레임의 인원 목록 섹션) */}
          <div className="w-1/3 border-r border-white/5 p-8 overflow-y-auto space-y-4 bg-black/20">
            <h2 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6">
              Player List
            </h2>
            {players.map((player) => (
              <div
                key={player.id}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  player.isHost
                    ? "bg-purple-500/5 border-purple-500/30"
                    : "bg-white/5 border-white/5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 ${player.isHost ? "border-purple-500" : "border-gray-700"}`}
                  >
                    <User
                      className={
                        player.isHost ? "text-purple-500" : "text-gray-600"
                      }
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold">{player.nickname}</span>
                      {player.isHost && (
                        <Crown className="w-3 h-3 text-yellow-500" />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-black ${player.isReady ? "text-emerald-500" : "text-gray-600"}`}
                    >
                      {player.isReady ? "READY" : "WAITING"}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* 빈 슬롯 표시 */}
            {Array.from({ length: maxPlayers - players.length }).map((_, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl border border-dashed border-white/5 flex items-center justify-center text-gray-800 italic font-bold"
              >
                EMPTY SLOT
              </div>
            ))}
          </div>

          {/* 우측: 채팅 및 설정 (와이어프레임의 게임 시작/채팅 섹션) */}
          <div className="flex-1 flex flex-col">
            {/* 채팅 영역 */}
            <div className="flex-1 p-8 overflow-y-auto space-y-4">
              <div className="text-center">
                <span className="text-[11px] bg-white/5 px-4 py-1 rounded-full text-gray-500 font-medium">
                  즐거운 파티를 위해 매너 채팅을 부탁드려요! ✨
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-purple-400">
                  System
                </span>
                <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                  김채티님이 방장으로 임명되었습니다.
                </p>
              </div>
            </div>

            {/* 하단 입력창 및 시작 버튼 */}
            <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all"
                />
                <button className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all">
                  <Send className="w-5 h-5 text-purple-500" />
                </button>
              </div>

              <div className="flex gap-4">
                <button className="flex-1 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-2 font-black italic hover:bg-white/10 transition-all uppercase tracking-wider text-gray-400">
                  <Settings className="w-5 h-5" />
                  Room Settings
                </button>
                {/* 와이어프레임 우측 상단 '게임시작' 버튼의 존재감을 하단 메인 액션으로 배치 */}
                <button className="flex-[2] h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center gap-3 font-black italic hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] uppercase tracking-wider">
                  <Play className="w-6 h-6 fill-current" />
                  Start Game
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameWaitingRoom;
