import {
  useEffect,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types/auth";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({
  children,
  user,
}: {
  children: ReactNode;
  user: AuthUser | null;
}) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const lastPlayerList = useRef<{ [roomId: string]: string[] }>({});

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const rid = data.roomId || data.roomld;

    switch (data.type) {
      case "CREATE": {
        if (data.status === "SUCCESS") {
          window.dispatchEvent(
            new CustomEvent("ROOM_CREATED", { detail: data }),
          );
        }
        break;
      }
      case "PLAYER_LIST_UPDATE":
      case "GAME_INFO": {
        const players = data.payload?.players;
        if (rid && players) {
          lastPlayerList.current[rid] = players;
          window.dispatchEvent(
            new CustomEvent("PLAYER_LIST_UPDATE", {
              detail: { players, roomId: rid, gameType: data.gameType },
            }),
          );
        }
        break;
      }
      case "ERROR": {
        alert(data.message);
        break;
      }
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (
      !user ||
      !token ||
      (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED)
    )
      return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setSocket(ws);
    };
    ws.onmessage = handleIncomingMessage;
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      socketRef.current = null;
    };
  }, [user?.nickname, handleIncomingMessage]);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const getLatestPlayers = useCallback((roomId: string) => {
    return lastPlayerList.current[roomId] || [];
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, sendMessage, isConnected, user, getLatestPlayers }}
    >
      {children}
    </SocketContext.Provider>
  );
};
