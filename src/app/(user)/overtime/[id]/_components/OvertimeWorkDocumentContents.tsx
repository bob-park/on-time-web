'use client';

import { useState } from 'react';

import { FaFilePdf } from 'react-icons/fa';
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
import { useTranslations } from 'next-intl';

interface OvertimeWorkDocumentContentsProps {
  id: number;
}

const DEFAULT_DOCUMENT_ID = 'overtime_work_document_id';

export default function OvertimeWorkDocumentContents({ id }: OvertimeWorkDocumentContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');

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

    Promise.all([import('html2canvas-pro'), import('jspdf')]).then(
      async ([{ default: html2canvas }, { default: jsPDF }]) => {
        const canvas = await html2canvas(docElement);
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas, 'JPEG', 0, 0, 210, 297);
        pdf.save(
          `휴일근무보고서_${overTimeWorkDocument.user.username}_${dayjs(overTimeWorkDocument.createdDate).format('YYYYMMDD')}.pdf`,
        );

        await delay(1_000);

        setIsPdfLoading(false);
      },
    );
  };

  return (
    <>
      <div className="flex size-full flex-col items-center justify-center gap-4">
        {/* 현재 결재 라인 상태 정보 */}
        <div className="bg-base-300 flex w-full flex-col gap-5 rounded-lg p-6">
          <h3 className="text-lg font-semibold">{t('statusTitle')}</h3>
          <div className="w-full py-2">
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

        {/* 휴가계 다운로드 버튼 */}
        <div className="bg-base-300 flex w-full flex-row items-center justify-center gap-6 rounded-lg p-6">
          <div className="flex-1">
            <button
              type="button"
              className="btn btn-outline btn-warning w-full"
              disabled={overTimeWorkDocument?.status !== 'WAITING'}
              onClick={() => setShowPress(true)}
            >
              <IoNotifications className="size-6" />
              {t('actions.press')}
            </button>
          </div>
          <div
            className={cx('flex-1', {
              tooltip: overTimeWorkDocument?.status !== 'DRAFT',
            })}
            data-tip={t('tooltip.alreadyRequested')}
          >
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={overTimeWorkDocument?.status !== 'DRAFT'}
              onClick={() => setShowRequest(true)}
            >
              <PiUploadFill className="size-6" />
              {t('actions.request')}
            </button>
          </div>
          <div
            className={cx('flex-1', {
              tooltip: overTimeWorkDocument?.status === 'DRAFT',
            })}
            data-tip={t('tooltip.draftNoDownload')}
          >
            <button
              type="button"
              className="btn btn-outline w-full"
              disabled={isPdfLoading || ['CANCELLED', 'REJECTED', 'DRAFT'].includes(overTimeWorkDocument?.status || '')}
              onClick={handlePdfDownloadClick}
            >
              {isPdfLoading ? (
                <>
                  <span className="loading loading-spinner" />
                  {t('actions.pdfLoading')}
                </>
              ) : (
                <>
                  <FaFilePdf className="size-6" />
                  {t('actions.pdf')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* 휴일 근무 보고서 정보 */}
        <div className="bg-base-300 flex w-full items-center justify-center rounded-lg p-6">
          <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
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
