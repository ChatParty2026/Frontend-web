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

export const logout = async (): Promise<void> => {
  localStorage.clear();
};
