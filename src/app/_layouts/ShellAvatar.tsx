'use client';

import { useState } from 'react';

import { User } from '@/domain/users/apis/users.dto';

import cx from 'classnames';

// 셸 전용 아바타. 프로필 이미지가 없거나 깨지면 이니셜로 대체한다. (공용 UserAvatar 는 프로필 페이지용)
export default function ShellAvatar({ user, size = 'sm' }: Readonly<{ user?: User; size?: 'sm' | 'md' }>) {
  // state
  const [failedId, setFailedId] = useState<string>();

  const initial = user?.username?.substring(0, 1)?.toUpperCase() || '';

  return (
    <span
      className={cx(
        'from-primary to-secondary text-primary-content relative flex flex-none items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-bold select-none',
        size === 'sm' ? 'size-[30px] text-xs' : 'size-[38px] text-sm',
      )}
    >
      {initial}
      {user && failedId !== user.id && (
        // eslint-disable-next-line @next/next/no-img-element -- 인증 프록시 경로라 next/image 최적화 대상이 아니다
        <img
          src={`/api/v1/users/${user.id}/avatar`}
          alt=""
          className="absolute inset-0 size-full object-cover"
          onError={() => setFailedId(user.id)}
        />
      )}
    </span>
  );
}
