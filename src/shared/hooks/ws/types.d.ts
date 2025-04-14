type ChatMessageType = 'ENTER' | 'MESSAGE' | 'LEAVE';

interface ChatMessageRequest {
  type: ChatMessageType;
  message: string;
}
