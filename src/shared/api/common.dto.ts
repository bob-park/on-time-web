type SearchPageParams = {
  page: number;
  size: number;
};

/**
 * Page Response
 */
interface PageMetadata {
  size: number;
  number: number;
  totalElements: number;
  totalPages: number;
}

interface PagedModel<T> {
  page: PageMetadata;
  content: T[];
}

/**
 * Page Response (on-time / e-work API — Spring Page 직렬화 형식)
 * auth-user API 만 PagedModel 을 반환한다.
 */
interface Pageable {
  pageNumber: number;
  pageSize: number;
}

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
  sort?: string[];
};

/**
 * ProblemDetail
 */
type ProblemDetail = {
  type: string;
  title: string;
  status: number;
  detail: string;
  code: string;
  timestamp: Date;
  exception: string;
};

export type { SearchPageParams, PageRequest, PageMetadata, PagedModel, Pageable, Page, ProblemDetail };
