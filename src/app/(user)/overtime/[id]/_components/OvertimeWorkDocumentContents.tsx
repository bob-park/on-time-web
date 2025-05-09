'use client';

import { useState } from 'react';

import { FaFilePdf } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import { IoNotifications } from 'react-icons/io5';
import { PiUploadFill } from 'react-icons/pi';

import CancelConfirmModal from '@/app/(user)/approvals/[id]/_components/CancelConfirmModal';
import PressApprovalModal from '@/app/(user)/dayoff/[id]/_components/PressApprovalModal';
import RequestConfirmModal from '@/app/(user)/dayoff/[id]/_components/RequestConfirmModal';

import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import OverTimeWorkDocument from '@/domain/document/components/OverTimeWorkDocument';
import { useOverTimeWorkDocument } from '@/domain/document/query/overtime';

import delay from '@/utils/delay';

import cx from 'classnames';
import dayjs from 'dayjs';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface OvertimeWorkDocumentContentsProps {
  id: number;
}

const DEFAULT_DOCUMENT_ID = 'overtime_work_document_id';

export default function OvertimeWorkDocumentContents({ id }: OvertimeWorkDocumentContentsProps) {
  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [showPress, setShowPress] = useState<boolean>(false);
  const [showCancel, setShowCancel] = useState<boolean>(false);
  const [showRequest, setShowRequest] = useState<boolean>(false);

  // query
  const { overTimeWorkDocument } = useOverTimeWorkDocument(id);

  // handle
  const handlePdfDownloadClick = () => {
    if (!overTimeWorkDocument) {
      return;
    }

    const docElement = document.getElementById(DEFAULT_DOCUMENT_ID);
    if (!docElement) {
      return;
    }

    setIsPdfLoading(true);

    html2canvas(docElement).then(async (canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas, 'JPEG', 0, 0, 210, 297);
      pdf.save(
        `휴가계_${overTimeWorkDocument.user.username}_${dayjs(overTimeWorkDocument.createdDate).format('YYYYMMDD')}.pdf`,
      );

      await delay(1_000);

      setIsPdfLoading(false);
    });
  };

  return (
    <>
      <div className="flex size-full flex-col items-center justify-center gap-4">
        {/* 현재 결재 라인 상태 정보 */}
        <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
          {/* body */}
          <div className="card-body w-full">
            <div className="flex w-full flex-col gap-4">
              <div className="">
                <h3 className="text-lg font-medium">현재 결재 상태</h3>
              </div>
              <div className="h-24 w-full">
                <ApprovalLines
                  lines={
                    overTimeWorkDocument?.approvalHistories.map((item) => ({
                      id: item.approvalLine.id,
                      contents: item.approvalLine.contents,
                      status: item.status || 'NOT_YET',
                      reason: item.reason,
                    })) || []
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* 휴가계 다운로드 버튼 */}
        <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
          <div className="card-body w-full">
            <div className="mt-2 flex flex-col items-center justify-center gap-4">
              <div className="flex w-full flex-row items-center justify-center gap-10">
                <div className="flex-1">
                  <button
                    type="button"
                    className="btn btn-secondary w-full"
                    disabled={['CANCELLED', 'REJECTED'].includes(overTimeWorkDocument?.status || '')}
                    onClick={() => setShowCancel(true)}
                  >
                    <GiCancel className="size-6" />
                    취소
                  </button>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    className="btn btn-soft btn-warning w-full"
                    disabled={overTimeWorkDocument?.status !== 'WAITING'}
                    onClick={() => setShowPress(true)}
                  >
                    <IoNotifications className="size-6" />
                    빨리 진행시켜줘
                  </button>
                </div>
                <div
                  className={cx('flex-1', {
                    tooltip: overTimeWorkDocument?.status !== 'DRAFT',
                  })}
                  data-tip="이미 신청된 문서입니다."
                >
                  <button
                    type="button"
                    className="btn btn-soft btn-accent w-full"
                    disabled={overTimeWorkDocument?.status !== 'DRAFT'}
                    onClick={() => setShowRequest(true)}
                  >
                    <PiUploadFill className="size-6" />
                    신청하기
                  </button>
                </div>
                <div
                  className={cx('flex-1', {
                    tooltip: overTimeWorkDocument?.status === 'DRAFT',
                  })}
                  data-tip="초안인 경우 다운로드 받을 수 없습니다. 문서를 신청해주세요"
                >
                  <button
                    type="button"
                    className="btn btn-neutral w-full"
                    disabled={
                      isPdfLoading || ['CANCELLED', 'REJECTED', 'DRAFT'].includes(overTimeWorkDocument?.status || '')
                    }
                    onClick={handlePdfDownloadClick}
                  >
                    {isPdfLoading ? (
                      <>
                        <span className="loading loading-spinner" />
                        생성중
                      </>
                    ) : (
                      <>
                        <FaFilePdf className="size-6" />
                        PDF 다운로드
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 휴일 근무 보고서 정보 */}
        <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
          <div className="mt-2 aspect-[1/1.414] w-[1000px]">
            {overTimeWorkDocument && <OverTimeWorkDocument id={DEFAULT_DOCUMENT_ID} document={overTimeWorkDocument} />}
          </div>
        </div>
      </div>
      <PressApprovalModal
        show={showPress}
        approvalUserUniqueId={
          overTimeWorkDocument?.approvalHistories.find((item) => item.status === 'WAITING')?.approvalLine.userUniqueId
        }
        onClose={() => setShowPress(false)}
      />

      <RequestConfirmModal show={showRequest} documentId={id} onClose={() => setShowRequest(false)} />
      <CancelConfirmModal show={showCancel} documentId={id} onClose={() => setShowCancel(false)} />
    </>
  );
}
