import { useState, useEffect } from "react";
import { X, Lock, Users, Hash, ShieldQuestion, Gamepad2, MessageCircle } from "lucide-react";
import { useSocket } from "../../context/SocketContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: string;
}

// 🎯 게임 타입별 설정값 통합 관리 (확장하기 쉽게 구조화)
const GAME_CONFIG: Record<string, { label: string; icon: any; min: number; max: number; desc: string }> = {
  JUST_CHAT: { label: "잡담", icon: MessageCircle, min: 2, max: 20, desc: "자유롭게 이야기를 나누는 방입니다." },
  LIAR: { label: "라이어", icon: ShieldQuestion, min: 3, max: 8, desc: "시민들 사이에 숨은 라이어를 찾아내세요!" },
  MAFIA: { label: "마피아", icon: Gamepad2, min: 4, max: 12, desc: "낮과 밤이 존재하는 치열한 심리전 게임입니다." },
};

const CreateRoomModal = ({ isOpen, onClose, currentUser }: Props) => {
  const { sendMessage } = useSocket();

  const [title, setTitle] = useState("");
  const [gameType, setGameType] = useState<keyof typeof GAME_CONFIG>("LIAR");
  const [maxCount, setMaxCount] = useState(GAME_CONFIG["LIAR"].max); // 초기값 설정
  const [password, setPassword] = useState("");
  const [usePassword, setUsePassword] = useState(false);

  // 🎯 게임 타입이 바뀔 때마다 인원수 슬라이더를 해당 게임의 기본(최대)값으로 리셋
  useEffect(() => {
    setMaxCount(GAME_CONFIG[gameType].max);
  }, [gameType]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    sendMessage({
      type: "CREATE",
      gameType,
      roomId: "new_room", // JSON 파싱 에러 방지용 가짜 ID
      
      // 🎯 핵심: 방 설정값들을 서버가 안전하게 읽을 수 있도록 모두 payload 안으로 이동시켰습니다!
      payload: {
        hostNickname: currentUser,
        title: title,
        maxCount: maxCount,
        password: usePassword ? password : null,
      }
    });

    onClose();
    // 모달 닫을 때 상태 초기화
    setTitle("");
    setUsePassword(false);
    setPassword("");
  };

  const selectedConfig = GAME_CONFIG[gameType];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* 백그라운드 오버레이 */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* 모달 본체 */}
      <div className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* 헤더 */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h2 className="text-xl font-black italic uppercase tracking-tight text-white">Create Room</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* 폼 영역 */}
        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          
          {/* 1. 방 제목 입력 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Hash className="w-3 h-3" /> 방 제목
            </label>
            <input
              type="text"
              required
              maxLength={20}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="멋진 방 제목을 입력해주세요"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white outline-none"
            />
          </div>

          {/* 2. 게임 타입 선택 */}
          <div className="space-y-4">
            <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Gamepad2 className="w-3 h-3" /> 게임 종류
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(Object.keys(GAME_CONFIG) as Array<keyof typeof GAME_CONFIG>).map((type) => {
                const config = GAME_CONFIG[type];
                const Icon = config.icon;
                const isSelected = gameType === type;

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setGameType(type)}
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                      isSelected 
                        ? "bg-purple-600/20 border-purple-500 text-white" 
                        : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >
                    <Icon className={`w-6 h-6 ${isSelected ? "text-purple-400" : "text-gray-500"}`} />
                    <span className="text-xs font-bold">{config.label}</span>
                  </button>
                );
              })}
            </div>
            {/* 선택된 게임 설명 */}
            <p className="text-[10px] text-gray-500 font-medium px-2 italic">
              * {selectedConfig.desc}
            </p>
          </div>

          {/* 3. 인원 수 설정 (🎯 선택된 게임에 따라 범위가 동적으로 바뀜) */}
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Users className="w-3 h-3" /> 최대 참가 인원
              </label>
              <span className="text-lg font-black italic text-purple-400">{maxCount}명</span>
            </div>
            <input 
              type="range" 
              min={selectedConfig.min} 
              max={selectedConfig.max} 
              step="1" 
              value={maxCount} 
              onChange={(e) => setMaxCount(Number(e.target.value))}
              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" 
            />
            <div className="flex justify-between text-[10px] text-gray-600 font-bold px-1">
              <span>최소 {selectedConfig.min}명</span>
              <span>최대 {selectedConfig.max}명</span>
            </div>
          </div>

          {/* 4. 비밀번호 설정 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Lock className="w-3 h-3" /> 비밀방 설정
              </label>
              <button
                type="button"
                onClick={() => setUsePassword(!usePassword)}
                className={`w-10 h-5 rounded-full transition-colors relative ${usePassword ? 'bg-purple-500' : 'bg-white/10'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${usePassword ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
            {usePassword && (
              <input
                type="password"
                maxLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 숫자 (최대 8자리)"
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-purple-500/50 transition-all text-white outline-none animate-in fade-in slide-in-from-top-2"
              />
            )}
          </div>

          {/* 생성 버튼 */}
          <button
            type="submit"
            disabled={!title.trim()}
            className="w-full h-16 bg-white text-black rounded-2xl font-black uppercase italic hover:bg-purple-500 hover:text-white transition-all disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-black flex items-center justify-center gap-2 shadow-xl active:scale-[0.98] mt-4"
          >
            Create Match
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateRoomModal;