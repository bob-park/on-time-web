'use client';

import { useState } from 'react';

import Image from 'next/image';

import cx from 'classnames';

interface UserAvatarProps {
  avatar?: string;
  alt: string;
}

export default function UserAvatar({ avatar, alt }: UserAvatarProps) {
  // useState
  const [isError, setIsError] = useState<boolean>(!avatar);

  return (
    <div className={cx('avatar', 'avatar-online', !avatar && 'avatar-placeholder')}>
      <div className="bg-neutral text-neutral-content w-12 rounded-full">
        {isError ? (
          <div className="flex size-full items-center justify-center select-none">
            <span className="text-3xl">{alt.substring(0, 1).toUpperCase()}</span>
          </div>
        ) : (
          <Image
            className="rounded-full"
            src={avatar ? avatar : ''}
            alt={alt}
            fill
            onError={() => {
              setIsError(true);
            }}
          />
        )}
      </div>
    </div>
  );
}
