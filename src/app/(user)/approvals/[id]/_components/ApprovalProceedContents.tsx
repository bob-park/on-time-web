'use client';

import { useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';

import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import { useApprovalDocument } from '@/domain/document/query/documents';

import { useTranslations } from 'next-intl';

import ApproveModal from './ApproveModal';
import CancelConfirmModal from './CancelConfirmModal';
import RejectModal from './RejectModal';

interface ApprovalProceedContentsProps {
  id: number;
  currentId: number;
}

export default function ApprovalProceedContents({ id, currentId }: ApprovalProceedContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');

  // state
  const [showApprove, setShowApprove] = useState<boolean>(false);
  const [showReject, setShowReject] = useState<boolean>(false);
  const [showCancel, setShowCancel] = useState<boolean>(false);

  // query
  const { approvalHistory } = useApprovalDocument(id);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-4">
        {/* 현재 결재 라인 상태 정보 */}
        <div className="bg-base-300 flex w-full flex-col gap-5 rounded-lg p-6">
          <h3 className="text-lg font-semibold">{t('statusTitle')}</h3>
          <div className="w-full py-2">
            <ApprovalLines
              lines={
                approvalHistory?.document.approvalHistories.map((item) => ({
                  id: item.approvalLine.id,
                  contents: item.approvalLine.contents,
                  status: item.status || 'NOT_YET',
                  reason: item.reason,
                })) || []
              }
              currentId={currentId}
            />
          </div>
        </div>

        {/* buttons */}
        <div className="bg-base-300 flex w-full flex-row items-center justify-center gap-6 rounded-lg p-6">
          <div className="flex-1">
            <button
              type="button"
              className="btn btn-ghost w-full"
              disabled={['CANCELLED', 'REJECTED'].includes(approvalHistory?.document.status || '')}
              onClick={() => setShowCancel(true)}
            >
              <GiCancel className="size-6" />
              {t('actions.cancel')}
            </button>
          </div>
          <div className="flex-1">
            <button
              type="button"
              className="btn btn-outline btn-error w-full"
              disabled={approvalHistory?.document.status === 'CANCELLED' || approvalHistory?.status !== 'WAITING'}
              onClick={() => setShowReject(true)}
            >
              <FaTimes className="size-5" />
              {t('actions.reject')}
            </button>
          </div>
          <div className="flex-1">
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={approvalHistory?.document.status === 'CANCELLED' || approvalHistory?.status !== 'WAITING'}
              onClick={() => setShowApprove(true)}
            >
              <FaCheck className="size-5" />
              {t('actions.approve')}
            </button>
          </div>
        </div>
      </div>
      <ApproveModal show={showApprove} id={id} onClose={() => setShowApprove(false)} />
      <RejectModal show={showReject} id={id} onClose={() => setShowReject(false)} />
      <CancelConfirmModal
        show={showCancel}
        documentId={approvalHistory?.document.id || -1}
        onClose={() => setShowCancel(false)}
      />
    </>
  );
}
