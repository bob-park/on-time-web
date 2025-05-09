'use client';

import { useRouter } from 'next/navigation';

import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';

import dayjs from 'dayjs';
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';

timeago.register('ko', ko);

interface DocumentApprovalResultProps {
  items: ApprovalHistory[];
}

export default function DocumentApprovalResult({ items }: DocumentApprovalResultProps) {
  return (
    <div className="flex size-full flex-col gap-2 select-none">
      {/* headers */}
      <div className="flex h-12 flex-row items-center justify-center gap-4 border-b border-gray-300 text-center text-base font-semibold">
        <div className="w-24 flex-none">문서 결재 번호</div>
        <div className="w-32 flex-none">구분</div>
        <div className="w-40 flex-none">상태</div>
        <div className="w-40 flex-none">신청자</div>
        <div className="w-48 flex-none">요청일</div>
      </div>

      {/* items */}
      {items.map((item) => (
        <DocumentApprovalItem key={`document-approval-item-${item.id}`} item={item} />
      ))}
    </div>
  );
}

function DocumentApprovalItem({ item }: { item: ApprovalHistory }) {
  // hooks
  const router = useRouter();

  // handle
  const handleClick = () => {
    router.push(`/approvals/${item.id}`);
  };

  return (
    <div
      className="hover:bg-base-300 mx-2 my-1 flex h-12 cursor-pointer flex-row items-center justify-center gap-4 rounded-2xl text-center text-base font-semibold transition-all duration-150"
      onClick={handleClick}
    >
      <div className="w-24 flex-none">{item.id}</div>
      <div className="w-32 flex-none">
        <DocumentsTypeBadge type={item.document.type} />
      </div>
      <div className="w-40 flex-none">
        <DocumentStatusBadge status={item.document.status === 'CANCELLED' ? 'CANCELLED' : item.status || 'WAITING'} />
      </div>
      <div className="w-40 flex-none font-normal">
        <p className="">
          <span className="font-semibold">{item.document.user.username}</span>
          <span className="mx-1 text-sm">{item.document.user.position.name}</span>
        </p>
      </div>
      <div className="w-48 flex-none font-normal">
        <div className="tooltip" data-tip={dayjs(item.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
          <TimeAgo locale="ko" datetime={item.createdDate || new Date()} />
        </div>
      </div>
    </div>
  );
}
