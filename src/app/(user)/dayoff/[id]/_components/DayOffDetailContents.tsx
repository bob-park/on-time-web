'use client';

import { useState } from 'react';

import { FaFilePdf } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';
import { IoNotifications } from 'react-icons/io5';

import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import VacationDocument from '@/domain/document/components/VacationDocument';
import { useVacationDocument } from '@/domain/document/query/vacation';

import delay from '@/utils/delay';

import dayjs from 'dayjs';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

import CancelConfirmModal from './CancelConfirmModal';
import PressApprovalModal from './PressApprovalModal';

interface DayOffDetailContentsProps {
  id: number;
}

const DEFAULT_VACATION_DOCUMENT_TAG_ID = 'vacation_document_id';

export default function DayOffDetailContents({ id }: DayOffDetailContentsProps) {
  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [showPress, setShowPress] = useState<boolean>(false);
  const [showCancel, setShowCancel] = useState<boolean>(false);

  // query
  const { vacationDocument } = useVacationDocument(id);

  // handle
  const handlePdfDownloadClick = () => {
    if (!vacationDocument) {
      return;
    }

    const docElement = document.getElementById(DEFAULT_VACATION_DOCUMENT_TAG_ID);
    if (!docElement) {
      return;
    }

    setIsPdfLoading(true);

    html2canvas(docElement).then(async (canvas) => {
      const pdf = new jsPDF('p', 'mm', 'a4');
      pdf.addImage(canvas, 'JPEG', 0, 0, 210, 297);
      pdf.save(`휴가계_${vacationDocument.user.username}_${dayjs(vacationDocument.startDate).format('YYYYMMDD')}.pdf`);

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
                    vacationDocument?.approvalHistories.map((item) => ({
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
                <button
                  type="button"
                  className="btn btn-secondary w-full flex-1"
                  disabled={vacationDocument?.status === 'CANCELLED'}
                  onClick={() => setShowCancel(true)}
                >
                  <GiCancel className="size-6" />
                  취소
                </button>
                <button
                  type="button"
                  className="btn btn-soft btn-warning w-full flex-1"
                  disabled={vacationDocument?.status !== 'WAITING'}
                  onClick={() => setShowPress(true)}
                >
                  <IoNotifications className="size-6" />
                  빨리 진행시켜줘
                </button>
                <button
                  type="button"
                  className="btn btn-neutral w-full flex-1"
                  disabled={isPdfLoading || ['CANCELLED', 'REJECTED'].includes(vacationDocument?.status || '')}
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

        {/* 휴가계 정보 */}
        <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
          <div className="mt-2 aspect-[1/1.414] w-[1000px]">
            {vacationDocument && <VacationDocument id={DEFAULT_VACATION_DOCUMENT_TAG_ID} document={vacationDocument} />}
          </div>
        </div>
      </div>

      <PressApprovalModal
        show={showPress}
        approvalUserUniqueId={
          vacationDocument?.approvalHistories.find((item) => item.status === 'WAITING')?.approvalLine.userUniqueId
        }
        onClose={() => setShowPress(false)}
      />

      <CancelConfirmModal show={showCancel} documentId={id} onClose={() => setShowCancel(false)} />
    </>
  );
}
