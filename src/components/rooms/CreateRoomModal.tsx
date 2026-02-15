import { useState, useEffect } from "react";
import {
  X,
  Lock,
  Unlock,
  Users,
  MessageCircle,
  Skull,
  Search,
} from "lucide-react";
import { useSocket } from "../../context/SocketContext";
import { useNavigate } from "react-router-dom";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  socket: WebSocket | null;
  currentUser: string;
}

type GameType = "MAFIA" | "LIAR" | "JUST_CHAT";

const CreateRoomModal = ({
  isOpen,
  onClose,
  currentUser,
}: CreateRoomModalProps) => {
  const { sendMessage, isConnected } = useSocket();
  const [roomTitle, setRoomTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [gameType, setGameType] = useState<GameType>("LIAR");
  const [maxPlayers, setMaxPlayers] = useState(8);
  const navigate = useNavigate();

  useEffect(() => {
    const handleRoomCreated = (e: any) => {
      const data = e.detail;
      console.log("📥 방 생성 응답 수신:", data);

      // 내비게이션 로직
      if (data.gameType === "JUST_CHAT") {
        // 잡담 방은 바로 입장
        navigate(`/chat/${data.roomId}`);
      } else {
        // 게임 방(MAFIA, LIAR 등)은 대기실로 먼저 이동
        navigate(`/waiting/${data.roomId}`);
      }

      onClose(); // 모달 닫기
    };

    window.addEventListener("ROOM_CREATED", handleRoomCreated);
    return () => window.removeEventListener("ROOM_CREATED", handleRoomCreated);
  }, [navigate, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomTitle.trim()) {
      alert("방 제목을 입력해주세요!");
      return;
    }

    // 2. isConnected 상태로 연결 확인
    if (!isConnected) {
      alert("서버와 연결되어 있지 않습니다.");
      return;
    }

    const createData = {
      type: "CREATE",
      gameType: gameType,
      title: roomTitle,
      sender: currentUser,
      maxCount: maxPlayers,
      password: isPrivate && password ? password : null,
      roomId: crypto.randomUUID(),
    };

    // 3. sendMessage 함수 사용 (JSON.stringify 과정이 내장되어 있어 편리함)
    sendMessage(createData);

    // onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-8 pb-0 flex justify-between items-center">
          <h2 className="text-2xl font-black italic tracking-tight text-white uppercase">
            Create Room
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 방 제목 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">
              Room Title
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="방 제목을 입력하세요"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600 text-white"
            />
          </div>

          {/* 비밀번호 설정 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Privacy
              </label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors cursor-pointer ${isPrivate ? "text-pink-500" : "text-gray-500"}`}
              >
                {isPrivate ? (
                  <Lock className="w-3 h-3" />
                ) : (
                  <Unlock className="w-3 h-3" />
                )}
                비밀방 설정
              </button>
            </div>
            <input
              type="password"
              disabled={!isPrivate}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isPrivate ? "비밀번호 입력" : "공개 방입니다"}
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-pink-500 transition-all placeholder:text-gray-600 text-white ${!isPrivate && "opacity-50 cursor-not-allowed"}`}
            />
          </div>

          {/* 게임 종류 (3컬럼 그리드 적용) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1 text-center block">
              Select Mode
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: "LIAR",
                  label: "라이어",
                  icon: <Search className="w-4 h-4 mb-1" />,
                },
                {
                  id: "MAFIA",
                  label: "마피아",
                  icon: <Skull className="w-4 h-4 mb-1" />,
                },
                {
                  id: "JUST_CHAT",
                  label: "잡담",
                  icon: <MessageCircle className="w-4 h-4 mb-1" />,
                },
              ].map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setGameType(mode.id as GameType)}
                  className={`py-3 rounded-2xl border flex flex-col items-center justify-center font-black italic transition-all cursor-pointer ${
                    gameType === mode.id
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 border-transparent text-white shadow-lg scale-105"
                      : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  {mode.icon}
                  <span className="text-xs uppercase">{mode.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 인원수 설정 */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Max Players
              </label>
              <span className="text-xs font-bold text-white italic">
                {maxPlayers}명
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2 px-4">
              <input
                type="range"
                min="2"
                max="12"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="flex-1 accent-purple-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
              />
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-lg hover:bg-purple-500 hover:text-white transition-all shadow-xl hover:shadow-purple-500/20 active:scale-[0.98] cursor-pointer"
          >
            CREATE & START
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
