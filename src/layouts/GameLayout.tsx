import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LiveChat from "../components/LiveChat";
import { useAuthInit } from "../hooks/useAuthInit";

const GameLayout = () => {
  const { user } = useAuthInit();
  const location = useLocation();

  const [isChatOpen, setIsChatOpen] = useState(true);
  const [prevPath, setPrevPath] = useState(location.pathname);

  // ✨ 렌더링 도중 경로 변경 감지 및 상태 업데이트 (useEffect 없이)
  if (location.pathname !== prevPath) {
    setPrevPath(location.pathname); // 현재 경로 업데이트

    const isNowLobby = location.pathname === "/rooms";
    console.log(isNowLobby);
    // 로비로 들어왔을 때는 무조건 열기
    if (isNowLobby) {
      setIsChatOpen(true);
    }
    // 로비에서 나갈 때는 무조건 닫기
    else {
      setIsChatOpen(false);
    }
  }

  const handleToggle = () => setIsChatOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden">
      {/* ✨ [배경 효과 추가] */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* 왼쪽 상단: 정적인 보라빛 */}
        <div className="absolute w-[800px] h-[800px] bg-purple-600/[0.05] rounded-full blur-[150px] -top-[200px] -left-[200px]" />

        {/* 우측 하단: 일렁이는 분홍빛 (채팅창 쪽 분위기) */}
        <div
          className="absolute w-[600px] h-[600px] bg-pink-600/[0.1] rounded-full blur-[130px] bottom-[-100px] right-[-100px] animate-pulse"
          style={{ animationDuration: "4s" }}
        />
      </div>

      {/* 메인 콘텐츠 영역 - z-10을 주어 배경 위로 올림 */}
      <main
        className={`relative z-10 transition-all duration-500 ease-in-out ${
          isChatOpen ? "pr-[85%] md:pr-[30%] xl:pr-[25%]" : "pr-0"
        }`}
      >
        <Outlet />
      </main>

      <aside
        className={`fixed top-8 bottom-8 transition-all duration-500 ease-in-out z-50 ${
          isChatOpen
            ? "right-0 w-[85%] md:w-[30%] xl:w-[25%]"
            : "right-[-85%] md:right-[-30%] xl:right-[-25%] w-[85%] md:w-[30%] xl:w-[25%]"
        }`}
      >
        <div className="h-full rounded-l-[2.5rem] border border-white/10 bg-[#121212]/95 backdrop-blur-xl shadow-2xl overflow-visible">
          <LiveChat user={user} isOpen={isChatOpen} onToggle={handleToggle} />
        </div>
      </aside>
    </div>
  );
};

export default GameLayout;
