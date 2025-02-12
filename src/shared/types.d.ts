import { StateCreator } from 'zustand';

declare module 'zustand' {
  type SlicePattern<T, S = T> = StateCreator<S & T, [['zustand/immer', never], ['zustand/devtools', never]], [], T>;
}

type SearchPageParams = {
  page: number;
  size: number;
}

interface Pageable {
  pageNumber: number;
  pageSize: number;
}

/**
 * Page Response
 */
interface Page<T> {
  content: T[];
  pageable: Pageable;
  total: number;
}

/**
 * Page Request
 */
type PageRequest = {
  page: number;
  size: number;
};
