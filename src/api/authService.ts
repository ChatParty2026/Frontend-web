import axiosInstance from "./axios";
import type { GuestLoginResponse, User } from "../types/auth";

export const loginAsGuest = async (): Promise<GuestLoginResponse> => {
  const response = await axiosInstance.post<GuestLoginResponse>(
    "/auth/guest",
    {},
  );
  return response.data;
};

export const getUserInfo = async (): Promise<User> => {
  const response = await axiosInstance.get<User>("/users/me");
  return response.data;
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("isGuest");
};
