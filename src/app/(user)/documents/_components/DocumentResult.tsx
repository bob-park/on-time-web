'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { Document, DocumentsType } from '@/domain/document/apis/document.dto';
import CancelConfirmModal from '@/domain/document/components/CancelConfirmModal';
import DocumentPeriod, { documentSummary } from '@/domain/document/components/DocumentPeriod';
import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';
import { useRequestDocument } from '@/domain/document/queries/documents';
import { TableSkeletonRows, rowClass, tdClass, thClass } from '@/shared/components/Table';
import dayjs from '@/shared/dayjs';
import useToast from '@/shared/hooks/useToast';

import { useTranslations } from 'next-intl';

interface DocumentResultProps {
  documents: Document[];
  isLoading: boolean;
}

const DETAIL_PATH: Partial<Record<DocumentsType, string>> = {
  VACATION: 'dayoff',
  OVERTIME_WORK: 'overtime',
};

export default function DocumentResult({ documents, isLoading }: DocumentResultProps) {
  const t = useTranslations('documents');
  const router = useRouter();
  const { push } = useToast();

  // 취소는 확인 모달을 거친다 — 어떤 문서에 대해 열었는지
  const [cancelId, setCancelId] = useState<number | undefined>(undefined);

  const { request, isLoading: isRequesting } = useRequestDocument(
    () => push(t('toastRequested'), 'success'),
    () => push(t('toastRequestError'), 'error'),
  );

  const handleOpen = (doc: Document) => {
    const path = DETAIL_PATH[doc.type];

    if (!path) {
      return;
    }

    router.push(`/${path}/${doc.id}`);
  };

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={thClass}>{t('colDocument')}</th>
              <th className={`w-[140px] ${thClass}`}>{t('colStatus')}</th>
              <th className={`w-[200px] ${thClass}`}>{t('colPeriod')}</th>
              <th className={`w-[110px] ${thClass}`}>{t('colAction')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows cols={4} />
            ) : documents.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-3 px-4 py-10 text-center text-sm">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              documents.map((doc) => {
                const summary = documentSummary(doc);

                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-base-200 cursor-pointer ${rowClass}`}
                    onClick={() => handleOpen(doc)}
                    role="button"
                    tabIndex={0}
                    // 행 자신이 포커스된 경우에만 이동 — 내부 버튼의 keydown 은 무시한다.
                    onKeyDown={(e) => e.key === 'Enter' && e.target === e.currentTarget && handleOpen(doc)}
                    aria-label={t('rowAria', { id: doc.id })}
                  >
                    {/* 문서 */}
                    <td className={tdClass}>
                      <div className="flex min-w-0 items-center gap-2">
                        <DocumentsTypeBadge type={doc.type} />
                        {summary && <span className="truncate font-semibold">{summary}</span>}
                      </div>
                      <div className="text-3 mt-1 text-xs">
                        {t('requestedAt', { date: dayjs(doc.createdDate).format('YYYY.MM.DD') })}
                      </div>
                    </td>

                    {/* 상태 */}
                    <td className={tdClass}>
                      <DocumentStatusBadge status={doc.status} />
                    </td>

                    {/* 기간/일수 */}
                    <td className={`text-2 ${tdClass}`}>
                      <DocumentPeriod doc={doc} />
                    </td>

                    {/* 처리 */}
                    <td className={tdClass}>
                      {doc.status === 'DRAFT' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          disabled={isRequesting}
                          onClick={(e) => {
                            e.stopPropagation();
                            request({ id: doc.id });
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {t('actionRequest')}
                        </button>
                      )}
                      {doc.status === 'WAITING' && (
                        <button
                          type="button"
                          className="btn btn-sm btn-ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelId(doc.id);
                          }}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          {t('actionCancel')}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {cancelId !== undefined && (
        <CancelConfirmModal show documentId={cancelId} onClose={() => setCancelId(undefined)} />
      )}
    </>
  );
}
