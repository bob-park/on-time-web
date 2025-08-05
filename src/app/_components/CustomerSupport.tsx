'use client';

import { useEffect, useState } from 'react';

import { IoClose } from 'react-icons/io5';

import Image from 'next/image';

import ChatChannel from '@/domain/chat/components/ChatChannel';
import { useGetCurrentUser, useGetUsers } from '@/domain/user/query/user';
import { useUserNotification } from '@/domain/user/query/userNotification';

import useToast from '@/shared/hooks/useToast';
import useWebSocket from '@/shared/hooks/ws/useWebSocket';

import cx from 'classnames';

export default function CustomerSupport({ wsHost, userUniqueId }: { wsHost: string; userUniqueId: string }) {
  // state
  const [show, setShow] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [lastMessageId, setLastMessageId] = useState<string>();

  const [sendNotiMessages, setSendNotiMessages] = useState<string[]>([]);

  // query
  const { currentUser } = useGetCurrentUser();
  const { sendMessage } = useUserNotification();
  const { pages } = useGetUsers({ page: 0, size: 100 });

  const admins = mergePageUsers(pages.map((page) => page.content)).filter((item) => item.role.type === 'ROLE_ADMIN');

  // hooks
  const { push } = useToast();
  const { publish } = useWebSocket({
    host: wsHost,
    auth: {
      userUniqueId,
    },
    subscribe: `/sub/users/${userUniqueId}/chat`,
    publish: `/pub/users/${userUniqueId}/chat`,
    onConnect: () => {},
    onClose: () => {},
    onSubscribe: (data) => {
      const res = JSON.parse(data) as ChatMessageResponse;

      handleReceiveMessage(res);
    },
  });

  // useEffect
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const lastMessage = messages[messages.length - 1];

    setLastMessageId(lastMessage.id);

    if (show || lastMessage.id === lastMessageId) {
      return;
    }

    if (lastMessage.user.id !== currentUser?.id && lastMessage.type === 'MESSAGE') {
      push(`${lastMessage.user.username}: ${lastMessage.message}`, 'message');
    }
  }, [messages, show, lastMessageId]);

  useEffect(() => {
    if (sendNotiMessages.length === 0 || !currentUser) {
      return;
    }

    const timeoutId = setTimeout(() => {
      const message = sendNotiMessages.reduce((prev, current) => (prev += ' ' + current));

      for (const admin of admins) {
        sendMessage({
          userUniqueId: admin.id,
          body: {
            displayMessage: `${currentUser.group?.name || ''} ${currentUser.username} ${currentUser.position?.name || ''} 이(가) 불편한 메세지를 보냈습니다.`,
            fields: [
              {
                field: '내용',
                text: message,
              },
            ],
          },
        });
      }

      setSendNotiMessages([]);
    }, 5_000);

    return () => {
      timeoutId && clearTimeout(timeoutId);
    };
  }, [sendNotiMessages, currentUser]);

  // handle
  const handleSendMessage = (message: string) => {
    if (!currentUser) {
      return;
    }

    publish({ type: 'MESSAGE', message, userUniqueId: currentUser.id });

    setSendNotiMessages((prev) => {
      const newMessages = prev.slice();

      newMessages.push(message);

      return newMessages;
    });
  };

  const handleReceiveMessage = (message: ChatMessageResponse) => {
    setMessages((prev) => {
      const newMessages = prev.slice();

      newMessages.push(message);

      return newMessages;
    });
  };

  return (
    <div className="fixed right-5 bottom-5">
      {!show && (
        <div className="size-20 cursor-pointer hover:animate-bounce" onClick={() => setShow(true)}>
          <Image
            src="/customer/customer_support_chat_icon.png"
            alt="customer support chat icon"
            width={96}
            height={96}
          />
        </div>
      )}

      <div
        className={cx(
          'relative flex h-[600px] w-[400px] flex-col gap-4 rounded-2xl border border-gray-300 bg-white shadow-2xl transition-all duration-300',
          {
            'translate-y-0 opacity-100': show,
            'hidden translate-y-6 opacity-0': !show,
          },
        )}
      >
        {/* close button */}
        <div className="absolute top-2 right-2">
          <button className="btn btn-circle btn-ghost" onClick={() => setShow(false)}>
            <IoClose className="size-5" />
          </button>
        </div>

        {/* header */}
        <div className="mt-3 flex flex-row items-center justify-center gap-2">
          {/* icon */}
          <div className="w-24 flex-none">
            <Image
              className="ml-8"
              src="/customer/customer_support.png"
              alt="customer support icon"
              width={52}
              height={52}
            />
          </div>
          <div className="flex-1">
            <div className="flex flex-col">
              <div className="">
                <p className="text-base font-bold">고객지원</p>
              </div>
              <div className="">
                <p className="text-sm text-gray-400">언제 답변이 올지 모르지롱.</p>
              </div>
            </div>
          </div>
        </div>

        {/* contents */}
        <div className="h-[500px] w-full">
          <ChatChannel
            messages={messages.map((message) => ({
              id: message.id,
              type: message.type,
              me: message.user.id === currentUser?.id,
              avatar: `/api/users/${message.user?.id}/avatar`,
              userUniqueId: message.user.id,
              message: message.message,
              name: message.user.username,
              displayName: parseDisplayName(message.user),
              createdDate: message.createdDate,
            }))}
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
}

function mergePageUsers(pages: User[][]) {
  const users: User[] = [];

  for (const page of pages) {
    for (const user of page) {
      users.push(user);
    }
  }

  return users;
}

function parseDisplayName(user: User) {
  return `${user.group?.name || ''} ${user.username || ''} ${user.position?.name || ''}`;
}
