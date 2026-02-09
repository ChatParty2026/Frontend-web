import { Gamepad2, Users, MessageCircle, Zap } from "lucide-react";
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
  },
  {
    id: 2,
    title: "그림 맞추기",
    description: "그림을 보고 단어를 맞춰보세요",
    icon: "🎨",
    color: "from-pink-400 to-purple-500",
  },
  {
    id: 3,
    title: "초성 퀴즈",
    description: "초성만 보고 정답을 맞춰보세요",
    icon: "📝",
    color: "from-blue-400 to-cyan-500",
  },
  {
    id: 4,
    title: "스무고개",
    description: "질문을 통해 정답을 찾아보세요",
    icon: "❓",
    color: "from-green-400 to-emerald-500",
  },
];

const Home = ({ user }) => {
  const handlePlayClick = () => {
    window.open("/rooms", "gameRooms", "width=1200,height=800");
  };

  return (
    <div className="min-h-screen bg-base-200">
      {" "}
      {/* DaisyUI 배경색 활용 */}
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-7xl">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              실시간 채팅으로 즐기는 게임
            </h1>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              친구들과 함께 채팅하며 다양한 게임을 즐겨보세요!{" "}
              <br className="hidden md:block" />
              복잡한 설치 없이 브라우저에서 바로 시작합니다.
            </p>
            <button
              onClick={handlePlayClick}
              className="btn btn-primary btn-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              <Gamepad2 className="w-6 h-6" />
              지금 바로 게임하기
            </button>
          </div>

          {/* Featured Games Grid */}
          <section className="mb-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">인기 게임 🎮</h2>
              <button className="btn btn-ghost btn-sm">전체보기</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED_GAMES.map((game) => (
                <div
                  key={game.id}
                  className="card bg-base-100 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
                  onClick={handlePlayClick}
                >
                  <div className="card-body">
                    <div
                      className={`w-14 h-14 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:rotate-12 transition-transform`}
                    >
                      {game.icon}
                    </div>
                    <h3 className="card-title">{game.title}</h3>
                    <p className="text-sm text-base-content/60">
                      {game.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Section: Board & Chat */}
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            {/* 왼쪽: 게시판 */}
            <div className="lg:col-span-7">
              <Board />
            </div>

            {/* 오른쪽: 프로필 & 채팅 (Sticky 처리) */}
            <div className="lg:col-span-5 sticky top-24 space-y-6">
              <UserProfileCard />
              {/* <UserProfileCard
                user={{
                  name: "김철수",
                  avatar:
                    "https://api.dicebear.com/7.x/avataaars/svg?seed=Chulsoo",
                  wins: 42,
                  losses: 18,
                  attendanceDays: 7,
                  rank: "Diamond",
                }}
              /> */}
              <LiveChat />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
