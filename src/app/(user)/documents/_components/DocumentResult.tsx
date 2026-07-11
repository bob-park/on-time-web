'use client';

import { memo } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { useRouter } from 'next/navigation';

import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useTranslations } from 'next-intl';

interface DocumentResultProps {
  documents: Document[];
  isLoading: boolean;
}

const thClass =
  'text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase';

export default function DocumentResult({ documents, isLoading }: DocumentResultProps) {
  const t = useTranslations('documents');

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={`w-[120px] ${thClass}`}>{t('colDocNo')}</th>
            <th className={`w-[150px] ${thClass}`}>{t('colCategory')}</th>
            <th className={`w-[130px] ${thClass}`}>{t('colStatus')}</th>
            <th className={thClass}>{t('colDate')}</th>
            <th className={`w-14 ${thClass}`} />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : documents.length === 0 ? (
            <EmptyState />
          ) : (
            documents.map((document) => <DocumentRow key={document.id} document={document} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

const DocumentRow = memo(function DocumentRow({ document }: { document: Document }) {
  const t = useTranslations('documents');
  const router = useRouter();

  const handleClick = () => {
    switch (document.type) {
      case 'VACATION':
        router.push(`/dayoff/${document.id}`);
        break;
      case 'OVERTIME_WORK':
        router.push(`/overtime/${document.id}`);
        break;
      default:
        break;
    }
  };

  return (
    <tr
      className="h-[52px] cursor-pointer border-b border-white/[0.04] transition-colors duration-100 last:border-b-0 hover:bg-white/[0.04]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={t('rowAria', { id: document.id })}
    >
      <td className="text-base-content px-4 text-sm font-bold">#{document.id}</td>
      <td className="px-4">
        <DocumentsTypeBadge type={document.type} />
      </td>
      <td className="px-4">
        <DocumentStatusBadge status={document.status} />
      </td>
      <td className="text-base-content/60 px-4 text-sm">
        {dayjs(document.createdDate).locale('ko').format('YYYY년 MM월 DD일')}
      </td>
      <td className="px-4 text-center">
        <button
          type="button"
          aria-label={t('moreAria')}
          className="text-base-content/60 hover:text-base-content mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-colors duration-100 hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
        >
          ···
        </button>
      </td>
    </tr>
  );
});

function SkeletonRows() {
  const widths = [
    { id: 'w-14', type: 'w-16', status: 'w-16', date: 'w-24' },
    { id: 'w-12', type: 'w-[72px]', status: 'w-14', date: 'w-[110px]' },
    { id: 'w-[52px]', type: 'w-16', status: 'w-12', date: 'w-[96px]' },
    { id: 'w-14', type: 'w-14', status: 'w-[60px]', date: 'w-[104px]' },
    { id: 'w-[44px]', type: 'w-[68px]', status: 'w-[52px]', date: 'w-[92px]' },
  ];
  return (
    <>
      {widths.map((w, i) => (
        <tr key={i} className="h-[52px] border-b border-white/[0.04] last:border-b-0">
          <td className="px-4">
            <div className={`h-3.5 animate-pulse rounded bg-white/5 ${w.id}`} />
          </td>
          <td className="px-4">
            <div className={`h-5 animate-pulse rounded-full bg-white/5 ${w.type}`} />
          </td>
          <td className="px-4">
            <div className={`h-5 animate-pulse rounded-full bg-white/5 ${w.status}`} />
          </td>
          <td className="px-4">
            <div className={`h-3.5 animate-pulse rounded bg-white/5 ${w.date}`} />
          </td>
          <td className="px-4 text-center">
            <div className="mx-auto h-8 w-8 animate-pulse rounded-full bg-white/5" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  const t = useTranslations('documents');
  return (
    <tr>
      <td colSpan={5} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <HiOutlineDocumentText className="text-base-content/20 size-10" />
          <p className="text-base-content/70 text-sm font-semibold">{t('emptyTitle')}</p>
          <p className="text-base-content/50 text-sm">{t('emptyDescription')}</p>
        </div>
      </td>
    </tr>
  );
}
