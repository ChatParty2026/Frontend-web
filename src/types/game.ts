export interface GamePacket {
  type: string;             // 예: "CHAT", "SUCCESS", "NOTICE", "ROOM_LIST_UPDATE"
  gameType: string;         // 예: "MAIN", "ROOM"
  sender: string;           // 유저 닉네임
  avatar?: string | null;   // [핵심] 유저 프사 주소 (Nullable)

  actionType?: string | null; 
  payload?: Record<string, any> | null; // 백엔드의 Map<String, Any>? 대응

  title: string;            // 방 제목 (기본값 "")
  roomId: string;           // UUID
  message?: string | null;  // 채팅 메시지 내용
  maxCount?: number;        // 최대 인원
  password?: string | null; // 방 비밀번호

  status?: string | null;   // 상태값
  timestamp: string;        // java.time.OffsetDateTime 대응 (ISO String)
}