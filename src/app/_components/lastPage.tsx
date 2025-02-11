'use client';

import { usePathname } from 'next/navigation';

export const LOCAL_STORAGE_KEY_LAST_PAGE = 'lastPage';

export function useSaveLastPage() {
  // router
  const pathname = usePathname();

  const save = () => {
    localStorage.setItem(LOCAL_STORAGE_KEY_LAST_PAGE, pathname);
  };

  return save;
}

export function useResetLastPage() {
  const remove = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_LAST_PAGE);
  };

  return remove;
}

export function useGetLastPage() {
  const getLastPage = () => {
    return localStorage.getItem(LOCAL_STORAGE_KEY_LAST_PAGE);
  };

  return getLastPage;
}
