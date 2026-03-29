'use client';

import { useRouter } from 'next/navigation';

import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';

import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { HiOutlineDocumentText } from 'react-icons/hi';

interface DocumentApprovalResultProps {
  items: ApprovalHistory[];
  isLoading: boolean;
}

export default function DocumentApprovalResult({ items, isLoading }: DocumentApprovalResultProps) {
  return (
    <div className="w-full select-none overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="h-10 border-b border-slate-200 bg-slate-50">
            <th className="w-[110px] px-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              문서번호
            </th>
            <th className="w-[110px] px-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              구분
            </th>
            <th className="w-[110px] px-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              상태
            </th>
            <th className="w-[140px] px-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              신청자
            </th>
            <th className="px-3 text-left text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500">
              요청일
            </th>
            <th className="w-14 px-3" />
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <SkeletonRows />
          ) : items.length === 0 ? (
            <EmptyState />
          ) : (
            items.map((item, index) => (
              <ApprovalRow key={item.id ?? `row-${index}`} item={item} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function ApprovalRow({ item }: { item: ApprovalHistory }) {
  const router = useRouter();

  const handleClick = () => {
    if (item.id === undefined) return;
    router.push(`/approvals/${item.id}`);
  };

  const statusForBadge: DocumentStatus =
    item.document.status === 'CANCELLED' ? 'CANCELLED' : (item.status ?? 'WAITING');

  return (
    <tr
      className="h-[52px] cursor-pointer border-b border-slate-100 transition-colors duration-100 hover:bg-slate-50 last:border-b-0"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`결재 ${item.id ?? ''} 상세 보기`}
    >
      <td className="px-3 text-[13px] font-semibold text-slate-500">
        {item.id !== undefined ? `#${item.id}` : '—'}
      </td>
      <td className="px-3">
        <DocumentsTypeBadge type={item.document.type} />
      </td>
      <td className="px-3">
        <DocumentStatusBadge status={statusForBadge} />
      </td>
      <td className="px-3">
        <div className="text-[13px] text-slate-800">{item.document.user.username}</div>
        <div className="text-[11px] text-slate-400">{item.document.user.position.name}</div>
      </td>
      <td className="px-3 text-[13px] text-slate-500">
        {item.createdDate
          ? dayjs(item.createdDate).locale('ko').format('YYYY년 MM월 DD일')
          : '—'}
      </td>
      <td className="px-3 text-center">
        <button
          type="button"
          aria-label="결재 상세 보기"
          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-[13px] text-slate-500 transition-colors duration-100 hover:bg-slate-50"
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
}

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
        <tr key={i} className="h-[52px] border-b border-slate-100 last:border-b-0">
          <td className="px-3">
            <div className={`h-3.5 animate-pulse rounded bg-slate-200 ${w.id}`} />
          </td>
          <td className="px-3">
            <div className={`h-5 animate-pulse rounded-full bg-slate-200 ${w.type}`} />
          </td>
          <td className="px-3">
            <div className={`h-5 animate-pulse rounded-full bg-slate-200 ${w.status}`} />
          </td>
          <td className="px-3">
            <div className={`mb-1 h-3.5 animate-pulse rounded bg-slate-200 ${w.name}`} />
            <div className={`h-3 animate-pulse rounded bg-slate-200 ${w.pos}`} />
          </td>
          <td className="px-3">
            <div className={`h-3.5 animate-pulse rounded bg-slate-200 ${w.date}`} />
          </td>
          <td className="px-3 text-center">
            <div className="mx-auto h-7 w-7 animate-pulse rounded-md bg-slate-200" />
          </td>
        </tr>
      ))}
    </>
  );
}

function EmptyState() {
  return (
    <tr>
      <td colSpan={6} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <HiOutlineDocumentText className="size-10 text-slate-300" />
          <p className="text-[15px] font-semibold text-slate-500">결재 문서가 없습니다</p>
          <p className="text-[13px] text-slate-400">조건에 맞는 문서가 없습니다</p>
        </div>
      </td>
    </tr>
  );
}
