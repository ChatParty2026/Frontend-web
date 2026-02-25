import { Hash, Clock, Layers, Users } from "lucide-react";

const THEMES = [
  { id: "fruit", label: "과일", icon: "🍎" },
  { id: "sports", label: "스포츠", icon: "⚽" },
  { id: "animal", label: "동물", icon: "🐶" },
  { id: "food", label: "음식", icon: "🍕" },
  { id: "job", label: "직업", icon: "👨‍⚕️" },
  { id: "random", label: "랜덤", icon: "🎲" },
];

const LiarGameSettings = ({ settings, onChange }: any) => {
  const theme = settings.theme || "fruit";
  const time = settings.discussionTime || 40;
  const rounds = settings.totalRounds || 2; 
  // 🎯 새로 추가: 라이어 게임은 3명 ~ 8명으로 제한
  const maxPlayers = settings.maxPlayers || 8; 

  return (
    <div className="space-y-8">
      
      {/* 🎯 0. 최대 인원 수 설정 (3~8명) */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Users className="w-3 h-3" /> 최대 참가 인원
          </label>
          <span className="text-lg font-black italic text-purple-400">{maxPlayers}명</span>
        </div>
        <input 
          type="range" min="3" max="8" step="1" 
          value={maxPlayers} 
          onChange={(e) => onChange({ maxPlayers: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" 
        />
        <p className="text-[10px] text-gray-600 font-bold text-right">※ 라이어 게임은 3~8인 플레이를 권장합니다.</p>
      </div>

      <div className="h-px bg-white/5" />

      {/* 1. 제시어 테마 */}
      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          <Hash className="w-3 h-3" /> 제시어 테마
        </label>
        <div className="grid grid-cols-3 gap-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ theme: t.id })}
              className={`flex flex-col items-center p-3 rounded-2xl border transition-all ${
                theme === t.id ? "bg-purple-500/20 border-purple-500 text-white" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] font-bold mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. 진행 라운드 수 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Layers className="w-3 h-3" /> 진행 라운드 수
          </label>
          <span className="text-lg font-black italic text-purple-400">{rounds} Round</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onChange({ totalRounds: r })}
              className={`flex-1 py-3 rounded-xl border font-black transition-all ${
                rounds === r 
                  ? "bg-purple-500/20 border-purple-500 text-white" 
                  : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {r} 라운드
            </button>
          ))}
        </div>
      </div>

      {/* 3. 토론 시간 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" /> 토론 시간
          </label>
          <span className="text-lg font-black italic text-purple-400">{time}초</span>
        </div>
        <input 
          type="range" min="20" max="180" step="10" 
          value={time} 
          onChange={(e) => onChange({ discussionTime: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500" 
        />
      </div>
    </div>
  );
};

export default LiarGameSettings;