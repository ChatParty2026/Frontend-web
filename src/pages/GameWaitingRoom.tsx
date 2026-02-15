import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Crown, Send, LogOut, Settings, Play } from "lucide-react";

interface Player {
  id: number;
  nickname: string;
  isHost: boolean;
  isReady: boolean;
  avatar?: string;
}

const GameWaitingRoom = () => {
  const { roomId } = useParams(); // URL에서 roomId 추출
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [maxCount, setMaxCount] = useState(8);
  const isHost = players.find(
    (p) => p.nickname === currentUserNickname,
  )?.isHost;
  const [gameType, setGameType] = useState<string>("LIAR");

  useEffect(() => {
    const handleUpdate = (e: any) => {
      const {
        players: updatedPlayers,
        roomId: eventRoomId,
        maxCount: updatedMax,
      } = e.detail;

      if (eventRoomId === roomId) {
        setPlayers(updatedPlayers);
        if (updatedMax) setMaxCount(updatedMax);
      }
    };

    window.addEventListener("PLAYER_LIST_UPDATE", handleUpdate);
    return () => window.removeEventListener("PLAYER_LIST_UPDATE", handleUpdate);
  }, [roomId]);

  const handleExit = () => {
    if (window.confirm("정말 방에서 나가시겠습니까?")) {
      navigate("/rooms");
    }
  };

  const handleStartGame = () => {
    if (!isHost) {
      alert("방장만 게임을 시작할 수 있습니다.");
      return;
    }

    // 서버에서 받은 "LIAR" -> "liar"로 변환하여 경로 생성
    const lowerGameType = gameType.toLowerCase();

    // roomId는 useParams()에서 가져온 값을 그대로 사용
    navigate(`/game/${lowerGameType}/${roomId}`);

    // (참고) 실제 서비스라면 여기서 소켓으로 '게임 시작' 이벤트를 먼저 보내고,
    // 모든 인원이 동시에 이동하도록 처리하는 것이 좋습니다.
    /*
  sendMessage({
    type: "START_GAME",
    roomId: roomId,
    gameType: gameType
  });
  */
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 flex items-center justify-center">
      <div className="container max-w-6xl w-full h-[800px] bg-[#121212] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden flex flex-col">
        {/* 상단 헤더 */}
        <div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 uppercase">
              Waiting Room
            </h1>
            <div className="px-4 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 font-bold text-sm">
              {players.length} / {maxCount} PLAYERS
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
          {/* 좌측: 유저 리스트 */}
          <div className="w-1/3 border-r border-white/5 p-8 overflow-y-auto space-y-4 bg-black/20 custom-scrollbar">
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

            {/* 빈 슬롯 표시: maxCount 적용 */}
            {Array.from({ length: Math.max(0, maxCount - players.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="p-4 rounded-2xl border border-dashed border-white/5 flex items-center justify-center text-gray-800 italic font-bold"
                >
                  EMPTY SLOT
                </div>
              ),
            )}
          </div>

          {/* 우측: 채팅 및 설정 */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 p-8 overflow-y-auto space-y-4 custom-scrollbar">
              <div className="text-center">
                <span className="text-[11px] bg-white/5 px-4 py-1 rounded-full text-gray-500 font-medium">
                  즐거운 파티를 위해 매너 채팅을 부탁드려요! ✨
                </span>
              </div>
              {/* 시스템 메시지 예시 */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-bold text-purple-400">
                  System
                </span>
                <p className="text-sm text-gray-400 bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                  방에 입장하였습니다. 다른 플레이어를 기다려주세요.
                </p>
              </div>
            </div>

            <div className="p-8 bg-black/40 border-t border-white/5 space-y-6">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-purple-500 transition-all text-white"
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
                <button
                  onClick={handleStartGame}
                  className="flex-[2] h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center gap-3 font-black italic hover:scale-[1.02] transition-all shadow-[0_0_30px_rgba(168,85,247,0.3)] uppercase tracking-wider text-white"
                >
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
