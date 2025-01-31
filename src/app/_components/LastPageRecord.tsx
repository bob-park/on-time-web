'use client';

import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

export const LOCAL_STORAGE_KEY_LAST_PAGE = 'lastPage';

export default function LastPageRecord() {
  // pathname
  const pathname = usePathname();

  // useEffect
  useEffect(() => {
    if (pathname === '/') {
      // localStorage.setItem(LOCAL_STORAGE_KEY_LAST_PAGE, '');
      return;
    }

    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_PAGE, pathname);
  }, [pathname]);

  return <div className="invisible"></div>;
}
