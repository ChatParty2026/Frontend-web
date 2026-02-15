import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LiveChat from "../components/LiveChat";
import { useAuthInit } from "../hooks/useAuthInit";

const GameLayout = () => {
  const { user } = useAuthInit();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const location = useLocation();

  // 로비(/rooms) 인지 확인
  const isLobby = location.pathname === "/rooms";

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <main
        className={`transition-all duration-500 ease-in-out ${
          isLobby && isChatOpen ? "pr-[30%] xl:pr-[25%]" : "pr-0"
        }`}
      >
        <Outlet />
      </main>

      {/* 라이브 채팅 섹션 (고정형) */}
      <aside
        className={`fixed top-8 bottom-8 transition-all duration-500 ease-in-out z-50 ${
          isChatOpen
            ? "right-0 w-[85%] md:w-[30%] xl:w-[25%]"
            : "right-[-85%] md:right-[-30%] xl:right-[-25%] w-[85%] md:w-[30%] xl:w-[25%]"
        }`}
      >
        <div className="h-full rounded-l-[2.5rem] border border-white/10 bg-[#121212]/95 backdrop-blur-xl shadow-2xl overflow-visible">
          <LiveChat
            user={user}
            isOpen={isChatOpen}
            onToggle={() => setIsChatOpen(!isChatOpen)}
          />
        </div>
      </aside>
    </div>
  );
};

export default GameLayout;
