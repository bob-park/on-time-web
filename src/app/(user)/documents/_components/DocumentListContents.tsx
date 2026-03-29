'use client';

import { useState } from 'react';

import { useDocuments } from '@/domain/document/query/documents';

import DocumentResult from './DocumentResult';

interface DocumentListContentsProps {
  params: SearchDocumentRequest;
}

const CATEGORY_OPTIONS: { label: string; value: DocumentsType | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '휴가계', value: 'VACATION' },
  { label: '휴일근무보고서', value: 'OVERTIME_WORK' },
];

const STATUS_OPTIONS: { label: string; value: DocumentStatus | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '초안', value: 'DRAFT' },
  { label: '진행', value: 'WAITING' },
  { label: '승인', value: 'APPROVED' },
  { label: '반려', value: 'REJECTED' },
];

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

export default function DocumentListContents({ params }: DocumentListContentsProps) {
  const [selectedType, setSelectedType] = useState<DocumentsType | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);

  const { page, isLoading } = useDocuments({
    type: selectedType,
    status: selectedStatus,
    page: currentPage,
    size: 10,
  });

  const total = page?.total ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / 10);
  const startItem = total === 0 ? 0 : currentPage * 10 + 1;
  const endItem = Math.min((currentPage + 1) * 10, total);

  const handleTypeChange = (value: DocumentsType | undefined) => {
    setSelectedType(value);
    setCurrentPage(0);
  };

  const handleStatusChange = (value: DocumentStatus | undefined) => {
    setSelectedStatus(value);
    setCurrentPage(0);
  };

  const pillClass = (active: boolean) =>
    active
      ? 'bg-slate-800 text-white rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-100 cursor-pointer'
      : 'bg-slate-100 text-slate-600 rounded-full px-3.5 py-1.5 text-[13px] font-medium hover:bg-slate-200 transition-colors duration-100 cursor-pointer';

  const pageBtnClass = (active: boolean, isDisabled: boolean) => {
    if (isDisabled) {
      return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-100 bg-white px-1.5 text-[13px] text-slate-300 cursor-not-allowed';
    }
    if (active) {
      return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-800 bg-slate-800 px-2 text-[13px] text-white';
    }
    return 'flex h-8 min-w-[32px] items-center justify-center rounded-md border border-slate-200 bg-white px-2 text-[13px] text-slate-600 hover:bg-slate-50 transition-colors duration-100';
  };

  return (
    <div className="flex size-full flex-col">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Filters */}
        <div className="mb-5 flex flex-col gap-2.5 border-b border-slate-100 pb-4">
          <div role="group" aria-label="문서 구분 필터" className="flex flex-wrap items-center gap-2">
            <span className="w-[72px] flex-none text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              구분
            </span>
            {CATEGORY_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={selectedType === opt.value}
                className={pillClass(selectedType === opt.value)}
                onClick={() => handleTypeChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <div role="group" aria-label="문서 상태 필터" className="flex flex-wrap items-center gap-2">
            <span className="w-[72px] flex-none text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              상태
            </span>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                type="button"
                aria-pressed={selectedStatus === opt.value}
                className={pillClass(selectedStatus === opt.value)}
                onClick={() => handleStatusChange(opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <DocumentResult documents={page?.content ?? []} isLoading={isLoading} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-[13px] text-slate-500">
              총 {total.toLocaleString()}건 중 {startItem}~{endItem}건 표시
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => p - 1)}
                aria-label="이전 페이지"
                className={pageBtnClass(false, currentPage === 0)}
              >
                &lt;
              </button>
              {getPaginationPages(currentPage, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`ellipsis-${i}`} className="px-1 text-[13px] text-slate-400">
                    ···
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={pageBtnClass(p === currentPage, false)}
                    onClick={() => setCurrentPage(p as number)}
                  >
                    {(p as number) + 1}
                  </button>
                ),
              )}
              <button
                type="button"
                disabled={currentPage >= totalPages - 1}
                onClick={() => setCurrentPage((p) => p + 1)}
                aria-label="다음 페이지"
                className={pageBtnClass(false, currentPage >= totalPages - 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
