'use client';

import { useState } from 'react';

import { useBreadcrumbTitle } from '@/app/_layouts/breadcrumb';
import ApprovalStepper, { toDocumentSteps } from '@/domain/approval/components/ApprovalStepper';
import ApproveModal from '@/domain/document/components/ApproveModal';
import CancelConfirmModal from '@/domain/document/components/CancelConfirmModal';
import RejectModal from '@/domain/document/components/RejectModal';
import { useApprovalDocument } from '@/domain/document/queries/documents';
import Card from '@/shared/components/Card';

import { useTranslations } from 'next-intl';

interface ApprovalProceedContentsProps {
  id: number;
  title: string;
  // 지금 보고 있는 사람의 결재선 id — 스테퍼에서 "(나)" 로 표시한다.
  currentId?: number;
}

export default function ApprovalProceedContents({ id, title, currentId }: ApprovalProceedContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');

  // breadcrumb
  useBreadcrumbTitle(title);

  // state
  const [showApprove, setShowApprove] = useState<boolean>(false);
  const [showReject, setShowReject] = useState<boolean>(false);
  const [showCancel, setShowCancel] = useState<boolean>(false);

  // query
  const { approvalHistory } = useApprovalDocument(id);

  const doc = approvalHistory?.document;
  const steps = doc
    ? toDocumentSteps(doc, t('stepRequest')).map((step) =>
        step.id === currentId ? { ...step, role: `${step.role} ${t('me')}` } : step,
      )
    : [];

  // 결재 처리는 내 차례(WAITING)일 때만, 취소는 이미 종료된 문서에서는 불가
  const disabledProceed = doc?.status === 'CANCELLED' || approvalHistory?.status !== 'WAITING';
  const disabledCancel = ['CANCELLED', 'REJECTED'].includes(doc?.status || '');

  return (
    <div className="flex flex-col gap-4 2xl:sticky 2xl:top-4">
      {/* 결재 진행 */}
      <Card className="p-5">
        <h3 className="mb-2.5 text-[15px] font-semibold">{t('statusTitle')}</h3>
        <ApprovalStepper steps={steps} />
      </Card>

      {/* 처리 */}
      <Card className="flex flex-col gap-2 p-5">
        <div className="flex gap-2">
          <button
            type="button"
            className="btn btn-soft btn-error flex-1"
            disabled={disabledProceed}
            onClick={() => setShowReject(true)}
          >
            {t('actions.reject')}
          </button>
          <button
            type="button"
            className="btn btn-primary flex-[2]"
            disabled={disabledProceed}
            onClick={() => setShowApprove(true)}
          >
            {t('actions.approve')}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          disabled={disabledCancel}
          onClick={() => setShowCancel(true)}
        >
          {t('actions.cancel')}
        </button>
      </Card>

      <ApproveModal show={showApprove} id={id} onClose={() => setShowApprove(false)} />
      <RejectModal show={showReject} id={id} onClose={() => setShowReject(false)} />
      <CancelConfirmModal show={showCancel} documentId={doc?.id || -1} onClose={() => setShowCancel(false)} />
    </div>
  );
}
