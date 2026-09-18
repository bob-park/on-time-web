'use client';

import { useState } from 'react';

import cx from 'classnames';

interface CardPageTitleProps {
  children: React.ReactNode;
  placeholder?: string;
}

export default function CardPageTitle({ children, placeholder }: CardPageTitleProps) {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <div
      className="text-base-content/30 relative flex cursor-default flex-col items-center justify-center text-9xl font-bold select-none"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cx('bg-base-300 rounded-2xl p-5 transition-all duration-500', {
          'text-primary -translate-y-20 scale-110 shadow-2xl': hover,
        })}
      >
        {children}
      </div>
      {placeholder && (
        <div className="absolute bottom-0 -z-10 w-full text-center">
          <span className="text-lg">{placeholder}</span>
        </div>
      )}
    </div>
  );
}
