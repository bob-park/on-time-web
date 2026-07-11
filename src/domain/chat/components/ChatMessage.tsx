'use client';

import UserAvatar from '@/domain/user/components/UserAvatar';

import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';

timeago.register('ko', ko);

export interface ChatMessageProps {
  id: string;
  type: ChatMessageType;
  me?: boolean;
  avatar?: string;
  message: string;
  userUniqueId: string;
  name: string;
  displayName: string;
  createdDate: Date;
}

export default function ChatMessage({ me = true, avatar, message, name, displayName, createdDate }: ChatMessageProps) {
  if (me) {
    return (
      <div className="flex w-full justify-end">
        <div className="flex max-w-[85%] flex-row-reverse items-end gap-1.5">
          <div className="bg-primary text-primary-content rounded-2xl rounded-tr-sm px-3.5 py-2.5 text-sm leading-relaxed font-medium break-words">
            {message}
          </div>
          <span className="text-base-content/50 flex-none text-[10px]">
            <TimeAgo locale="ko" datetime={createdDate} />
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-start">
      <div className="flex max-w-[85%] gap-2.5">
        <div className="size-8 flex-none">
          <UserAvatar avatar={avatar} alt={name} size="xs" isOnline={false} />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <span className="text-base-content/60 text-[11px]">{displayName}</span>
          <div className="flex items-end gap-1.5">
            <div className="rounded-2xl rounded-tl-sm bg-[#252525] px-3.5 py-2.5 text-sm leading-relaxed break-words">
              {message}
            </div>
            <span className="text-base-content/50 flex-none text-[10px]">
              <TimeAgo locale="ko" datetime={createdDate} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
