import { useState, useEffect, useRef } from "react";
import { loginAsGuest, getUserInfo } from "../api/authService";
import type { GuestLoginResponse, User } from "../types/auth";

export const useAuthInit = () => {
  const [user, setUser] = useState<User | GuestLoginResponse | null>(null);
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

          // 구글 로그인 성공 후 사용자 정보 조회
          try {
            const userData = await getUserInfo();
            setUser(userData);
            console.log("사용자 정보 조회 성공:", userData.nickname);
          } catch (error) {
            console.error("사용자 정보 조회 실패:", error);
          }
          setIsLoading(false);
          return;
        }

        // 2. 기존 토큰이 이미 있는 경우 (새로고침 등)
        if (localStorage.getItem("accessToken")) {
          // 게스트가 아닌 경우만 사용자 정보 조회
          if (localStorage.getItem("isGuest") !== "true") {
            try {
              const userData = await getUserInfo();
              setUser(userData);
              console.log("저장된 토큰으로 사용자 정보 조회:", userData.nickname);
            } catch (error) {
              console.error("토큰이 유효하지 않음:", error);
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
            }
          }
          setIsLoading(false);
          return;
        }

        // 3. 토큰이 아예 없는 경우 게스트 로그인 진행
        localStorage.setItem("isGuest", "true");
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

  return { user, isLoading, setUser };
};
