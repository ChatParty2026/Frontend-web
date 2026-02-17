export interface ChatMessage {
  id: string;
  author: string;
  authorAvatar?: string;
  message: string;
  timestamp: Date;
  isSystem?: boolean;
}
