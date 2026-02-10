import { useState, useEffect, useRef } from "react";
import {
  loginAsGuest,
  getUserInfo,
  handleRegisteredUserLogin,
  handleGuestLogin,
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

        // 1. URL 파라미터 체크 (OAuth2 콜백 케이스)
        const params = new URLSearchParams(window.location.search);
        const googleAccessToken = params.get("accessToken");
        const googleRefreshToken = params.get("refreshToken");

        if (googleAccessToken) {
          // 정식 로그인이므로 게스트 정보 제거 및 새로운 토큰 저장
          handleRegisteredUserLogin(
            googleAccessToken,
            googleRefreshToken || "",
          );

          // 파라미터 제거 (주소창 정리)
          window.history.replaceState({}, document.title, "/");

          // 구글 로그인 성공 후 사용자 정보 조회
          try {
            const userData = await getUserInfo();
            setUser(userData);
            console.log("정식 로그인 성공:", userData.nickname);
          } catch (error) {
            console.error("사용자 정보 조회 실패:", error);
          }
          setIsLoading(false);
          return;
        }

        // 2. 기존 토큰이 이미 있는 경우 (새로고침 등)
        if (localStorage.getItem("accessToken")) {
          // 게스트가 아닌 경우 항상 사용자 정보 조회 (게스트→정식 로그인 전환 대비)
          if (localStorage.getItem("isGuest") !== "true") {
            try {
              const userData = await getUserInfo();
              setUser(userData);
            } catch (error) {
              console.error("토큰이 유효하지 않음:", error);
              localStorage.clear();
            }
          } else {
            // 게스트 상태이지만 토큰이 있으면, 서버에서 확인 후 정식 유저인지 확인
            try {
              const userData = await getUserInfo();
              // 정식 유저로 변환됨 (게스트→정식 로그인)
              if (userData.role === "USER") {
                localStorage.removeItem("isGuest");
                localStorage.removeItem("guestInfo");
                setUser(userData);
                console.log(
                  "게스트에서 정식 유저로 업그레이드:",
                  userData.nickname,
                );
              } else {
                // 여전히 게스트인 경우
                const savedGuest = localStorage.getItem("guestInfo");
                if (savedGuest) {
                  setUser(JSON.parse(savedGuest));
                }
              }
            } catch (error) {
              console.error("사용자 정보 조회 실패:", error);
              // 실패 시 저장된 게스트 정보 사용
              const savedGuest = localStorage.getItem("guestInfo");
              if (savedGuest) {
                setUser(JSON.parse(savedGuest));
              }
            }
          }
          setIsLoading(false);
          return;
        }

        // 3. 토큰이 아예 없는 경우 게스트 로그인 진행
        const data = await loginAsGuest();
        handleGuestLogin(data);
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
