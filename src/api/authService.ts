import axiosInstance from "./axios";
import type { GuestLoginResponse, RegisteredUser, AuthUser, GuestUser } from "../types/auth";

// [추가] 서버 데이터를 프론트엔드 AuthUser 타입으로 변환하는 함수
export const normalizeUser = (data: any): AuthUser => {
  // role이나 isGuest가 "GUEST"인 경우를 판단
  const isGuest = data.isGuest ?? (data.role === "GUEST");

  if (isGuest) {
    return {
      nickname: data.nickname,
      role: "GUEST",
      avatar: data.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.nickname}`,
      isGuest: true,
      guestId: data.guestId,
    } as GuestUser;
  }

  // RegisteredUser 규격으로 반환
  return {
    nickname: data.nickname,
    role: "USER",
    avatar: data.avatar,
    isGuest: false,
    email: data.email,
    wins: data.wins ?? 0,
    losses: data.losses ?? 0,
    attendanceStreak: data.attendanceStreak ?? 0,
    rank: data.rank || "BRONZE",
    joinedAt: data.joinedAt,
  } as RegisteredUser;
};

export const loginAsGuest = async (): Promise<GuestLoginResponse> => {
  const response = await axiosInstance.post<GuestLoginResponse>("/auth/guest", {});
  return response.data;
};

export const getUserInfo = async (): Promise<RegisteredUser> => {
  const response = await axiosInstance.get<RegisteredUser>("/users/me");
  return response.data;
};

export const handleRegisteredUserLogin = (accessToken: string, refreshToken: string): void => {
  localStorage.clear();
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", refreshToken);
};

export const handleGuestLogin = (data: GuestLoginResponse): AuthUser => {
  const normalized = normalizeUser(data); // 데이터를 규격에 맞게 세탁
  localStorage.setItem("isGuest", "true");
  localStorage.setItem("accessToken", data.accessToken);
  localStorage.setItem("refreshToken", data.refreshToken);
  localStorage.setItem("guestInfo", JSON.stringify(normalized)); // 세탁된 데이터 저장
  return normalized;
};

export const logout = async (): Promise<void> => {
  localStorage.clear();
  window.location.href = "/";
};