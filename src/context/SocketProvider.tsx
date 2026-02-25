import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { SocketContext } from "./SocketContext";
import { SOCKET_EVENTS } from "../constants/events";

export const SocketProvider = ({ children, user }: { children: ReactNode; user: AuthUser | null }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  const lastPlayerList = useRef<Record<string, any[]>>({});
  const lastRoomInfo = useRef<Record<string, { title: string; gameType: string; hostName?: string }>>({});

  const updateRoomCache = useCallback((rid: string, data: any) => {
    if (!rid) return;
    const { payload, gameType, title } = data;
    const hostName = payload?.hostNickname || payload?.hostName;

    lastRoomInfo.current[rid] = {
      ...lastRoomInfo.current[rid],
      title: payload?.title || title || lastRoomInfo.current[rid]?.title || "즐거운 채팅방",
      gameType: gameType || payload?.gameType || lastRoomInfo.current[rid]?.gameType || "JUST_CHAT",
      hostName: hostName || lastRoomInfo.current[rid]?.hostName,
    };

    if (payload?.players) {
      lastPlayerList.current[rid] = payload.players;
    }
  }, []);

  const emit = useCallback((eventName: string, detail: any) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }, []);

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const rid = data.roomId || data.payload?.roomId;

      switch (data.type) {
        case "SUCCESS": {
          updateRoomCache(rid, data);
          const reqType = data.payload?.requestType;
          if (reqType === "CREATE") emit(SOCKET_EVENTS.ROOM_CREATED, { ...data.payload, gameType: data.gameType });
          else if (reqType === "JOIN")
            emit(SOCKET_EVENTS.JOIN_SUCCESS, {
              ...data.payload,
              gameType: data.gameType,
              hostName: data.payload?.hostNickname,
            });
          break;
        }
        case "NOTICE": emit(SOCKET_EVENTS.SYSTEM_NOTICE, data); break;
        case "CHAT": emit(SOCKET_EVENTS.NEW_CHAT, data); break;
        case "ROOM_LIST_UPDATE": emit(SOCKET_EVENTS.ROOM_LIST_UPDATED, data.payload); break;
        case "PLAYER_LIST_UPDATE":
        case "GAME_INFO":
          updateRoomCache(rid, data);
          emit("PLAYER_LIST_UPDATE", {
            players: data.payload?.players,
            roomId: rid,
            gameType: data.gameType,
            title: data.title || data.payload?.title,
            hostName: data.payload?.hostNickname || data.payload?.hostName,
          });
          break;
        case "ACTION": {
          // 🎯 수정: actionType을 항상 대문자 문자열로 변환하여 로직 일관성 유지
          const rawActionType = data.actionType;
          const actionType = typeof rawActionType === "string" ? rawActionType.toUpperCase() : rawActionType;
          
          console.log("[Socket] ACTION 수신:", actionType, data.payload);

          emit("ACTION", {
            actionType: actionType,
            payload: data.payload,
            roomId: rid,
            sender: data.sender,
          });

          // GAME_OVER(11) 대응
          if (actionType === "GAME_OVER" || actionType === 11) {
            emit("GAME_OVER", { ...data.payload, roomId: rid });
          }
          break;
        }
        case "ERROR":
          emit("SYSTEM_ERROR", data.message);
          break;
      }
    } catch (err) {
      console.error("메시지 파싱 에러:", err);
    }
  }, [updateRoomCache, emit]);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const connect = () => {
      console.log("🚀 [Socket] 서버에 연결 시도 중...");
      const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
      socketRef.current = ws;

      ws.onopen = () => {
        console.log("✅ [Socket] 연결 성공");
        setIsConnected(true);
        setSocket(ws);
      };

      ws.onmessage = handleIncomingMessage;

      ws.onclose = (e) => {
        setIsConnected(false);
        setSocket(null);
        socketRef.current = null;
        if (e.code !== 1000) {
          setTimeout(() => connect(), 3000);
        }
      };
    };

    connect();

    return () => {
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000);
        socketRef.current = null;
      }
    };
  }, [handleIncomingMessage]);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      // 🎯 수정: user가 없을 경우를 대비한 안전한 전송 로직
      const payload = {
        sender: user?.nickname || "Unknown",
        avatar: user?.avatar || "",
        ...message,
        timestamp: Date.now(),
      };
      socketRef.current.send(JSON.stringify(payload));
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ 
        socket, 
        sendMessage, 
        isConnected, 
        user, 
        getLatestPlayers: (rid: string) => lastPlayerList.current[rid] || [], 
        getRoomInfo: (rid: string) => lastRoomInfo.current[rid] 
    }}>
      {children}
    </SocketContext.Provider>
  );
};