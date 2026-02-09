import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  UserCircle,
  LogIn,
  PencilLine,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";

interface UserProfile {
  name: string;
  avatar: string;
  wins: number;
  losses: number;
  attendanceDays: number;
  rank: string;
}

const UserProfileCard = ({ user }: { user: UserProfile | null }) => {
  const [tempName, setTempName] = useState("익명의 게이머");
  const [isEditing, setIsEditing] = useState(false);

  // 게스트 상태 UI
  if (!user) {
    return (
      <div className="w-full bg-transparent overflow-hidden">
        {/* 상단 섹션 */}
        <div className="bg-white/5 p-6 flex items-center gap-4 border-b border-white/5">
          <div className="avatar">
            <div className="w-16 h-16 rounded-[1.25rem] bg-white/5 flex items-center justify-center text-gray-600 shadow-inner border border-white/10">
              <UserCircle className="w-10 h-10" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 group">
              {isEditing ? (
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  onBlur={() => setIsEditing(false)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditing(false)}
                  autoFocus
                  className="bg-transparent border-b border-purple-500 outline-none w-full font-bold text-lg text-white"
                />
              ) : (
                <>
                  <h3 className="text-lg font-bold truncate text-gray-300 italic uppercase">
                    {tempName}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors"
                  >
                    <PencilLine className="w-4 h-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
            <p className="text-[10px] font-black text-purple-500/50 uppercase tracking-[0.2em]">
              Guest Access
            </p>
          </div>
        </div>

        <div className="p-6 text-center space-y-5">
          <p className="text-sm text-gray-500 font-medium leading-relaxed px-4">
            로그인하고 <span className="text-purple-400">나만의 아바타</span>와 <br />
            <span className="text-pink-400">전적 랭킹</span>을 확인해보세요!
          </p>

          <button className="w-full h-12 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl flex items-center justify-center gap-2 transition-all font-bold italic tracking-tight group">
            <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            LOGIN NOW
          </button>

          <div className="flex justify-around pt-2">
            {[ {icon: Trophy, label: "RANK"}, {icon: Flame, label: "STREAK"} ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1 opacity-20 group-hover:opacity-40 transition-opacity">
                <item.icon className="w-5 h-5 text-white" />
                <span className="text-[9px] font-black tracking-widest text-white">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalGames = user.wins + user.losses;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  // 로그인 상태 UI
  return (
    <div className="w-full bg-transparent overflow-hidden">
      {/* 프리미엄 헤더 영역 */}
      <div className="relative p-6 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 h-16 rounded-2xl ring-2 ring-purple-500/50 p-0.5 bg-gradient-to-tr from-purple-500 to-pink-500 shadow-[0_0_20px_rgba(168,85,247,0.3)]">
                <img src={user.avatar} alt={user.name} className="rounded-[0.9rem] bg-[#121212]" />
              </div>
            </div>
            <div>
              <h3 className="text-xl font-black italic tracking-tighter text-white uppercase">{user.name}</h3>
              <div className="flex gap-2 mt-1">
                <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 text-[9px] font-black rounded-md border border-purple-500/30 tracking-widest uppercase">
                  {user.rank}
                </span>
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-black rounded-md border border-yellow-500/30 tracking-widest uppercase">
                  TOP 5%
                </span>
              </div>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-xl transition-colors text-gray-500 hover:text-white">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 핵심 스탯 */}
        <div className="grid grid-cols-3 gap-1 bg-white/5 rounded-2xl p-4 border border-white/5">
          {[
            { label: "Wins", val: user.wins, color: "text-purple-400" },
            { label: "Losses", val: user.losses, color: "text-gray-500" },
            { label: "Rate", val: `${winRate}%`, color: "text-pink-400" }
          ].map((stat, idx) => (
            <div key={idx} className={`text-center ${idx !== 2 ? 'border-r border-white/5' : ''}`}>
              <p className="text-[9px] font-black text-gray-600 uppercase tracking-tighter mb-1">{stat.label}</p>
              <p className={`text-lg font-black italic ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>

        {/* 승률 바 */}
        <div className="space-y-2 px-1">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1.5 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <Target className="w-3 h-3" /> Win Probability
            </span>
            <span className="text-xs font-black italic text-pink-500">{winRate}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 to-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] transition-all duration-1000"
              style={{ width: `${winRate}%` }}
            />
          </div>
        </div>

        {/* 리스트 정보 */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase leading-none mb-1">Current Streak</p>
                <p className="text-sm font-bold text-gray-300 italic">{user.attendanceDays} Days Party</p>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="flex items-center justify-between group cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-600 uppercase leading-none mb-1">Member Since</p>
                <p className="text-sm font-bold text-gray-300 italic">2026.02.10</p>
              </div>
            </div>
          </div>
        </div>

        <button className="w-full py-3 text-[10px] font-black text-gray-500 hover:text-white border border-white/5 hover:border-white/20 rounded-xl transition-all uppercase tracking-[0.2em] flex items-center justify-center gap-2 group">
          View Detailed Stats
          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

export default UserProfileCard;