import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import GameRoomsView from "./pages/GameRoomsView";
import { useAuthInit } from "./hooks/useAuthInit";
import GameWaitingRoom from "./pages/GameWaitingRoom";
import LiarGameRoom from "./pages/LiarGameRoom";
import { SocketProvider } from "./context/SocketProvider";
import JustChatRoom from "./pages/JustChatRoom";
import GameLayout from "./layouts/GameLayout";

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
        {/* 소켓이 필요 없는 메인 페이지 */}
        <Route path="/" element={<Home />} />

        {/* 소켓이 필요한 게임 관련 페이지들 */}
        <Route
          element={
            <SocketProvider user={user}>
              <GameLayout />
            </SocketProvider>
          }
        >
          <Route path="/rooms" element={<GameRoomsView />} />
          <Route path="/waiting/:roomId" element={<GameWaitingRoom />} />
          <Route path="/game/liar/:roomId" element={<LiarGameRoom />} />
          <Route path="/chat/:roomId" element={<JustChatRoom />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
