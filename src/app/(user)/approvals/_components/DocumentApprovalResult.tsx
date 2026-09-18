'use client';

import { useState } from 'react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ApprovalHistory } from '@/domain/approval/apis/approval.dto';
import { DocumentStatus } from '@/domain/document/apis/document.dto';
import ApproveModal from '@/domain/document/components/ApproveModal';
import DocumentPeriod, { documentSummary } from '@/domain/document/components/DocumentPeriod';
import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import DocumentsTypeBadge from '@/domain/document/components/DocumentTypeBadge';
import RejectModal from '@/domain/document/components/RejectModal';
import Badge from '@/shared/components/Badge';
import { TableSkeletonRows, rowClass, tdClass, thClass } from '@/shared/components/Table';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

interface DocumentApprovalResultProps {
  items: ApprovalHistory[];
  isLoading: boolean;
}

export default function DocumentApprovalResult({ items, isLoading }: DocumentApprovalResultProps) {
  const t = useTranslations('approvals');
  const router = useRouter();

  // 인라인 처리 — 승인/반려 모달을 어떤 결재 이력에 대해 열었는지
  const [approveId, setApproveId] = useState<number | undefined>(undefined);
  const [rejectId, setRejectId] = useState<number | undefined>(undefined);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className={thClass}>{t('colDocument')}</th>
              <th className={`w-[160px] ${thClass}`}>{t('colRequester')}</th>
              <th className={`w-[200px] ${thClass}`}>{t('colPeriod')}</th>
              <th className={`w-[150px] ${thClass}`}>{t('colStatus')}</th>
              <th className={`w-[170px] ${thClass}`}>{t('colAction')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <TableSkeletonRows cols={5} />
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-3 px-4 py-10 text-center text-sm">
                  {t('empty')}
                </td>
              </tr>
            ) : (
              items.map((item, index) => {
                const summary = documentSummary(item.document);
                const detailHref = item.id === undefined ? undefined : `/approvals/${item.id}`;
                const isWaiting = item.status === 'WAITING' && item.document.status !== 'CANCELLED';
                const statusForBadge: DocumentStatus =
                  item.document.status === 'CANCELLED' ? 'CANCELLED' : (item.status ?? 'WAITING');

                return (
                  <tr
                    key={item.id ?? `row-${index}`}
                    className={`hover:bg-base-200 cursor-pointer ${rowClass}`}
                    onClick={() => detailHref && router.push(detailHref)}
                  >
                    {/* 문서 */}
                    <td className={tdClass}>
                      {detailHref ? (
                        // 셀 전체가 링크 — summary 가 없으면 DocumentsTypeBadge 의 문서 유형 라벨이 링크 텍스트가 된다.
                        <Link
                          href={detailHref}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary flex min-w-0 items-center gap-2 font-semibold hover:underline"
                        >
                          <DocumentsTypeBadge type={item.document.type} />
                          {summary && <span className="truncate">{summary}</span>}
                        </Link>
                      ) : (
                        <div className="flex min-w-0 items-center gap-2">
                          <DocumentsTypeBadge type={item.document.type} />
                          {summary && <span className="truncate font-semibold">{summary}</span>}
                        </div>
                      )}
                      <div className="text-3 mt-1 text-xs">
                        {item.createdDate
                          ? t('requestedAt', { date: dayjs(item.createdDate).format('YYYY.MM.DD') })
                          : '—'}
                      </div>
                    </td>

                    {/* 신청자 */}
                    <td className={tdClass}>
                      <div className="font-semibold">{item.document.user?.username}</div>
                      <div className="text-3 text-xs">{item.document.user?.groups?.[0]?.group.name}</div>
                    </td>

                    {/* 기간 */}
                    <td className={`text-2 ${tdClass}`}>
                      <DocumentPeriod doc={item.document} />
                    </td>

                    {/* 상태 */}
                    <td className={tdClass}>
                      {isWaiting ? (
                        <Badge variant="wait">{t('statusMine')}</Badge>
                      ) : (
                        <DocumentStatusBadge status={statusForBadge} />
                      )}
                    </td>

                    {/* 처리 */}
                    <td className={tdClass}>
                      {isWaiting && item.id !== undefined && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            className="btn btn-sm btn-ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRejectId(item.id);
                            }}
                          >
                            {t('actionReject')}
                          </button>
                          <button
                            type="button"
                            className="btn btn-sm btn-primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              setApproveId(item.id);
                            }}
                          >
                            {t('actionApprove')}
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {approveId !== undefined && <ApproveModal show id={approveId} onClose={() => setApproveId(undefined)} />}
      {rejectId !== undefined && <RejectModal show id={rejectId} onClose={() => setRejectId(undefined)} />}
    </>
  );
}
