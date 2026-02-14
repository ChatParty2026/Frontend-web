import { useState } from "react";
import { X, Lock, Unlock, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  // 부모로부터 socket 객체나 전송 함수를 prop으로 받는다고 가정합니다.
  socket: WebSocket | null;
  currentUser: string; // USER (닉네임)
}

const CreateRoomModal = ({
  isOpen,
  onClose,
  socket,
  currentUser,
}: CreateRoomModalProps) => {
  const navigate = useNavigate();
  const [roomTitle, setRoomTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  // 서버 코드 규격에 맞춰 "LIAR", "MAFIA" 등으로 매핑이 필요할 수 있습니다.
  const [gameType, setGameType] = useState<"MAFIA" | "LIAR">("MAFIA");
  const [maxPlayers, setMaxPlayers] = useState(8);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!roomTitle.trim()) {
      alert("방 제목을 입력해주세요!");
      return;
    }

    if (!socket || socket.readyState !== WebSocket.OPEN) {
      alert("서버와 연결되어 있지 않습니다.");
      return;
    }

    // 1. 서버 전송 데이터 구성 (이미지의 와이어프레임 필드 반영)
    const createData = {
      type: "CREATE",
      gameType: gameType,
      title: roomTitle,
      sender: currentUser,
      maxCount: maxPlayers,
      password: isPrivate && password ? password : null,
      roomId: crypto.randomUUID(),
    };

    // 2. WebSocket을 통해 방 생성 메시지 전송
    socket.send(JSON.stringify(createData));

    // 참고: 보통 서버에서 CREATE 성공 후 roomId를 포함한 응답을 주면
    // 그 때 navigate를 하는 것이 정확하지만, 일단 요청 직후 로직은 아래와 같습니다.
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
            className="p-2 hover:bg-white/5 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* 방 제목 (title) */}
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

          {/* 비밀번호 설정 (password) */}
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

          {/* 게임 종류 (gameType) */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1 text-center block">
              Select Game
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["MAFIA", "LIAR"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setGameType(type)}
                  className={`py-4 rounded-2xl border font-black italic transition-all ${
                    gameType === type
                      ? "bg-gradient-to-br from-purple-600 to-pink-600 border-transparent text-white shadow-lg"
                      : "bg-white/5 border-white/10 text-gray-500 hover:border-white/20"
                  }`}
                >
                  {type === "MAFIA" ? "마피아" : "라이어"}
                </button>
              ))}
            </div>
          </div>

          {/* 인원수 설정 (maxCount) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Max Players
              </label>
              <span className="text-xs font-bold text-white italic">
                {maxPlayers}명
              </span>
            </div>
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 rounded-2xl p-2">
              <input
                type="range"
                min="4"
                max="12"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(parseInt(e.target.value))}
                className="flex-1 accent-purple-500"
              />
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-purple-500" />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-white text-black py-5 rounded-[1.5rem] font-black text-lg hover:bg-purple-500 hover:text-white transition-all shadow-xl hover:shadow-purple-500/20 active:scale-[0.98]"
          >
            CREATE & START
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;
