import {
  Settings,
  Trophy,
  MessageSquare,
  Gamepad2,
  Heart,
  LogOut,
  ChevronRight,
  Clock,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  Lock,
  AlertCircle,
} from "lucide-react";
import Header from "../components/Header";
import { useAuthInit } from "../hooks/useAuthInit";
import { useState, useEffect } from "react";

const MyPage = () => {
  const { user, setUser } = useAuthInit();

  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const checkGamingStatus = () => {
      const status = sessionStorage.getItem("isPlaying") === "true";
      setIsPlaying(status);
    };

    checkGamingStatus();

    // 다른 탭이나 창에서 세션이 변경될 때를 대비한 리스너
    window.addEventListener("storage", checkGamingStatus);
    return () => window.removeEventListener("storage", checkGamingStatus);
  }, []);

  // UserProfileCard의 승률 계산 로직 적용
  const totalGames = (user?.wins ?? 0) + (user?.losses ?? 0);
  const winRate =
    totalGames > 0 ? Math.round((user?.wins ?? 0 / totalGames) * 100) : 0;

  const USER_STATS = [
    {
      label: "참여 게임",
      value: totalGames,
      icon: <Gamepad2 className="w-5 h-5" />,
      color: "text-purple-400",
    },
    {
      label: "승리 횟수",
      value: user?.wins ?? 0,
      icon: <Trophy className="w-5 h-5" />,
      color: "text-yellow-400",
    },
    {
      label: "작성 글",
      value: "15",
      icon: <MessageSquare className="w-5 h-5" />,
      color: "text-blue-400",
    },
    {
      label: "받은 좋아요",
      value: "256",
      icon: <Heart className="w-5 h-5" />,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      <div className="absolute w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[150px] -top-48 -right-24 animate-pulse"></div>
      <div
        className="absolute w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[130px] bottom-0 -left-24 animate-pulse"
        style={{ animationDelay: "1.5s" }}
      ></div>

      <Header user={user} setUser={setUser} />

      <main className="relative pt-32 pb-20 px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          {/* 상단 타이틀 */}
          <div className="flex items-end justify-between mb-12">
            <div>
              <h1 className="text-5xl font-black italic tracking-tighter mb-2 font-display">
                MY STUDIO
              </h1>
              <p className="text-gray-500 font-medium font-sans">
                내 활동 기록과 상세 전적을 확인하세요.
              </p>
            </div>
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <Settings className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 왼쪽: 프로필 및 상세 정보 카드 */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 overflow-hidden sticky top-32 shadow-2xl">
                {/* UserProfileCard의 상단 그라데이션 재현 */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8 flex flex-col items-center">
                  <div className="relative mb-4 group">
                    <div className="w-32 h-32 rounded-[2rem] ring-4 ring-white/20 shadow-2xl overflow-hidden bg-[#1a1a1a]">
                      <img
                        src={user?.avatar}
                        alt={user?.nickname}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-black p-2 rounded-xl shadow-lg">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {user?.nickname}
                  </h2>
                  <div className="flex gap-2 mt-2">
                    <span className="px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest leading-none flex items-center">
                      {user?.rank ?? "DIAMOND IV"}
                    </span>
                    <span className="px-3 py-1 bg-yellow-400 text-black rounded-lg text-[10px] font-black uppercase leading-none flex items-center">
                      TOP 5%
                    </span>
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* 스트릭 & 가입일 정보 (UserProfileCard 스타일) */}
                  <div className="space-y-3">
                    <div className="relative group">
                      <button
                        disabled={isPlaying}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2
                          ${
                            isPlaying
                              ? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5 shadow-inner"
                              : "bg-white/5 border border-white/10 hover:bg-white/10 text-white shadow-lg active:scale-95"
                          }`}
                        onClick={() => {
                          if (!isPlaying) {
                            // TODO: 프로필 수정 모달 오픈 로직
                            console.log("프로필 수정 오픈");
                          }
                        }}
                      >
                        {isPlaying ? (
                          <>
                            <Lock className="w-4 h-4 text-orange-500" />
                            <span>게임 중 수정 불가</span>
                          </>
                        ) : (
                          "프로필 수정"
                        )}
                      </button>

                      {/* 게임 중일 때 보여주는 경고 툴팁 */}
                      {isPlaying && (
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-orange-500 text-black text-[11px] font-black rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-[0_0_20px_rgba(249,115,22,0.4)]">
                          <div className="relative flex items-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            플레이 중에는 정보를 바꿀 수 없어요!
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 border-8 border-transparent border-t-orange-500"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    <button className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                      <LogOut className="w-4 h-4" /> 로그아웃
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 상세 통계 및 활동 */}
            <div className="lg:col-span-8 space-y-8">
              {/* 통계 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {USER_STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-[#121212] border border-white/10 rounded-3xl p-6 transition-transform hover:-translate-y-1"
                  >
                    <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                    <div className="text-2xl font-black leading-none">
                      {stat.value}
                    </div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-widest">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* 승률 분석 (UserProfileCard의 프로그레스 바) */}
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold flex items-center gap-2 italic">
                    <Target className="w-5 h-5 text-secondary text-pink-500" />{" "}
                    WIN RATE ANALYSIS
                  </h3>
                  <div className="text-2xl font-black text-pink-500 italic">
                    {winRate}%
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <span>Losses: {user?.losses ?? 42}</span>
                    <span>Wins: {user?.wins ?? 128}</span>
                  </div>
                </div>
              </div>

              {/* 최근 활동 섹션 */}
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 italic">
                  <Clock className="w-5 h-5 text-purple-500" /> RECENT ACTIVITY
                </h3>
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group cursor-pointer"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl">
                        🎮
                      </div>
                      <div className="flex-1">
                        <p className="font-bold group-hover:text-purple-400 transition-colors">
                          스피드 퀴즈 우승!
                        </p>
                        <p className="text-xs text-gray-500">
                          2026.02.21 • 랭크 포인트 +15
                        </p>
                      </div>
                      <div className="text-purple-400 font-black italic">
                        +15pt
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-6 py-4 text-xs font-bold text-gray-500 hover:text-white transition-all border-t border-white/5 flex items-center justify-center gap-2 group">
                  SHOW ALL ACTIVITIES{" "}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* 내가 작성한 게시글 섹션 */}
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 italic">
                    <MessageSquare className="w-5 h-5 text-blue-400" /> MY POSTS
                  </h3>
                  <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {[1, 2, 3].map((_, i) => (
                    <div
                      key={i}
                      className="group flex items-center justify-between p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all cursor-pointer"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
                          Free Board
                        </span>
                        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors">
                          오늘 스피드 퀴즈 같이 하실 분 구함! ({i + 2})
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 uppercase">
                            2026.02.21
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-500 fill-pink-500/20" />{" "}
                            {i * 5 + 3}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-purple-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MyPage;
