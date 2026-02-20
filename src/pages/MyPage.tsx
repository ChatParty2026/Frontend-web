import {
  Settings,
  Trophy,
  MessageSquare,
  Gamepad2,
  Heart,
  LogOut,
  ChevronRight,
  Clock,
} from "lucide-react";
import Header from "../components/Header";
import { useAuthInit } from "../hooks/useAuthInit";

const USER_STATS = [
  {
    label: "참여 게임",
    value: "128",
    icon: <Gamepad2 className="w-5 h-5" />,
    color: "text-purple-400",
  },
  {
    label: "승리 횟수",
    value: "42",
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

const MyPage = () => {
  const { user, setUser } = useAuthInit();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* 배경 글로우 */}
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
                내 활동 기록과 프로필을 관리하세요.
              </p>
            </div>
            <button className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group">
              <Settings className="w-6 h-6 text-gray-400 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* 왼쪽: 프로필 카드 */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8 relative overflow-hidden sticky top-32">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500"></div>
                <div className="flex flex-col items-center text-center mt-4">
                  <div className="relative mb-6">
                    <div className="w-32 h-32 rounded-[2rem] bg-gradient-to-tr from-purple-500 to-pink-500 p-1 shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                      <div className="w-full h-full rounded-[1.8rem] bg-[#1a1a1a] flex items-center justify-center text-5xl overflow-hidden">
                        {user?.profileImage || "👤"}
                      </div>
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold mb-1">
                    {user?.nickname || "Guest"}
                  </h2>
                  <p className="text-purple-400 text-sm font-semibold mb-6 uppercase tracking-widest">
                    Pro Gamer
                  </p>
                  <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 font-bold hover:bg-white/10 transition-colors mb-3">
                    프로필 수정
                  </button>
                  <button className="w-full py-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-bold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                    <LogOut className="w-4 h-4" /> 로그아웃
                  </button>
                </div>
              </div>
            </div>

            {/* 오른쪽: 콘텐츠 영역 */}
            <div className="lg:col-span-8 space-y-8">
              {/* 통계 그리드 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {USER_STATS.map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6 transition-transform hover:-translate-y-1 backdrop-blur-sm"
                  >
                    <div className={`${stat.color} mb-3`}>{stat.icon}</div>
                    <div className="text-2xl font-black">{stat.value}</div>
                    <div className="text-[10px] text-gray-500 font-bold uppercase mt-1 tracking-tighter">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

{/* 최근 활동 섹션 */}
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2 italic">
                  <Clock className="w-5 h-5 text-purple-500" /> RECENT ACTIVITY
                </h3>
                <div className="space-y-4">
                  {[1, 2].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                        🎮
                      </div>
                      <div className="flex-1">
                        <p className="font-bold group-hover:text-purple-400 transition-colors">스피드 퀴즈 우승!</p>
                        <p className="text-xs text-gray-500">2026.02.21 • 랭크 포인트 +15</p>
                      </div>
                      <div className="text-purple-400 font-black italic">+15pt</div>
                    </div>
                  ))}
                </div>
                
                {/* 추가된 SHOW ALL 버튼 */}
                <button className="w-full mt-6 py-4 text-xs font-bold text-gray-500 hover:text-white transition-all border-t border-white/5 flex items-center justify-center gap-2 group">
                  SHOW ALL ACTIVITIES
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* 내가 작성한 게시글 섹션 */}
              <div className="bg-[#121212] rounded-[2.5rem] border border-white/10 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 italic">
                    <MessageSquare className="w-5 h-5 text-blue-400" /> MY POSTS
                  </h3>
                  <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors">
                    VIEW ALL
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
                        <h4 className="font-bold text-gray-200 group-hover:text-white transition-colors line-clamp-1">
                          오늘 스피드 퀴즈 같이 하실 분 구함! ({i + 2})
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] text-gray-500 uppercase">
                            2026.02.21
                          </span>
                          <span className="text-[10px] text-gray-500 flex items-center gap-1">
                            <Heart className="w-3 h-3 text-pink-500" />{" "}
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
