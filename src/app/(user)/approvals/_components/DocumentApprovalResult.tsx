'use client';

import { memo } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { useRouter } from 'next/navigation';

import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { useTranslations } from 'next-intl';

interface DocumentApprovalResultProps {
  items: ApprovalHistory[];
  isLoading: boolean;
}

const thClass =
  'text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase';

export default function DocumentApprovalResult({ items, isLoading }: DocumentApprovalResultProps) {
  const t = useTranslations('approvals');

  return (
    <div className="w-full overflow-x-auto select-none">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className={`w-[120px] ${thClass}`}>{t('colDocNo')}</th>
            <th className={`w-[150px] ${thClass}`}>{t('colCategory')}</th>
            <th className={`w-[130px] ${thClass}`}>{t('colStatus')}</th>
            <th className={`w-[160px] ${thClass}`}>{t('colApplicant')}</th>
            <th className={thClass}>{t('colDate')}</th>
            <th className={`w-14 ${thClass}`} />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item, index) => <ApprovalRow key={item.id ?? `row-${index}`} item={item} />)
          )}
        </tbody>
      </table>
    </div>
  );
}

const ApprovalRow = memo(function ApprovalRow({ item }: { item: ApprovalHistory }) {
  const t = useTranslations('approvals');
  const router = useRouter();

  const handleClick = () => {
    if (item.id === undefined) return;
    router.push(`/approvals/${item.id}`);
  };

  const statusForBadge: DocumentStatus =
    item.document.status === 'CANCELLED' ? 'CANCELLED' : (item.status ?? 'WAITING');

  return (
    <tr
      className="h-[52px] cursor-pointer border-b border-white/[0.04] transition-colors duration-100 last:border-b-0 hover:bg-white/[0.04]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={t('rowAria', { id: item.id ?? '' })}
    >
      <td className="text-base-content px-4 text-sm font-bold">{item.id !== undefined ? `#${item.id}` : '—'}</td>
      <td className="px-4">
        <DocumentsTypeBadge type={item.document.type} />
      </td>
      <td className="px-4">
        <DocumentStatusBadge status={statusForBadge} />
      </td>
      <td className="px-4">
        <div className="text-base-content text-sm">{item.document.user.username}</div>
        <div className="text-base-content/50 text-xs">{item.document.user.position.name}</div>
      </td>
      <td className="text-base-content/60 px-4 text-sm">
        {item.createdDate ? dayjs(item.createdDate).locale('ko').format('YYYY년 MM월 DD일') : '—'}
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
    { id: 'w-14', type: 'w-16', status: 'w-16', name: 'w-16', pos: 'w-20', date: 'w-24' },
    { id: 'w-12', type: 'w-[72px]', status: 'w-14', name: 'w-[60px]', pos: 'w-[72px]', date: 'w-[110px]' },
    { id: 'w-[52px]', type: 'w-16', status: 'w-12', name: 'w-14', pos: 'w-16', date: 'w-[96px]' },
    { id: 'w-14', type: 'w-14', status: 'w-[60px]', name: 'w-[68px]', pos: 'w-[52px]', date: 'w-[104px]' },
    { id: 'w-[44px]', type: 'w-[68px]', status: 'w-[52px]', name: 'w-[56px]', pos: 'w-[64px]', date: 'w-[92px]' },
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
            <div className={`mb-1 h-3.5 animate-pulse rounded bg-white/5 ${w.name}`} />
            <div className={`h-3 animate-pulse rounded bg-white/5 ${w.pos}`} />
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
  const t = useTranslations('approvals');
  return (
    <tr>
      <td colSpan={6} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <HiOutlineDocumentText className="text-base-content/20 size-10" />
          <p className="text-base-content/70 text-sm font-semibold">{t('emptyTitle')}</p>
          <p className="text-base-content/50 text-sm">{t('emptyDescription')}</p>
        </div>
      </td>
    </tr>
  );
}
