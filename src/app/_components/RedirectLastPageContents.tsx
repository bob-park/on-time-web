'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { LOCAL_STORAGE_KEY_LAST_PAGE } from '@/app/_components/LastPageRecord';

export default function RedirectLastPageContents() {
  const lastPage = typeof window !== 'undefined' && localStorage.getItem(LOCAL_STORAGE_KEY_LAST_PAGE);

  // router
  const router = useRouter();

  // useEffect
  useEffect(() => {
    if (lastPage) {
      router.push(lastPage);
      return;
    }

    router.push('/dashboard');
  }, [lastPage]);

  return <div className="invisible"></div>;
}
