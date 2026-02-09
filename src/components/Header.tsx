import { LogIn, LogOut, Gamepad2, ChevronDown } from "lucide-react";
import { useState } from "react";
import LoginModal from "./common/LoginModal";

const Header = () => {
    // const [user, setUser] = useState<{ name: string; avatar: string } | null>(
  //   null,
  // );
  const [user, setUser] = useState<{ name: string; avatar: string } | null>({
    name: "김철수",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chulsoo",
  });

  const [showLoginModal, setShowLoginModal] = useState(false);

  const logout = () => setUser(null);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4">
        {/* 플로팅 글래스모피즘 바 */}
        <div className="w-full max-w-7xl h-20 bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] px-6 md:px-10 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          {/* 1. 로고 영역 */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] group-hover:rotate-6 transition-transform">
              <Gamepad2 className="w-7 h-7" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-black italic tracking-tighter text-white">
                CHATTY
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] text-purple-400">
                PARTY
              </span>
            </div>
          </div>

          {/* 2. 네비게이션 메뉴 (중앙) */}
          <nav className="hidden lg:flex items-center gap-8">
            {["채팅방", "게시판", "랭킹"].map((item) => (
              <a
                key={item}
                href={`#${item}`}
                className="text-sm font-bold text-gray-400 hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          {/* 3. 사용자 액션 영역 */}
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                {/* 프로필 정보 */}
                <div className="flex items-center gap-3 bg-white/5 p-1 pr-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer">
                  <div className="avatar">
                    <div className="w-10 h-10 rounded-xl ring-2 ring-purple-500/50">
                      <img src={user.avatar} alt={user.name} />
                    </div>
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <span className="text-xs text-gray-400">Welcome</span>
                    <span className="text-sm font-bold text-white uppercase italic">
                      {user.name}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </div>

                {/* 로그아웃 버튼 */}
                <button
                  onClick={logout}
                  className="p-3 text-gray-400 hover:text-pink-500 hover:bg-pink-500/10 rounded-xl transition-all"
                  title="로그아웃"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginModal(true)}
                className="btn border-none bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white rounded-2xl px-8 h-12 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105 active:scale-95"
              >
                <LogIn className="w-4 h-4 mr-2" />
                <span className="font-bold italic">LOGIN</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default Header;
