import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import type { AuthUser } from "../types/auth";
import { SocketContext } from "./SocketContext";
import { SOCKET_EVENTS } from "../constants/events";

export const SocketProvider = ({ children, user }: { children: ReactNode; user: AuthUser | null }) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  
  const lastPlayerList = useRef<Record<string, string[]>>({});
  const lastRoomInfo = useRef<Record<string, { title: string; gameType: string; hostName?: string }>>({});

  // ✅ 1. 데이터 업데이트 로직 중앙 집중화 (유지보수 핵심)
  const updateRoomCache = useCallback((rid: string, data: any) => {
    if (!rid) return;
    
    const { payload, gameType, title } = data;
    const hostName = payload?.hostNickname || payload?.hostName;

    lastRoomInfo.current[rid] = {
      ...lastRoomInfo.current[rid],
      title: payload?.title || title || lastRoomInfo.current[rid]?.title || "즐거운 채팅방",
      gameType: gameType || payload?.gameType || lastRoomInfo.current[rid]?.gameType || "JUST_CHAT",
      hostName: hostName || lastRoomInfo.current[rid]?.hostName
    };

    if (payload?.players) {
      lastPlayerList.current[rid] = payload.players;
    }
  }, []);

  // ✅ 2. 이벤트 발신 헬퍼 (코드 짧게 유지)
  const emit = useCallback((eventName: string, detail: any) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }, []);

  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    const data = JSON.parse(event.data);
    const rid = data.roomId;

    switch (data.type) {
      case "SUCCESS": {
        updateRoomCache(rid, data);
        const reqType = data.payload?.requestType;
        
        if (reqType === "CREATE") emit(SOCKET_EVENTS.ROOM_CREATED, { ...data.payload, gameType: data.gameType });
        else if (reqType === "JOIN") emit(SOCKET_EVENTS.JOIN_SUCCESS, { ...data.payload, gameType: data.gameType, hostName: data.payload?.hostNickname });
        break;
      }

      case "NOTICE":
        emit(SOCKET_EVENTS.SYSTEM_NOTICE, data);
        break;

      case "CHAT":
        emit(SOCKET_EVENTS.NEW_CHAT, data);
        break;

      case "ROOM_LIST_UPDATE":
        emit(SOCKET_EVENTS.ROOM_LIST_UPDATED, data.payload);
        break;

      case "PLAYER_LIST_UPDATE":
      case "GAME_INFO":
        updateRoomCache(rid, data);
        emit("PLAYER_LIST_UPDATE", { 
          players: data.payload?.players, 
          roomId: rid, 
          gameType: data.gameType, 
          title: data.title || data.payload?.title, 
          hostName: data.payload?.hostNickname 
        });
        break;

      case "ERROR":
        console.error("Socket Error:", data.message);
        break;
    }
  }, [updateRoomCache, emit]);

  // ... (useEffect 및 sendMessage 로직은 동일)
  
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!user || !token) return;

    if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);
    socketRef.current = ws;

    ws.onopen = () => { setIsConnected(true); setSocket(ws); };
    ws.onmessage = handleIncomingMessage;
    ws.onclose = () => { setIsConnected(false); setSocket(null); socketRef.current = null; };
    ws.onerror = (e) => console.error("WebSocket Error", e);

    return () => {
      // 컴포넌트 언마운트 시 클린업
    };
  }, [user?.nickname, handleIncomingMessage]);

  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        sender: user?.nickname,
        avatar: user?.avatar,
        ...message,
        timestamp: new Date().toISOString(),
      }));
    }
  }, [user]);

  const getLatestPlayers = useCallback((roomId: string) => lastPlayerList.current[roomId] || [], []);
  const getRoomInfo = useCallback((roomId: string) => lastRoomInfo.current[roomId], []);

  return (
    <SocketContext.Provider value={{ socket, sendMessage, isConnected, user, getLatestPlayers, getRoomInfo }}>
      {children}
    </SocketContext.Provider>
  );
};