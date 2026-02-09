import { Gamepad2 } from "lucide-react";
import { Header } from "../components/Header";
import { Board } from "../components/Board";
import { LiveChat } from "../components/LiveChat";
import { UserProfileCard } from "../components/UserProfileCard";

const FEATURED_GAMES = [
  {
    id: 1,
    title: "스피드 퀴즈",
    description: "빠른 반응 속도로 정답을 맞춰보세요!",
    icon: "⚡",
    color: "from-yellow-400 to-orange-500",
    glow: "shadow-orange-500/20",
  },
  {
    id: 2,
    title: "그림 맞추기",
    description: "그림을 보고 단어를 맞춰보세요",
    icon: "🎨",
    color: "from-pink-400 to-purple-500",
    glow: "shadow-pink-500/20",
  },
  {
    id: 3,
    title: "초성 퀴즈",
    description: "초성만 보고 정답을 맞춰보세요",
    icon: "📝",
    color: "from-blue-400 to-cyan-500",
    glow: "shadow-blue-500/20",
  },
  {
    id: 4,
    title: "스무고개",
    description: "질문을 통해 정답을 찾아보세요",
    icon: "❓",
    color: "from-green-400 to-emerald-500",
    glow: "shadow-emerald-500/20",
  },
];

const Home = ({ user }) => {
  const handlePlayClick = () => {
    window.open("/rooms", "gameRooms", "width=1200,height=800");
  };

  return (
    // 배경: 밤처럼 아주 어두운 다크 그레이/블랙
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* 전역 네온 글로우 효과 (모달과 동일한 무드) */}
      <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] -top-24 -left-24 animate-pulse"></div>
      <div
        className="absolute w-[500px] h-[500px] bg-pink-600/10 rounded-full blur-[120px] top-1/2 -right-24 animate-pulse"
        style={{ animationDelay: "1s" }}
      ></div>

      <Header />

      <main className="relative pt-32 pb-12 px-4 z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-24 space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-purple-400 text-sm font-medium mb-4 animate-bounce">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              현재 1,242명이 채티 중!
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter italic">
              LET'S PLAY <br />
              <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(168,85,247,0.5)]">
                CHATTY PARTY
              </span>
            </h1>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto font-medium">
              지루할 틈 없는 실시간 채팅 게임의 세계. <br />
              지금 바로 접속해서 친구들과 밤새도록 즐겨보세요!
            </p>

            <button
              onClick={handlePlayClick}
              className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white btn-lg rounded-2xl shadow-[0_0_40px_-5px_rgba(168,85,247,0.6)] hover:scale-110 transition-all px-10 h-16 group"
            >
              <Gamepad2 className="w-7 h-7 group-hover:rotate-12 transition-transform" />
              <span className="text-xl font-bold">PARTY START</span>
            </button>
          </div>

          {/* Featured Games Grid */}
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-3xl font-black italic tracking-tight">
                HOT GAMES ⚡
              </h2>
              <button className="text-sm font-bold text-gray-500 hover:text-white transition-colors">
                VIEW ALL
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_GAMES.map((game) => (
                <div
                  key={game.id}
                  className="group relative rounded-[2rem] p-px bg-gradient-to-b from-white/20 to-transparent hover:from-purple-500/50 transition-all cursor-pointer"
                  onClick={handlePlayClick}
                >
                  <div className="bg-[#121212] rounded-[2rem] p-8 h-full transition-transform group-hover:-translate-y-2">
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg ${game.glow} group-hover:scale-110 transition-transform`}
                    >
                      {game.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                      {game.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {game.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Section */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* 왼쪽: 게시판 (다크 테마에 맞춰 투명도 조절) */}
            <div className="lg:col-span-7 bg-white/5 rounded-[2.5rem] border border-white/10 p-2 backdrop-blur-sm">
              <Board />
            </div>

            {/* 오른쪽: 프로필 & 채팅 */}
            <div className="lg:col-span-5 sticky top-28 space-y-6">
              <div className="rounded-[2.5rem] border border-white/10 bg-[#121212] p-2 shadow-2xl">
                <UserProfileCard />
              </div>
              <div className="rounded-[2.5rem] border border-white/10 bg-[#121212] overflow-hidden shadow-2xl">
                <LiveChat />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
