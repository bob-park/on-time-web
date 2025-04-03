'use client';

import { useState } from 'react';

import { FaFilePdf } from 'react-icons/fa';
import { GiCancel } from 'react-icons/gi';

import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import VacationDocument from '@/domain/document/components/VacationDocument';
import { useVacationDocument } from '@/domain/document/query/vacation';

import delay from '@/utils/delay';

import dayjs from 'dayjs';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';

interface DayOffDetailContentsProps {
  id: number;
}

const DEFAULT_VACATION_DOCUMENT_TAG_ID = 'vacation_document_id';

export default function DayOffDetailContents({ id }: DayOffDetailContentsProps) {
  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

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
              <button type="button" className="btn btn-secondary w-full flex-1">
                <GiCancel className="size-6" />
                취소
              </button>
              <button
                type="button"
                className="btn btn-neutral w-full flex-1"
                disabled={isPdfLoading}
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
  );
}
