import {
  Trophy,
  Flame,
  Target,
  TrendingUp,
  Calendar,
  Settings,
  UserCircle,
  LogIn,
} from "lucide-react";

import { useState } from "react";
import type { AuthUser } from "../types/auth";
import LoginModal from "./common/LoginModal";

const UserProfileCard = ({ user }: { user: AuthUser | null }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  const cardClass =
    "card bg-base-100 shadow-sm border border-base-200 overflow-hidden h-full flex flex-col";

  // --- 게스트 모드 UI ---
  if (!user || user.role === "GUEST") {
    return (
      <div data-theme="dark" className={cardClass}>
        {/* 게스트 상단 영역: 연필 아이콘 삭제 및 단순 텍스트 표시 */}
        <div className="bg-base-300 p-6 flex items-center gap-4 shrink-0">
          <div className="avatar">
            <div className="w-16 h-16 rounded-2xl bg-base-100 flex items-center justify-center text-base-content/20 shadow-inner">
              <UserCircle className="w-10 h-10" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold truncate text-base-content/70">
                {user?.nickname || "GUEST"}
              </h3>
            </div>
            <p className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
              Guest Mode
            </p>
          </div>
        </div>

        {/* 게스트 바디 영역 */}
        <div className="card-body p-6 text-center space-y-4 flex-1 flex flex-col justify-center">
          <div className="flex h-full items-center">
            <p className="text-sm text-base-content/70 leading-relaxed ">
              로그인을 하시면 더 다양한 기능과 <br />
              <strong>나만의 아바타 정하기</strong> 등이 가능합니다. 🎮
            </p>
          </div>

          <button
            onClick={() => setShowLoginModal(true)}
            className="btn btn-primary btn-block rounded-xl shadow-md gap-2"
          >
            <LogIn className="w-4 h-4" />
            지금 로그인하기
          </button>

          <div className="divider text-[10px] opacity-50 uppercase font-black tracking-widest">
            Welcome to CParty
          </div>

          <div className="grid grid-cols-2 gap-3 opacity-50">
            <div className="flex flex-col items-center p-2 bg-base-200 rounded-lg">
              <Trophy className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold">전적 관리</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-base-200 rounded-lg">
              <Flame className="w-4 h-4 mb-1" />
              <span className="text-[10px] font-bold">출석 보상</span>
            </div>
          </div>
        </div>

        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
        />
      </div>
    );
  }

  // --- 로그인 유저용 데이터 계산 ---
  const totalGames = user.wins + user.losses;
  const winRate =
    totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  return (
    <div data-theme="dark" className={cardClass}>
      {/* 상단 프로필 요약: 설정 아이콘 회전 애니메이션 적용 */}
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="avatar">
              <div className="w-16 h-16 rounded-2xl ring-4 ring-white/20 shadow-2xl overflow-hidden bg-gray-800">
                <img 
                  src={user.avatar} 
                  alt={user.nickname} 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.nickname}`;
                  }}
                />
              </div>
            </div>
            <div className="text-white">
              <h3 className="text-xl font-bold">{user.nickname}</h3>
              <div className="flex gap-2 mt-1">
                <span className="badge badge-sm bg-white/20 border-none text-white font-bold uppercase">
                  {user.rank ?? "DIAMOND IV"}
                </span>
                <span className="badge badge-sm badge-warning font-bold">
                  TOP 5%
                </span>
              </div>
            </div>
          </div>
          
          {/* 마이페이지 링크 버튼: 설정 아이콘 회전 효과 */}
          <button
            onClick={() => (window.location.href = "/mypage")}
            className="btn btn-circle btn-sm bg-white/10 border-none text-white hover:bg-white/20 group transition-all"
            title="마이페이지"
          >
            <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300 ease-in-out" />
          </button>
        </div>
      </div>

      <div className="card-body p-5 space-y-6 flex-1">
        {/* 핵심 스탯 */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-[10px] font-black opacity-40 uppercase text-white">
              Wins
            </div>
            <div className="text-lg font-bold text-primary">
              {user.wins ?? 0}
            </div>
          </div>
          <div className="text-center border-x border-base-200">
            <div className="text-[10px] font-black opacity-40 uppercase text-white">
              Losses
            </div>
            <div className="text-lg font-bold text-white">{user.losses ?? 0}</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-black opacity-40 uppercase text-white">
              Win Rate
            </div>
            <div className="text-lg font-bold text-secondary">{winRate}%</div>
          </div>
        </div>

        {/* 승률 게이지 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-white">
            <span className="flex items-center gap-1 opacity-70">
              <Target className="w-3 h-3" /> 승률
            </span>
            <span className="text-secondary">{winRate}%</span>
          </div>
          <progress
            className="progress progress-secondary w-full h-2"
            value={winRate}
            max="100"
          ></progress>
        </div>

        <div className="divider my-0 opacity-50"></div>

        {/* 출석 및 기타 정보 */}
        <div className="space-y-3 text-white">
          <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:scale-110 transition-transform">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-40 leading-none">
                  STREAK
                </p>
                <p className="text-sm font-bold">
                  {user.attendanceStreak ?? 0}일 연속 출석
                </p>
              </div>
            </div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>

          <div className="flex items-center justify-between group cursor-default">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg group-hover:scale-110 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[10px] font-bold opacity-40 leading-none">
                  JOINED
                </p>
                <p className="text-sm font-bold">{user.joinedAt || "2024.01.27"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto">
          <button 
            onClick={() => (window.location.href = "/mypage")}
            className="btn btn-outline btn-sm w-full mt-2 rounded-xl text-white hover:bg-white/10"
          >
            전적 상세 보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;