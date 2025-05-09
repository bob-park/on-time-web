'use client';

import { useRouter } from 'next/navigation';

import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';

import dayjs from 'dayjs';
import TimeAgo from 'timeago-react';
import * as timeago from 'timeago.js';
import ko from 'timeago.js/lib/lang/ko';

timeago.register('ko', ko);

interface DocumentResultProps {
  documents: Document[];
}

export default function DocumentResult({ documents }: DocumentResultProps) {
  return (
    <div className="flex size-full flex-col gap-2 select-none">
      {/* headers */}
      <div className="flex h-12 flex-row items-center justify-center gap-4 border-b border-gray-300 text-center text-base font-semibold">
        <div className="w-24 flex-none">문서 번호</div>
        <div className="w-32 flex-none">구분</div>
        <div className="w-40 flex-none">상태</div>
        <div className="w-48 flex-none">요청일</div>
      </div>

      {/* items */}
      {documents.map((document) => (
        <DocumentItem key={`document-result-${document.id}`} document={document} />
      ))}
    </div>
  );
}

function DocumentItem({ document }: { document: Document }) {
  // hooks
  const router = useRouter();

  // handle
  const handleClick = () => {
    switch (document.type) {
      case 'VACATION': {
        router.push(`/dayoff/${document.id}`);
        break;
      }
      case 'OVERTIME_WORK': {
        router.push(`/overtime/${document.id}`);
        break;
      }
      default:
        break;
    }
  };

  return (
    <div
      className="hover:bg-base-300 mx-2 my-1 flex h-12 cursor-pointer flex-row items-center justify-center gap-4 rounded-2xl text-center text-base font-semibold transition-all duration-150"
      onClick={handleClick}
    >
      <div className="w-24 flex-none">{document.id}</div>
      <div className="w-32 flex-none">
        <DocumentsTypeBadge type={document.type} />
      </div>
      <div className="w-40 flex-none">
        <DocumentStatusBadge status={document.status} />
      </div>
      <div className="w-48 flex-none font-normal">
        <div className="tooltip" data-tip={dayjs(document.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
          <TimeAgo locale="ko" datetime={document.createdDate} />
        </div>
      </div>
    </div>
  );
}
