type MessageLevel = 'success' | 'warning' | 'error' | 'info';

interface ToastMessage {
  id: string;
  level: MessageLevel;
  message: string;
  createdDate: Date;
}
