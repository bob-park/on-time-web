'use client';

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
    return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-100 bg-white px-1.5 text-sm text-slate-300 cursor-not-allowed';
  }
  if (active) {
    return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-800 bg-slate-800 px-2 text-sm text-white';
  }
  return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600 hover:bg-slate-50 active:scale-95 transition-[colors,transform] duration-100';
};

export default function Pagination({ currentPage, totalPages, total, pageSize, onPageChange }: PaginationProps) {
  const startItem = total === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, total);

  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
      <span className="text-sm text-slate-500">
        총 {total.toLocaleString()}건 중 {startItem}~{endItem}건 표시
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
            <span key={`ellipsis-${i}`} className="px-1 text-sm text-slate-400">
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
