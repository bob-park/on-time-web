'use client';

import { useState } from 'react';

import { DocumentStatus, DocumentsType } from '@/domain/document/apis/document.dto';
import { useDocuments } from '@/domain/document/queries/documents';
import Card from '@/shared/components/Card';
import Pagination from '@/shared/components/Pagination';
import Segment from '@/shared/components/Segment';

import { useTranslations } from 'next-intl';

import DocumentResult from './DocumentResult';

const PAGE_SIZE = 10;

export default function DocumentListContents() {
  const t = useTranslations('documents');
  const tf = useTranslations('common.filter');

  const statusOptions: { label: string; value: DocumentStatus | undefined }[] = [
    { label: tf('all'), value: undefined },
    { label: tf('statusDraft'), value: 'DRAFT' },
    { label: tf('statusWaiting'), value: 'WAITING' },
    { label: tf('statusApproved'), value: 'APPROVED' },
    { label: tf('statusRejected'), value: 'REJECTED' },
  ];

  const categoryOptions: { label: string; value: DocumentsType | undefined }[] = [
    { label: tf('all'), value: undefined },
    { label: tf('typeVacation'), value: 'VACATION' },
    { label: tf('typeOvertime'), value: 'OVERTIME_WORK' },
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
    <div className="animate-fade-up w-full">
      {/* filters */}
      <div className="mb-3.5 flex flex-wrap items-center gap-2">
        <span className="text-3 text-xs font-semibold">{tf('statusLabel')}</span>
        <Segment
          ariaLabel={t('statusFilterAria')}
          options={statusOptions}
          value={selectedStatus}
          onChange={handleStatusChange}
        />
        <span className="text-3 ml-1 text-xs font-semibold">{tf('categoryLabel')}</span>
        <Segment
          ariaLabel={t('categoryFilterAria')}
          options={categoryOptions}
          value={selectedType}
          onChange={handleTypeChange}
        />
      </div>

      {/* table */}
      <Card>
        <DocumentResult documents={page?.content ?? []} isLoading={isLoading} />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </Card>
    </div>
  );
}
