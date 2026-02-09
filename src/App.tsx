import Home from "./pages/Home";
import { useEffect, useState, useRef } from "react";
import { loginAsGuest } from "./api/authService";
import type { GuestLoginResponse } from "./types/auth";

const App = () => {
  const [user, setUser] = useState<GuestLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 중복 실행 방지를 위한 Ref 선언
  const hasExecuted = useRef(false);

  useEffect(() => {
    // 2. 이미 실행되었다면 바로 종료
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const initLogin = async () => {
      // 이미 토큰이 있는 경우 로딩만 끄고 종료
      if (localStorage.getItem("accessToken")) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await loginAsGuest();

        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);

        setUser(data);
        console.log("게스트 로그인 성공:", data.nickname);
      } catch (error) {
        console.error("게스트 로그인 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initLogin();
  }, []); // 의존성 배열은 비워둠

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        로딩 중...
      </div>
    );
  }

  return <Home user={user} />;
};

export default App;
