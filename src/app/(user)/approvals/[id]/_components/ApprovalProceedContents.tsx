'use client';

import { useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import { useApprovalDocument } from '@/domain/document/query/documents';

import ApproveModal from './ApproveModal';
import RejectModal from './RejectModal';

interface ApprovalProceedContentsProps {
  id: number;
  currentId: number;
}

export default function ApprovalProceedContents({ id, currentId }: ApprovalProceedContentsProps) {
  // state
  const [showApprove, setShowApprove] = useState<boolean>(false);
  const [showReject, setShowReject] = useState<boolean>(false);

  // query
  const { approvalHistory } = useApprovalDocument(id);

  return (
    <>
      <div className="flex w-full flex-col items-center justify-center gap-3">
        {/* 현재 결재 라인 상태 정보 */}
        <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
          {/* body */}
          <div className="card-body w-full">
            <div className="flex w-full flex-col gap-4">
              <div className="">
                <h3 className="text-lg font-medium">현재 결재 상태</h3>
              </div>
              <div className="h-32 w-full">
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
          </div>
        </div>

        {/* buttons */}
        <div className="flex w-full flex-row items-center justify-center gap-2">
          <button
            type="button"
            className="btn btn-secondary w-full flex-1"
            disabled={approvalHistory?.status !== 'WAITING'}
            onClick={() => setShowReject(true)}
          >
            <FaTimes className="size-5" />
            반려
          </button>
          <button
            type="button"
            className="btn btn-primary w-full flex-1"
            disabled={approvalHistory?.status !== 'WAITING'}
            onClick={() => setShowApprove(true)}
          >
            <FaCheck className="size-5" />
            승인
          </button>
        </div>
      </div>
      <ApproveModal show={showApprove} id={id} onClose={() => setShowApprove(false)} />
      <RejectModal show={showReject} id={id} onClose={() => setShowReject(false)} />
    </>
  );
}
