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

  // ✅ 데이터 업데이트 및 캐싱 로직
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

  // ✅ CustomEvent 발신 헬퍼
  const emit = useCallback((eventName: string, detail: any) => {
    window.dispatchEvent(new CustomEvent(eventName, { detail }));
  }, []);

  // ✅ 메시지 핸들러
  const handleIncomingMessage = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      const rid = data.roomId;

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
            hostName: data.payload?.hostNickname,
          });
          break;
        case "ACTION": {
  const targetRoomId = rid || data.payload?.roomId;
  
  // 브라우저 콘솔에서 실제 데이터 구조 확인용
  console.log("[Socket] ACTION 수신:", data.actionType, data.payload);

  emit("ACTION", {
    actionType: data.actionType,
    payload: data.payload,
    roomId: targetRoomId,
    sender: data.sender,
  });

  if (data.actionType === "GAME_OVER" || data.actionType === 11) { // 코드값 예시 포함
    emit("GAME_OVER", { ...data.payload, roomId: targetRoomId });
  }
  break;
}
        case "ERROR":
          emit("SYSTEM_ERROR", data.message);
          console.error("Socket Error:", data.message);
          break;
      }
    } catch (err) {
      console.error("메시지 파싱 에러:", err);
    }
  }, [updateRoomCache, emit]);

  // ✅ 소켓 연결 로직 (재연결 포함)
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    // ⚠️ 중요: 유저 정보가 API 404 등으로 인해 없을 경우 연결하지 않음
    if (!user || !token) {
      console.warn("[Socket] 유저 정보 또는 토큰이 없어 연결을 대기합니다.");
      return;
    }

    // ⚠️ Strict Mode 중복 실행 방지: 이미 연결 중이라면 리턴
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
        console.log(`❌ [Socket] 연결 종료 (Code: ${e.code}). 3초 후 재시도...`);
        
        // 사용자가 의도적으로 닫은 게 아니라면 재연결 시도
        if (e.code !== 1000) {
          setTimeout(() => connect(), 3000);
        }
      };

      ws.onerror = (e) => {
        console.error("⚠️ [Socket] 에러 발생:", e);
      };
    };

    connect();

    return () => {
      // 컴포넌트가 완전히 사라질 때만 닫음 (Strict Mode 중복 방지는 위쪽 조건문에서 처리)
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.close(1000, "Component Unmounted");
        socketRef.current = null;
      }
    };
  }, [user?.nickname, handleIncomingMessage]); // nickname으로 의존성 구체화

  // ✅ 메시지 전송 함수
  const sendMessage = useCallback((message: object) => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({
        sender: user?.nickname,
        avatar: user?.avatar,
        ...message,
        timestamp: new Date().toISOString(),
      }));
    } else {
      console.warn("⚠️ 소켓이 연결되지 않았습니다. 메시지 전송 불가:", message);
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