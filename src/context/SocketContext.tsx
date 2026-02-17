import { createContext, useContext } from "react";
import type { AuthUser } from "../types/auth";

export interface SocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: object) => void;
  isConnected: boolean;
  user: AuthUser | null;
  getLatestPlayers: (roomId: string) => string[];
}

export const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};
