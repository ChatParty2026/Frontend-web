import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import GameRoomsView from "./pages/GameRoomsView";
import { useAuthInit } from "./hooks/useAuthInit";
import GameWaitingRoom from "./pages/GameWaitingRoom";

const App = () => {
  const { user, isLoading } = useAuthInit();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a] text-white font-bold italic tracking-tighter">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          LOADING PARTY...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 메인 페이지 */}
        <Route path="/" element={<Home />} />

        {/* 방 목록 페이지 (새 창으로 열릴 곳) */}
        <Route path="/rooms" element={<GameRoomsView />} />
        {/* 대기실 */}
        <Route path="/waiting/:roomId" element={<GameWaitingRoom />} />

        {/* 정의되지 않은 경로 접근 시 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
