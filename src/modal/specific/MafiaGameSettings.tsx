import { Clock, Users, Skull, Stethoscope, Shield } from "lucide-react";

const MafiaGameSettings = ({ settings, onChange }: any) => {
  const maxPlayers = settings.maxPlayers || 8;
  const mafiaCount = settings.mafiaCount || 1;
  const hasDoctor = settings.hasDoctor !== false;
  const hasPolice = settings.hasPolice !== false;
  const nightTime = settings.nightTime || 45;
  const dayTime = settings.dayTime || 120;
  const voteTime = settings.voteTime || 30;

  return (
    <div className="space-y-8">
      {/* 최대 인원 수 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Users className="w-3 h-3" /> 최대 참가 인원
          </label>
          <span className="text-lg font-black italic text-purple-400">{maxPlayers}명</span>
        </div>
        <input
          type="range"
          min="4"
          max="12"
          step="1"
          value={maxPlayers}
          onChange={(e) => onChange({ maxPlayers: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
        <p className="text-[10px] text-gray-600 font-bold text-right">※ 마피아 게임은 4~12인 플레이를 권장합니다.</p>
      </div>

      <div className="h-px bg-white/5" />

      {/* 마피아 수 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Skull className="w-3 h-3" /> 마피아 인원
          </label>
          <span className="text-lg font-black italic text-red-400">{mafiaCount}명</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ mafiaCount: n })}
              className={`flex-1 py-3 rounded-xl border font-black transition-all ${
                mafiaCount === n ? "bg-red-500/20 border-red-500 text-white" : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10"
              }`}
            >
              {n}명
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* 특수 역할 */}
      <div className="space-y-4">
        <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
          특수 역할
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onChange({ hasDoctor: !hasDoctor })}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
              hasDoctor ? "bg-emerald-500/20 border-emerald-500" : "bg-white/5 border-white/5"
            }`}
          >
            <Stethoscope className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">의사</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ hasPolice: !hasPolice })}
            className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
              hasPolice ? "bg-amber-500/20 border-amber-500" : "bg-white/5 border-white/5"
            }`}
          >
            <Shield className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">경찰</span>
          </button>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* 밤 시간 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" /> 밤 단계 시간
          </label>
          <span className="text-lg font-black italic text-purple-400">{nightTime}초</span>
        </div>
        <input
          type="range"
          min="20"
          max="90"
          step="5"
          value={nightTime}
          onChange={(e) => onChange({ nightTime: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* 낮 토론 시간 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" /> 낮 토론 시간
          </label>
          <span className="text-lg font-black italic text-purple-400">{dayTime}초</span>
        </div>
        <input
          type="range"
          min="60"
          max="300"
          step="30"
          value={dayTime}
          onChange={(e) => onChange({ dayTime: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>

      {/* 투표 시간 */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Clock className="w-3 h-3" /> 투표 시간
          </label>
          <span className="text-lg font-black italic text-purple-400">{voteTime}초</span>
        </div>
        <input
          type="range"
          min="15"
          max="60"
          step="5"
          value={voteTime}
          onChange={(e) => onChange({ voteTime: Number(e.target.value) })}
          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
        />
      </div>
    </div>
  );
};

export default MafiaGameSettings;
