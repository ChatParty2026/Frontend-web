// 유저의 역할을 상수로 관리
export type UserRole = 'USER' | 'GUEST';

// 공통 속성
interface BaseUser {
  nickname: string;
  role: UserRole;
}

// 1. 게스트 유저 인터페이스
export interface GuestUser extends BaseUser {
  role: 'GUEST';
  guestId: string;
  // 게스트는 전적이나 랭크 정보가 없으므로 생략
}

// 2. 정식 등록 유저 인터페이스
export interface RegisteredUser extends BaseUser {
  role: 'USER';
  email: string;
  avatar: string;
  wins: number;
  losses: number;
  attendanceStreak: number;
  rank: string;
}

// 3. 통합 유저 타입 (Discriminated Union)
export type AuthUser = RegisteredUser | GuestUser;

// 4. API 응답 타입 (로그인 시)
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser; // 유저 정보를 포함해서 받는 경우
}

// 기존 GuestLoginResponse를 유지해야 한다면:
export interface GuestLoginResponse {
  accessToken: string;
  refreshToken: string;
  guestId: string;
  nickname: string;
  role: 'GUEST'; // role을 명시해주는 것이 좋습니다.
}