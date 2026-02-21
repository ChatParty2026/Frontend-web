import { Hash, Clock } from "lucide-react";

const THEMES = [
  { id: "fruit", label: "과일", icon: "🍎" },
  { id: "sports", label: "스포츠", icon: "⚽" },
  { id: "animal", label: "동물", icon: "🐶" },
  { id: "food", label: "음식", icon: "🍕" },
  { id: "job", label: "직업", icon: "👨‍⚕️" },
  { id: "random", label: "랜덤", icon: "🎲" },
];

const LiarGameSettings = ({ settings, onChange }: any) => {
  // 초기값 설정
  const theme = settings.theme || "fruit";
  const time = settings.discussionTime || 40;

  return (
    <div className="space-y-8">
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
                theme === t.id ? "bg-purple-500/20 border-purple-500 text-white" : "bg-white/5 border-white/5 text-gray-400"
              }`}
            >
              <span className="text-xl">{t.icon}</span>
              <span className="text-[10px] font-bold mt-1">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" /> 토론 시간
          </label>
          <span className="text-lg font-black italic text-pink-500">{time}초</span>
        </div>
        <input 
          type="range" min="20" max="180" step="10" 
          value={time} 
          onChange={(e) => onChange({ discussionTime: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-pink-500" 
        />
      </div>
    </div>
  );
};

export default LiarGameSettings;