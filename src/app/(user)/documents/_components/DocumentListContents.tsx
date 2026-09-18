'use client';

import { useState } from 'react';

import { DocumentStatus, DocumentsType, SearchDocumentRequest } from '@/domain/document/apis/document.dto';
import { useDocuments } from '@/domain/document/queries/documents';
import Pagination from '@/shared/components/Pagination';
import Segment from '@/shared/components/Segment';

import { useTranslations } from 'next-intl';

import DocumentResult from './DocumentResult';

interface DocumentListContentsProps {
  params: SearchDocumentRequest;
}

const PAGE_SIZE = 10;

export default function DocumentListContents({ params }: DocumentListContentsProps) {
  const t = useTranslations('documents');
  const tf = useTranslations('common.filter');

  const categoryOptions: { label: string; value: DocumentsType | undefined }[] = [
    { label: tf('all'), value: undefined },
    { label: tf('typeVacation'), value: 'VACATION' },
    { label: tf('typeOvertime'), value: 'OVERTIME_WORK' },
  ];

  const statusOptions: { label: string; value: DocumentStatus | undefined }[] = [
    { label: tf('all'), value: undefined },
    { label: tf('statusDraft'), value: 'DRAFT' },
    { label: tf('statusWaiting'), value: 'WAITING' },
    { label: tf('statusApproved'), value: 'APPROVED' },
    { label: tf('statusRejected'), value: 'REJECTED' },
  ];

  const [selectedType, setSelectedType] = useState<DocumentsType | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<DocumentStatus | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(0);

  const { page, isLoading } = useDocuments({
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
    <div className="animate-fade-up bg-base-300 w-full rounded-lg p-5">
      {/* Filters */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <Segment
          ariaLabel={t('categoryFilterAria')}
          options={categoryOptions}
          value={selectedType}
          onChange={handleTypeChange}
        />
        <Segment
          ariaLabel={t('statusFilterAria')}
          options={statusOptions}
          value={selectedStatus}
          onChange={handleStatusChange}
        />
      </div>

      {/* Table */}
      <DocumentResult documents={page?.content ?? []} isLoading={isLoading} />

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
