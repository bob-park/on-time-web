'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { IoSend } from 'react-icons/io5';

import { useGetCurrentUser } from '@/domain/user/query/user';

import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface ChatChannelProps {
  loading?: boolean;
  messages: ChatMessageProps[];
  onSend?: (message: string) => void;
}

export default function ChatChannel({ loading = false, messages, onSend }: ChatChannelProps) {
  // ref
  const chatMessageRef = useRef<HTMLDivElement>(null);

  // state
  const [message, setMessage] = useState<string>('');

  // useEffect
  useEffect(() => {
    if (!chatMessageRef.current) {
      return;
    }

    chatMessageRef.current.scroll({
      top: chatMessageRef.current.scrollHeight,
    });
  }, [messages]);

  // handle
  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    message && onSend?.(message);
    setMessage('');
  };

  return (
    <div className="relative flex size-full flex-col gap-2">
      {/* chat list */}
      <div className="flex h-[calc(100%-40px)] flex-col gap-2 overflow-auto p-3" ref={chatMessageRef}>
        <MemorizedChatMessage messages={messages} />
      </div>

      {/* send message from */}
      <form
        className="absolute bottom-0 flex w-full flex-row-reverse items-center justify-center gap-2 px-4"
        onSubmit={handleSend}
      >
        <div className="w-20 flex-none">
          <button className="btn btn-neutral w-full text-xs" type="submit" disabled={loading || !message}>
            {loading ? <span className="loading loading-spinner loading-xs" /> : <IoSend className="size-4" />}
            전송
          </button>
        </div>
        <div className="flex-1">
          <input
            className="input w-full"
            placeholder="메세지를 입력해주세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </form>
    </div>
  );
}

function ChatMessages({ messages }: { messages: ChatMessageProps[] }) {
  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <>
      {messages.map((message, index) => (
        <div key={`chat_message_${message.id}`}>
          {message.type === 'ENTER' && (
            <div className="flex flex-row items-center justify-center">
              <div className="badge badge-ghost">
                {message.userUniqueId === currentUser?.id ? '고객지원에 연결되었습니다.' : '담당자와 연결되었습니다.'}
              </div>
            </div>
          )}
          {message.type === 'MESSAGE' && <ChatMessage {...message} />}
          {message.type === 'LEAVE' && (
            <div className="flex flex-row items-center justify-center">
              <div className="badge badge-ghost">
                {message.userUniqueId === currentUser?.id
                  ? '고객지원에 연결 해제되었습니다.'
                  : '담당자가 나가부렀습니다.'}
              </div>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

const MemorizedChatMessage = memo(ChatMessages);
