import { createContext, useContext } from "react";
import type { AuthUser } from "../types/auth";

// ✅ 방 정보 객체의 타입 정의 (가독성을 위해 분리)
export interface RoomCacheInfo {
  title: string;
  gameType: string;
  hostName?: string;
}

export interface SocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: object) => void;
  isConnected: boolean;
  user: AuthUser | null;
  getLatestPlayers: (roomId: string) => string[];
  // ✅ 에러 해결: getRoomInfo 정의 추가
  getRoomInfo: (roomId: string) => RoomCacheInfo | undefined;
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};