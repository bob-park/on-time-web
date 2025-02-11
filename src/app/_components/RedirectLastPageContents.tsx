'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { useGetLastPage } from './lastPage';

export default function RedirectLastPageContents() {
  // hooks
  const getLastPage = useGetLastPage();

  // router
  const router = useRouter();

  // useEffect
  useEffect(() => {
    const lastPage = getLastPage();

    if (lastPage) {
      router.push(lastPage);
      return;
    }

    router.push('/dashboard');
  }, []);

  return <div className="invisible"></div>;
}
