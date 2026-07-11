'use client';

import { useTranslations } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getPaginationPages(currentPage: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i);
  }
  if (currentPage <= 1) {
    return [0, 1, 2, '...', totalPages - 1];
  }
  if (currentPage >= totalPages - 2) {
    return [0, '...', totalPages - 3, totalPages - 2, totalPages - 1];
  }
  const showLeftEllipsis = currentPage - 1 > 1;
  const showRightEllipsis = currentPage + 1 < totalPages - 2;
  const result: (number | '...')[] = [0];
  if (showLeftEllipsis) result.push('...');
  result.push(currentPage - 1, currentPage, currentPage + 1);
  if (showRightEllipsis) result.push('...');
  result.push(totalPages - 1);
  return result;
}

const pageBtnClass = (active: boolean, isDisabled: boolean) => {
  if (isDisabled) {
    return 'flex h-8 min-w-8 items-center justify-center rounded-full bg-base-300 px-2 text-sm text-base-content/30 cursor-not-allowed';
  }
  if (active) {
    return 'flex h-8 min-w-8 items-center justify-center rounded-full bg-primary px-2 text-sm font-bold text-primary-content';
  }
  return 'flex h-8 min-w-8 items-center justify-center rounded-full bg-base-300 px-2 text-sm text-base-content hover:bg-base-content/10 active:scale-95 transition-[colors,transform] duration-100';
};

export default function Pagination({ currentPage, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  // hooks
  const t = useTranslations('common');

  const startItem = total === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="border-base-content/10 mt-4 flex items-center justify-between border-t pt-4">
      <span className="text-base-content/60 text-sm">
        {t('total', { count: total })} · {startItem}–{endItem}
      </span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          aria-label="이전 페이지"
          className={pageBtnClass(false, currentPage === 0)}
        >
          &lt;
        </button>
        {getPaginationPages(currentPage, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="text-base-content/40 px-1 text-sm">
              ···
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={pageBtnClass(p === currentPage, false)}
              onClick={() => onPageChange(p as number)}
            >
              {(p as number) + 1}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          aria-label="다음 페이지"
          className={pageBtnClass(false, currentPage >= totalPages - 1)}
        >
          &gt;
        </button>
      </div>
    </div>
  );
}
