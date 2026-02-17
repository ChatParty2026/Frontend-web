export type UserRole = "USER" | "GUEST";

// 모든 유저가 공통으로 가지는 최소한의 정보
interface BaseUser {
  nickname: string;
  role: UserRole;
  avatar: string; // ✅ 게스트도 아바타가 있으므로 공통으로 이동
  isGuest: boolean;
}

export interface GuestUser extends BaseUser {
  role: "GUEST";
  guestId: string;
}

export interface RegisteredUser extends BaseUser {
  role: "USER";
  email: string;
  wins: number;
  losses: number;
  attendanceStreak: number;
  rank: string;
  joinedAt: string;
}

export type AuthUser = RegisteredUser | GuestUser;

// 백엔드 응답 DTO (실제 API 응답 구조에 맞춤)
export interface GuestLoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
  guestId: string;
  avatar: string;
  nickname: string;
  isGuest: boolean;
}
