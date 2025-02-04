'use client';

import { useState } from 'react';

import { TbArrowBack } from 'react-icons/tb';

import Link from 'next/link';

import cx from 'classnames';

interface NotFoundTextProps {
  children: React.ReactNode;
  placeholder?: string;
}

function NotFoundItem({ children, placeholder }: NotFoundTextProps) {
  const [hover, setHover] = useState<boolean>(false);

  return (
    <div
      className="relative flex cursor-default select-none flex-col items-center justify-center text-9xl font-bold text-gray-400"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className={cx('rounded-2xl bg-white p-5 transition-all duration-500', {
          '-translate-y-20 scale-110 text-black shadow-2xl': hover,
        })}
      >
        {children}
      </div>
      {placeholder && (
        <div className={cx('absolute bottom-0 -z-10')}>
          <span className="text-lg">{placeholder}</span>
        </div>
      )}
    </div>
  );
}

export default function NotFound() {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-2">
      <div className="mt-36 flex cursor-default select-none flex-row items-center justify-center gap-4 text-9xl font-bold text-gray-400">
        <NotFoundItem placeholder="Oops">
          <span>4</span>
        </NotFoundItem>
        <NotFoundItem placeholder="Not Here...">
          <span>0</span>
        </NotFoundItem>
        <NotFoundItem placeholder="Sorry!!">
          <span>4</span>
        </NotFoundItem>
      </div>

      <div className="mt-5">
        <h2 className="text-2xl font-bold">PAGE NOT FOUND</h2>
      </div>

      <div className="mt-5">
        <p className="text-xl font-medium">
          아마도 페이지가
          <span className="px-1 text-2xl font-bold text-gray-500">공중분해</span>
          되었거나,
          <span className="px-1 text-2xl font-bold text-gray-500">폭파</span>
          되었어요!!
        </p>
      </div>

      <div className="mt-5">
        <Link className="btn btn-neutral" href="/dashboard">
          <TbArrowBack className="h-6 w-6" />
          돌아가기
        </Link>
      </div>
    </div>
  );
}
