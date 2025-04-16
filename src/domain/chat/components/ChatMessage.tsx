'use client';

import UserAvatar from '@/domain/user/components/UserAvatar';

import cx from 'classnames';
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
  name: string;
  displayName: string;
  createdDate: Date;
}

export default function ChatMessage({ me = true, avatar, message, name, displayName, createdDate }: ChatMessageProps) {
  return (
    <div
      className={cx('chat', {
        'chat-start': !me,
        'chat-end': me,
      })}
    >
      {!me && (
        <>
          <div className="chat-image avatar">
            <div className="w-12 rounded-full">
              <UserAvatar avatar={avatar} alt={name} size="sm" isOnline={false} />
            </div>
          </div>
          <div className="chat-header">{displayName}</div>
        </>
      )}

      <div className={cx('chat-bubble', { 'chat-bubble-primary': me })}>{message}</div>
      <div className="chat-footer opacity-50">
        <TimeAgo locale="ko" datetime={createdDate} />
      </div>
    </div>
  );
}
