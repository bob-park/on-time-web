'use client';

import { useEffect } from 'react';

import { TbArrowBack, TbRefresh } from 'react-icons/tb';

import Link from 'next/link';

export default function ManagerError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('Unhandled error:', error);
  }, [error]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-4 p-8">
      <div className="flex flex-col items-center gap-2">
        <h2 className="text-2xl font-bold text-slate-900">문제가 발생했습니다</h2>
        <p className="text-sm text-slate-500">
          일시적인 오류가 발생했습니다. 다시 시도하거나 대시보드로 돌아가 주세요.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button className="btn btn-neutral" onClick={reset}>
          <TbRefresh className="h-5 w-5" />
          다시 시도
        </button>
        <Link className="btn" href="/dashboard">
          <TbArrowBack className="h-5 w-5" />
          대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
