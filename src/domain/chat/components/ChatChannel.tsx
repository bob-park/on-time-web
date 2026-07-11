'use client';

import { memo, useEffect, useRef, useState } from 'react';

import { IoSend } from 'react-icons/io5';

import { useGetCurrentUser } from '@/domain/user/query/user';

import { useTranslations } from 'next-intl';

import ChatMessage, { ChatMessageProps } from './ChatMessage';

interface ChatChannelProps {
  loading?: boolean;
  messages: ChatMessageProps[];
  onSend?: (message: string) => void;
}

export default function ChatChannel({ loading = false, messages, onSend }: ChatChannelProps) {
  // i18n
  const t = useTranslations('chat');

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
    <div className="flex size-full flex-col">
      {/* chat list */}
      <div className="flex flex-1 flex-col gap-3.5 overflow-auto p-4" ref={chatMessageRef}>
        <MemorizedChatMessage messages={messages} />
      </div>

      {/* send message form */}
      <form className="flex flex-none items-center gap-2.5 border-t border-white/[0.08] p-3" onSubmit={handleSend}>
        <input
          className="input flex-1 rounded-full"
          placeholder={t('inputPlaceholder')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button
          className="btn btn-circle btn-primary flex-none"
          type="submit"
          disabled={loading || !message}
          aria-label={t('send')}
          title={t('send')}
        >
          {loading ? <span className="loading loading-spinner loading-xs" /> : <IoSend className="size-4" />}
        </button>
      </form>
    </div>
  );
}

function ChatMessages({ messages }: { messages: ChatMessageProps[] }) {
  // i18n
  const t = useTranslations('chat');

  // query
  const { currentUser } = useGetCurrentUser();

  return (
    <>
      {messages.map((message) => (
        <div key={`chat_message_${message.id}`}>
          {message.type === 'ENTER' && (
            <div className="flex flex-row items-center justify-center">
              <span className="text-base-content/60 rounded-full bg-white/10 px-3.5 py-1 text-[11px]">
                {message.userUniqueId === currentUser?.id ? t('system.enterMe') : t('system.enterOther')}
              </span>
            </div>
          )}
          {message.type === 'MESSAGE' && <ChatMessage {...message} />}
          {message.type === 'LEAVE' && (
            <div className="flex flex-row items-center justify-center">
              <span className="text-base-content/60 rounded-full bg-white/10 px-3.5 py-1 text-[11px]">
                {message.userUniqueId === currentUser?.id ? t('system.leaveMe') : t('system.leaveOther')}
              </span>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

const MemorizedChatMessage = memo(ChatMessages);
