'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import RedirectLastPageContents from './_components/RedirectLastPageContents';

export default function Home() {
  // router
  const router = useRouter();

  // useEffect
  useEffect(() => {
    // router.push('/dashboard');
  }, []);

  return (
    <div className="">
      main page 이다
      <RedirectLastPageContents />
    </div>
  );
}
