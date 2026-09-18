'use client';

import { useEffect, useSyncExternalStore } from 'react';

// 상세 페이지가 breadcrumb 끝에 붙이는 문서 제목. provider 없이 모듈 단위 store 로 관리한다.
let title: string | undefined = undefined;
const listeners = new Set<() => void>();

function setTitle(next?: string) {
  title = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

// 마운트 시 제목을 걸고, 언마운트 시 지운다.
export function useBreadcrumbTitle(value?: string) {
  useEffect(() => {
    setTitle(value);

    // 다음 상세 페이지가 이미 제목을 건 뒤라면 지우지 않는다.
    return () => {
      if (title === value) {
        setTitle(undefined);
      }
    };
  }, [value]);
}

export function useBreadcrumbTitleValue() {
  return useSyncExternalStore(
    subscribe,
    () => title,
    () => undefined,
  );
}
