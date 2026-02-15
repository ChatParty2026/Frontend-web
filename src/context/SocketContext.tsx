import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser } from "../types/auth";

interface SocketContextType {
  socket: WebSocket | null;
  sendMessage: (message: object) => void;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
};

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

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!user || !token) return;

    // 중복 연결 방지 (이미 객체가 있고 닫힌 상태가 아니라면 유지)
    if (
      socketRef.current &&
      socketRef.current.readyState !== WebSocket.CLOSED
    ) {
      return;
    }

    console.log("🚀 Initializing WebSocket for:", user.nickname);
    const ws = new WebSocket(`${import.meta.env.VITE_WS_URL}?token=${token}`);

    // 생성 즉시 Ref에 저장 (가장 중요)
    socketRef.current = ws;

    ws.onopen = () => {
      console.log("✅ WebSocket Open State");
      setIsConnected(true);
      setSocket(ws);

      ws.send(
        JSON.stringify({
          type: "JOIN",
          gameType: "MAIN",
          roomId: "main",
          sender: user.nickname,
        }),
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // 서버 응답: type이 "GAME_INFO"이고 gameType이 "LIAR"인 경우
      if (data.type === "GAME_INFO" && data.gameType === "LIAR") {
        console.log("🎯 방 생성 성공! 라이어 게임방으로 이동합니다.");
        // SPA 이동을 위해 window.location을 사용하거나,
        // 전역 상태에 저장 후 전역 Router에서 처리할 수 있습니다.
        window.location.href = `/game/liar/${data.roomId}`;
      }

      if (data.type === "ERROR") alert(data.message);
    };

    ws.onclose = (e) => {
      console.log("🔌 WebSocket Closed:", e.code, e.reason);
      setIsConnected(false);
      setSocket(null);
      // close 시점에만 null 처리
      socketRef.current = null;
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket Error:", error);
    };

    // Clean-up 시 소켓을 아예 죽이지 않고,
    // 정말 언마운트될 때만 닫고 싶다면 의존성 배열을 신중히 관리해야 합니다.
    return () => {
      //Strict Mode 대응: 바로 닫지 않고 상태를 체크하거나 생략 가능
      //만약 페이지 이동 시 소켓을 유지해야 한다면 아래 코드를 주석 처리하세요.
      //ws.close();
    };
  }, [user?.nickname]); // 객체 전체보다 특정 값(nickname)을 감시하는 게 안정적입니다.

  const sendMessage = (message: object) => {
    // 1. Ref가 있는지 확인
    const currentWs = socketRef.current;

    if (currentWs && currentWs.readyState === WebSocket.OPEN) {
      console.log("📤 Sending Message:", message);
      currentWs.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ Send Failed:", {
        hasRef: !!currentWs,
        readyState: currentWs?.readyState,
        isConnected,
      });

      // 만약 Ref는 없는데 이전에 연결된 적이 있다면 재연결 유도 로직이 필요할 수 있음
    }
  };

  return (
    <SocketContext.Provider value={{ socket, sendMessage, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
