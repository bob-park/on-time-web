'use client';

import { useState } from 'react';

import DocumentApprovalResult from '@/app/(user)/approvals/_components/DocumentApprovalResult';

import { useApprovalHistories } from '@/domain/approval/query/approvalHistory';

import Pagination from '@/shared/components/Pagination';
import PillFilter from '@/shared/components/PillFilter';

interface DocumentApprovalContentsProps {
  params: SearchDocumentApprovalHistoryRequest;
}

const CATEGORY_OPTIONS: { label: string; value: DocumentsType | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '휴가계', value: 'VACATION' },
  { label: '휴일근무보고서', value: 'OVERTIME_WORK' },
];

// No DRAFT on /approvals
const STATUS_OPTIONS: { label: string; value: DocumentStatus | undefined }[] = [
  { label: '전체', value: undefined },
  { label: '진행', value: 'WAITING' },
  { label: '승인', value: 'APPROVED' },
  { label: '반려', value: 'REJECTED' },
];

const PAGE_SIZE = 10;

export default function DocumentApprovalContents({ params }: DocumentApprovalContentsProps) {
  const [selectedType, setSelectedType] = useState<DocumentsType | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);

  const { page, isLoading } = useApprovalHistories({
    type: selectedType,
    status: selectedStatus,
    page: currentPage,
    size: PAGE_SIZE,
  });

  const total = page?.total ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / PAGE_SIZE);

  const handleTypeChange = (value: DocumentsType | undefined) => {
    setSelectedType(value);
    setCurrentPage(0);
  };

  const handleStatusChange = (value: DocumentStatus | undefined) => {
    setSelectedStatus(value);
    setCurrentPage(0);
  };

  return (
    <div className="flex size-full flex-col">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {/* Filters */}
        <div className="mb-5 flex flex-col gap-2.5 border-b border-slate-100 pb-4">
          <PillFilter
            label="구분"
            ariaLabel="문서 구분 필터"
            options={CATEGORY_OPTIONS}
            value={selectedType}
            onChange={handleTypeChange}
          />
          <PillFilter
            label="상태"
            ariaLabel="문서 상태 필터"
            options={STATUS_OPTIONS}
            value={selectedStatus}
            onChange={handleStatusChange}
          />
        </div>

        {/* Table */}
        <DocumentApprovalResult items={page?.content ?? []} isLoading={isLoading} />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
}
