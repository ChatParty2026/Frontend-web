export interface GuestLoginResponse {
  accessToken: string;
  refreshToken: string;
  guestId: string;
  nickname: string;
}

export interface User {
  email: string;
  nickname: string;
  role: string;
  avatar: string;
  wins: number;
  losses: number;
  attendanceStreak: number;
  rank: string;
}
