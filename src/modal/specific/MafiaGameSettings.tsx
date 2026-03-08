import { Clock, Users, Skull, Stethoscope, Shield, AlertCircle } from "lucide-react";
import { useEffect } from "react";

const MafiaGameSettings = ({ settings, onChange }: any) => {
  const maxPlayers = settings.maxPlayers || 8;
  const mafiaCount = settings.mafiaCount || 1;
  const nightTime = settings.nightTime || 45;
  const dayTime = settings.dayTime || 120;
  const voteTime = settings.voteTime || 30;

  // 🎯 마피아 최대 인원 계산 (최대 인원의 40% 제한, 소수점 버림)
  const maxAllowedMafia = Math.max(1, Math.floor(maxPlayers * 0.4));

  // 최대 인원 슬라이더 조정 시 마피아 수 자동 보정
  useEffect(() => {
    if (mafiaCount > maxAllowedMafia) {
      onChange({ mafiaCount: maxAllowedMafia });
    }
  }, [maxPlayers, mafiaCount, maxAllowedMafia, onChange]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. 최대 인원 수 설정 */}
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
        <p className="text-[10px] text-gray-600 font-bold text-right italic font-mono">
          4 - 12 PLAYERS
        </p>
      </div>

      <div className="h-px bg-white/5" />

      {/* 2. 마피아 인원 설정 (40% 제한 반영) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-[11px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
            <Skull className="w-3 h-3 text-red-500" /> 마피아 인원
          </label>
          <div className="relative">
            <select
              value={mafiaCount}
              onChange={(e) => onChange({ mafiaCount: Number(e.target.value) })}
              className="bg-[#2a2a2a] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-black text-red-400 focus:outline-none focus:border-red-500/50 appearance-none pr-10 cursor-pointer transition-all hover:bg-[#333]"
            >
              {Array.from({ length: maxAllowedMafia }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num}명
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-500">
              <div className="w-2 h-2 border-r-2 border-b-2 border-current rotate-45 mb-1" />
            </div>
          </div>
        </div>
        
        <div className="flex items-start gap-2 p-3.5 bg-red-500/5 border border-red-500/10 rounded-2xl">
          <AlertCircle className="w-3.5 h-3.5 text-red-500 mt-0.5" />
          <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
            게임 밸런스를 위해 마피아는 최대 인원의 <span className="text-red-400 font-bold">40%({maxAllowedMafia}명)</span>까지만 설정할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="h-px bg-white/5" />

      {/* 3. 시간 설정 섹션 */}
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
              <Clock className="w-3 h-3" /> 낮 토론 시간
            </label>
            <span className="text-sm font-black italic text-purple-400">{dayTime}s</span>
          </div>
          <input
            type="range" min="60" max="300" step="30"
            value={dayTime}
            onChange={(e) => onChange({ dayTime: Number(e.target.value) })}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">밤 시간</label>
              <span className="text-xs font-black text-purple-400">{nightTime}s</span>
            </div>
            <input
              type="range" min="20" max="90" step="5"
              value={nightTime}
              onChange={(e) => onChange({ nightTime: Number(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">투표 시간</label>
              <span className="text-xs font-black text-purple-400">{voteTime}s</span>
            </div>
            <input
              type="range" min="15" max="60" step="5"
              value={voteTime}
              onChange={(e) => onChange({ voteTime: Number(e.target.value) })}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MafiaGameSettings;