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

      if (data.status === "SUCCESS" && data.type === "CREATE") {
        // 커스텀 이벤트 발생 (데이터 전달)
        const event = new CustomEvent("ROOM_CREATED", { detail: data });
        window.dispatchEvent(event);
      }

      // 2. 플레이어 리스트 업데이트 이벤트 (신규 추가)
      // 생성, 입장, 유저 변경 시 모두 이 이벤트를 통해 데이터를 전달합니다.
      if (data.type === "PLAYER_LIST_UPDATE") {
        console.log("👥 Player List Updated:", data.payload.players);
        const playerUpdateEvent = new CustomEvent("PLAYER_LIST_UPDATE", {
          detail: {
            players: data.payload.players,
            roomId: data.roomId || data.roomld, // 서버 오타 대비
            gameType: data.gameType,
          },
        });
        window.dispatchEvent(playerUpdateEvent);
      }

      if (data.type === "ERROR") {
        alert(data.message);
      }
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
