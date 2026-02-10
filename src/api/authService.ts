import axiosInstance from "./axios";
import type { GuestLoginResponse, RegisteredUser } from "../types/auth";

export const loginAsGuest = async (): Promise<GuestLoginResponse> => {
  const response = await axiosInstance.post<GuestLoginResponse>(
    "/auth/guest",
    {},
  );
  return response.data;
};

export const getUserInfo = async (): Promise<RegisteredUser> => {
  const response = await axiosInstance.get<RegisteredUser>("/users/me");
  return response.data;
};

// 정식 로그인 (OAuth 사용자)
export const handleRegisteredUserLogin = (
  accessToken: string,
  refreshToken: string,
): void => {
  // 게스트 정보 제거
  localStorage.clear();

  // 새로운 토큰 저장
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

// 게스트 로그인
export const handleGuestLogin = (data: GuestLoginResponse): void => {
  localStorage.setItem("isGuest", "true");
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("guestInfo", JSON.stringify(data));
};

export const logout = async (): Promise<void> => {
  localStorage.clear();
  window.location.href = "/";
};
