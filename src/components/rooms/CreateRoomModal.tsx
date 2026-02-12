import { useState } from "react";
import { X, Lock, Unlock, Users, Gamepad2 } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRoomModal = ({ isOpen, onClose }: CreateRoomModalProps) => {
  const [roomTitle, setRoomTitle] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");
  const [gameType, setGameType] = useState<"마피아" | "라이어">("마피아");
  const [maxPlayers, setMaxPlayers] = useState(8);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      {/* 모달 컨테이너 */}
      <div className="relative w-full max-w-md bg-[#121212] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* 상단 헤더 */}
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

        <form className="p-8 space-y-6">
          {/* 와이어프레임 1: 방 제목 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1">
              Room Title
            </label>
            <input
              type="text"
              value={roomTitle}
              onChange={(e) => setRoomTitle(e.target.value)}
              placeholder="방 제목을 입력하세요"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-purple-500 transition-all placeholder:text-gray-600"
            />
          </div>

          {/* 와이어프레임 2: 비밀번호 설정 (체크박스 포함) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest">
                Privacy
              </label>
              <button
                type="button"
                onClick={() => setIsPrivate(!isPrivate)}
                className={`flex items-center gap-1.5 text-[10px] font-bold transition-colors ${isPrivate ? "text-pink-500" : "text-gray-500"}`}
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
              className={`w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-5 text-sm focus:outline-none focus:border-pink-500 transition-all placeholder:text-gray-600 ${!isPrivate && "opacity-50 cursor-not-allowed"}`}
            />
          </div>

          {/* 와이어프레임 3: 게임 종류 선택 */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-purple-400 uppercase tracking-widest ml-1 text-center block">
              Select Game
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(["마피아", "라이어"] as const).map((type) => (
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
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 와이어프레임 4: 인원수 설정 */}
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

          {/* 생성 버튼 */}
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
