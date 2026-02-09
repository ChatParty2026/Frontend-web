import axiosInstance from "./axios";
import type { GuestLoginResponse } from "../types/auth";

export const loginAsGuest = async (): Promise<GuestLoginResponse> => {
  const response = await axiosInstance.post<GuestLoginResponse>(
    "/auth/guest",
    {},
  );
  return response.data;
};
