import { useState, useEffect, useRef } from "react";
import {
  loginAsGuest,
  getUserInfo,
  handleRegisteredUserLogin,
  handleGuestLogin,
  normalizeUser,
} from "../api/authService";
import type { AuthUser } from "../types/auth";

export const useAuthInit = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasExecuted = useRef(false);

  useEffect(() => {
    if (hasExecuted.current) return;
    hasExecuted.current = true;

    const initAuth = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams(window.location.search);
        const googleAccessToken = params.get("accessToken");

        // 1. OAuth2 콜백 케이스
        if (googleAccessToken) {
          handleRegisteredUserLogin(googleAccessToken, params.get("refreshToken") || "");
          window.history.replaceState({}, document.title, "/");
          const userData = await getUserInfo();
          setUser(normalizeUser(userData)); // 세탁 후 저장
          return;
        }

        // 2. 기존 토큰이 있는 경우
        const accessToken = localStorage.getItem("accessToken");
        if (accessToken) {
          const isGuestMode = localStorage.getItem("isGuest") === "true";
          
          try {
            const userData = await getUserInfo();
            const normalized = normalizeUser(userData);
            setUser(normalized);

            // 유저가 정식 계정이라면 게스트 정보 정리
            if (normalized.role === "USER") {
              localStorage.removeItem("isGuest");
              localStorage.removeItem("guestInfo");
            }
          } catch (error) {
            // 서버 정보 조회 실패 시 로컬 스토리지 백업 사용
            const savedGuest = localStorage.getItem("guestInfo");
            if (savedGuest) {
              setUser(JSON.parse(savedGuest));
            } else {
              localStorage.clear();
            }
          }
          return;
        }

        // 3. 토큰이 없는 완전 신규 방문 (게스트 자동 로그인)
        const data = await loginAsGuest();
        const guestUser = handleGuestLogin(data);
        setUser(guestUser);

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