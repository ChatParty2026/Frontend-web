import { Gamepad2 } from "lucide-react";
import Header from "../components/Header";
import Board from "../components/board/Board";
import UserProfileCard from "../components/UserProfileCard";
import { useAuthInit } from "../hooks/useAuthInit";

const FEATURED_GAMES = [
  { id: 1, title: "스피드 퀴즈", description: "빠른 반응 속도로 정답!", icon: "⚡", color: "from-yellow-400 to-orange-500", glow: "shadow-orange-500/20", hoverColor: "bg-orange-600" },
  { id: 2, title: "그림 맞추기", description: "그림 보고 단어 맞추기", icon: "🎨", color: "from-pink-400 to-purple-500", glow: "shadow-pink-500/20", hoverColor: "bg-purple-600" },
  { id: 3, title: "초성 퀴즈", description: "초성만 보고 정답 맞추기", icon: "📝", color: "from-blue-400 to-cyan-500", glow: "shadow-blue-500/20", hoverColor: "bg-blue-600" },
  { id: 4, title: "스무고개", description: "질문으로 정답 찾아내기", icon: "❓", color: "from-green-400 to-emerald-500", glow: "shadow-emerald-500/20", hoverColor: "bg-emerald-600" },
];

const Home = () => {
  const { user, setUser } = useAuthInit();

  const handlePlayClick = () => {
    localStorage.setItem("isPlaying", "true");
    window.open("/rooms", "gameRooms", "width=1200,height=800");
    window.dispatchEvent(new Event("storage"));
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden relative">
      <div className="absolute w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -top-24 -left-24 animate-pulse"></div>
      <div className="absolute w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[130px] top-1/2 -right-24 animate-pulse" style={{ animationDelay: "1s" }}></div>

      <Header user={user} setUser={setUser} />

      <main className="relative pt-32 pb-12 px-4 z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-20 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-medium mb-4 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              현재 1,242명이 채티 중!
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic leading-none">
              LET'S PLAY <br />
              <span className="px-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                CHATTY PARTY
              </span>
            </h1>

            <button
              onClick={handlePlayClick}
              className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white btn-lg rounded-2xl shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] hover:scale-105 transition-all px-10 h-16 group"
            >
              <Gamepad2 className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold">PARTY START</span>
            </button>
          </div>

          {/* Featured Games Section - 높이 축소 버전 */}
          <section id="games" className="mb-20 scroll-mt-28">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black italic tracking-tight text-white">HOT GAMES ⚡</h2>
              <button className="text-xs font-bold text-gray-500 hover:text-white transition-colors uppercase tracking-widest">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {FEATURED_GAMES.map((game) => (
                <div 
                  key={game.id} 
                  className="group relative rounded-3xl border border-white/5 overflow-hidden cursor-pointer bg-[#121212] transition-all"
                  onClick={handlePlayClick}
                >
                  {/* ✅ 사선 슬라이딩 배경 (꽉 채움) */}
                  <div 
                    className={`absolute inset-0 w-[160%] h-full translate-x-[-170%] skew-x-[-20deg] 
                    group-hover:translate-x-[-30%] transition-transform duration-500 ease-out z-0 
                    ${game.hoverColor}`} 
                  />
                  
                  {/* 내부 패딩 축소 (p-8 -> p-6) */}
                  <div className="relative p-6 h-full z-10 flex flex-col justify-between min-h-[180px]">
                    <div>
                      <div className={`w-12 h-12 bg-gradient-to-br ${game.color} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg ${game.glow} group-hover:scale-110 transition-transform duration-500`}>
                        {game.icon}
                      </div>
                      <h3 className="text-lg font-bold mb-1 group-hover:text-white transition-colors">{game.title}</h3>
                      <p className="text-xs text-gray-500 leading-snug group-hover:text-white/80 transition-colors line-clamp-2">{game.description}</p>
                    </div>
                    
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-black tracking-widest text-gray-600 group-hover:text-white transition-colors">
                      <span>GO PARTY</span>
                      <div className="h-px flex-1 bg-current opacity-20"></div>
                      <span className="text-base">→</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community & Profile Layout */}
          <section
            id="community"
            className="grid lg:grid-cols-12 gap-8 mb-20 items-start scroll-mt-28"
          >
            <div className="lg:col-span-8">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="text-2xl font-black italic tracking-tight text-white">COMMUNITY 💬</h2>
                <div className="h-px flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
              </div>
              <div className="bg-white/5 rounded-[2.5rem] border border-white/10 p-2 backdrop-blur-sm overflow-hidden">
                <Board user={user} />
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
              <div className="rounded-[2.5rem] border border-white/10 bg-[#121212] overflow-hidden shadow-2xl">
                <UserProfileCard key={user?.nickname} user={user} />
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;