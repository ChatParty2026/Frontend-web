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
  
  // ✅ 캐싱용 Ref: hostName 필드 추가
  const lastPlayerList = useRef<{ [roomId: string]: string[] }>({});
  const lastRoomInfo = useRef<{ 
    [roomId: string]: { title: string; gameType: string; hostName?: string } 
  }>({});

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const rid = data.roomId;

    switch (data.type) {
      case "SUCCESS": {
        const reqType = data.payload?.requestType;
        const hostName = data.payload?.hostNickname || data.payload?.hostName; 
        
        if (rid) {
          lastRoomInfo.current[rid] = {
            ...lastRoomInfo.current[rid],
            title: data.payload?.title || data.title || lastRoomInfo.current[rid]?.title || "즐거운 채팅방",
            gameType: data.gameType || data.payload?.gameType || lastRoomInfo.current[rid]?.gameType || "JUST_CHAT",
            hostName: hostName || lastRoomInfo.current[rid]?.hostName
          };
          
          if (data.payload?.players) {
            lastPlayerList.current[rid] = data.payload.players;
          }
        }

        if (reqType === "CREATE") {
          window.dispatchEvent(new CustomEvent("ROOM_CREATED", { detail: { ...data.payload, gameType: data.gameType } }));
        } else if (reqType === "JOIN") {
          window.dispatchEvent(new CustomEvent("JOIN_SUCCESS", { detail: { ...data.payload, gameType: data.gameType, hostName } }));
        }
        break;
      }

      case "NOTICE": {
        window.dispatchEvent(new CustomEvent("SYSTEM_NOTICE", { detail: data }));
        break;
      }

      case "CHAT": {
        window.dispatchEvent(new CustomEvent("NEW_CHAT", { detail: data }));
        break;
      }

      case "ROOM_LIST_UPDATE": {
        window.dispatchEvent(new CustomEvent("ROOM_LIST_UPDATED", { detail: data.payload }));
        break;
      }

      case "PLAYER_LIST_UPDATE":
      case "GAME_INFO": {
        const players = data.payload?.players;
        const title = data.title || data.payload?.title;
        const hostName = data.payload?.hostNickname; 

        if (rid && players) {
          lastPlayerList.current[rid] = players;
        }
        
        if (rid) {
          lastRoomInfo.current[rid] = {
            ...lastRoomInfo.current[rid],
            title: title || lastRoomInfo.current[rid]?.title || "즐거운 채팅방",
            gameType: data.gameType || lastRoomInfo.current[rid]?.gameType || "JUST_CHAT",
            hostName: hostName || lastRoomInfo.current[rid]?.hostName
          };
        }

        window.dispatchEvent(
          new CustomEvent("PLAYER_LIST_UPDATE", {
            detail: { players, roomId: rid, gameType: data.gameType, title, hostName },
          })
        );
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
    if (!user || !token || (socketRef.current && socketRef.current.readyState !== WebSocket.CLOSED)) return;

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => { setIsConnected(true); setSocket(ws); };
    ws.onmessage = handleIncomingMessage;
    ws.onclose = () => { setIsConnected(false); setSocket(null); socketRef.current = null; };
  }, [user?.nickname, handleIncomingMessage]);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(message));
    }
  }, []);

  const getLatestPlayers = useCallback((roomId: string) => lastPlayerList.current[roomId] || [], []);
  const getRoomInfo = useCallback((roomId: string) => lastRoomInfo.current[roomId], []);

  return (
    <SocketContext.Provider value={{ socket, sendMessage, isConnected, user, getLatestPlayers, getRoomInfo }}>
      {children}
    </SocketContext.Provider>
  );
};