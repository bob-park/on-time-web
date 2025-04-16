type ChatMessageType = 'ENTER' | 'MESSAGE' | 'LEAVE';

interface ChatMessageRequest {
  type: ChatMessageType;
  message: string;
  userUniqueId: string;
}

interface ChatMessageResponse {
  id: string;
  type: ChatMessageType;
  message: string;
  user: User;
  createdDate: Date;
}
