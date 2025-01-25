'use client';

import cx from 'classnames';

interface UserAvatarProps {
  avatar?: string;
  alt: string;
}

export default function UserAvatar({ avatar, alt }: UserAvatarProps) {
  return (
    <div className={cx('avatar', 'online', !avatar && 'placeholder')}>
      <div className="w-12 rounded-full bg-neutral text-neutral-content">
        {avatar ? (
          <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" alt={alt} />
        ) : (
          <span className="text-3xl">{alt.substring(0, 1).toUpperCase()}</span>
        )}
      </div>
    </div>
  );
}
