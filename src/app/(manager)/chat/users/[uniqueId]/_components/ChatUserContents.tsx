'use client';

import { useState } from 'react';

import ChatChannel from '@/domain/chat/components/ChatChannel';
import { useGetCurrentUser } from '@/domain/user/query/user';
import useWebSocket from '@/shared/hooks/ws/useWebSocket';

interface ChatUserContentsProps {
  wsHost: string;
  user: User;
}

export default function ChatUserContents({ wsHost, user }: ChatUserContentsProps) {
  // state
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);

  // query
  const { currentUser } = useGetCurrentUser();

  // hooks
  const { publish } = useWebSocket({
    host: wsHost,
    auth: {
      userUniqueId: currentUser?.id || '',
    },
    subscribe: `/sub/users/${user.id}/chat`,
    publish: `/pub/users/${user.id}/chat`,
    onConnect: () => {},
    onClose: () => {},
    onSubscribe: (data) => {
      const res = JSON.parse(data) as ChatMessageResponse;

      setMessages((prev) => {
        const newMessages = prev.slice();

        newMessages.push(res);

        return newMessages;
      });
    },
  });

  // handle
  const handleSendMessage = (message: string) => {
    currentUser && publish({ type: 'MESSAGE', message, userUniqueId: currentUser.id });
  };

  return (
    <div className="flex size-full flex-col items-start justify-start">
      <div className="bg-base-300 flex h-[calc(100vh-300px)] w-full max-w-xl flex-col overflow-hidden rounded-lg">
        <ChatChannel
          messages={messages.map((message) => ({
            id: message.id,
            type: message.type,
            me: message.user?.id === currentUser?.id,
            avatar: `/api/users/${message.user?.id}/avatar`,
            userUniqueId: message.user.id,
            message: message.message,
            name: message.user.username,
            displayName: `${message.user.group?.name || ''} ${message.user.username || ''} ${message.user.position?.name || ''}`,
            createdDate: message.createdDate,
          }))}
          onSend={handleSendMessage}
        />
      </div>
    </div>
  );
}
