import { useState, useEffect, useRef } from "react";
import { loginAsGuest } from "../api/authService";
import type { GuestLoginResponse } from "../types/auth";

export const useAuthInit = () => {
  const [user, setUser] = useState<GuestLoginResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const initAuth = async () => {
      try {
        setIsLoading(true);

        // 1. URL 파라미터 체크 (OAuth2 콜백 케이스)
        const params = new URLSearchParams(window.location.search);
        const googleAccessToken = params.get("accessToken");
        const googleRefreshToken = params.get("refreshToken");

        if (googleAccessToken) {
          localStorage.setItem("accessToken", googleAccessToken);
          if (googleRefreshToken)
            localStorage.setItem("refreshToken", googleRefreshToken);

          // 파라미터 제거 (주소창 정리)
          window.history.replaceState(
            {},
            document.title,
            window.location.pathname,
          );

          // 소셜 로그인 성공 시에는 유저 정보를 받아오는 추가 API 호출이 필요할 수 있습니다.
          // 여기서는 일단 로딩만 끄고 종료합니다.
          setIsLoading(false);
          return;
        }

        // 2. 기존 토큰이 이미 있는 경우 (새로고침 등)
        if (localStorage.getItem("accessToken")) {
          setIsLoading(false);
          return;
        }

        // 3. 토큰이 아예 없는 경우 게스트 로그인 진행
        const data = await loginAsGuest();
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        setUser(data);
        console.log("게스트 로그인 성공:", data.nickname);
      } catch (error) {
        console.error("인증 초기화 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  return { user, isLoading };
};
