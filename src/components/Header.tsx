import { LogIn, LogOut, User, Gamepad2 } from "lucide-react";
import { useState } from "react";
import LoginModal from "./common/LoginModal";

export function Header() {
  // const [user, setUser] = useState<{ name: string; avatar: string } | null>(
  //   null,
  // );
  const [user, setUser] = useState<{ name: string; avatar: string } | null>({
    name: "김철수",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chulsoo",
  });
  const logout = () => setUser(null);

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header className="navbar bg-base-100/80 backdrop-blur-md border-b border-base-200 fixed top-0 z-50 px-4 md:px-8">
        {/* 로고 영역 */}
        <div className="navbar-start">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight hidden sm:block">
              채티
            </h1>
          </div>
        </div>

        {/* 메뉴 영역 (데스크톱) */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            <li>
              <a className="rounded-lg font-medium">채팅방</a>
            </li>
            <li>
              <a className="rounded-lg font-medium">게시판</a>
            </li>
            <li>
              <a className="rounded-lg font-medium">랭킹</a>
            </li>
          </ul>
        </div>

        {/* 사용자 액션 영역 */}
        <div className="navbar-end gap-2">
          {user ? (
            <div className="flex items-center gap-3">
              {/* 프로필 버튼 */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="btn btn-ghost btn-md rounded-xl flex items-center gap-2 px-2"
              >
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src={user.avatar} alt={user.name} />
                  </div>
                </div>
                <span className="hidden md:inline font-semibold">
                  {user.name}
                </span>
              </button>

              {/* 로그아웃 버튼 */}
              <button
                onClick={logout}
                className="btn btn-error btn-outline btn-sm md:btn-md rounded-xl gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">로그아웃</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="btn btn-primary btn-md rounded-xl shadow-md gap-2 px-6"
            >
              <LogIn className="w-4 h-4" />
              로그인
            </button>
          )}
        </div>
      </header>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}
