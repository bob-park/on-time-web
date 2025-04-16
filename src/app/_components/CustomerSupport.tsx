'use client';

import { useState } from 'react';

import { IoClose } from 'react-icons/io5';

import Image from 'next/image';

import ChatChannel from '@/domain/chat/components/ChatChannel';
import { useGetCurrentUser, useGetUsers } from '@/domain/user/query/user';
import { useUserNotification } from '@/domain/user/query/userNotification';

import useWebSocket from '@/shared/hooks/ws/useWebSocket';

import cx from 'classnames';

export default function CustomerSupport({ wsHost }: { wsHost: string }) {
  // state
  const [show, setShow] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);

  // query
  const { currentUser } = useGetCurrentUser();
  const { sendMessage } = useUserNotification();

  // query
  const { pages } = useGetUsers({ page: 0, size: 100 });

  const admins = mergePageUsers(pages.map((page) => page.content)).filter((item) => item.role.type === 'ROLE_ADMIN');

  // hooks
  const { publish } = useWebSocket({
    host: wsHost,
    subscribe: `/sub/users/${currentUser?.uniqueId}/chat`,
    publish: `/pub/users/${currentUser?.uniqueId}/chat`,
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
    if (!currentUser) {
      return;
    }

    publish({ type: 'MESSAGE', message, userUniqueId: currentUser.uniqueId });

    for (const admin of admins) {
      sendMessage({
        userUniqueId: admin.uniqueId,
        body: {
          displayMessage: `${currentUser.team?.name || ''} ${currentUser.username} ${currentUser.position?.name || ''} 이(가) 불편한 메세지를 보냈습니다.`,
          fields: [
            {
              field: '내용',
              text: message,
            },
          ],
        },
      });
    }
  };

  return (
    <div className="fixed right-5 bottom-5">
      {!show && (
        <div className="size-24 cursor-pointer hover:animate-bounce" onClick={() => setShow(true)}>
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
              me: message.user.uniqueId === currentUser?.uniqueId,
              avatar: `/api/users/${message.user.uniqueId}/avatar`,
              message: message.message,
              name: message.user.username,
              displayName: `${message.user.team?.name || ''} ${message.user.username} ${message.user.position?.name || ''}`,
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
