'use client';

import { useState } from 'react';

import { FaFilePdf } from 'react-icons/fa';
import { IoNotifications } from 'react-icons/io5';
import { PiUploadFill } from 'react-icons/pi';

import RequestConfirmModal from '@/app/(user)/dayoff/[id]/_components/RequestConfirmModal';
import ApprovalLines from '@/domain/approval/components/ApprovalLines';
import VacationDocument from '@/domain/document/components/VacationDocument';
import { useVacationDocument } from '@/domain/document/query/vacation';
import delay from '@/utils/delay';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import PressApprovalModal from './PressApprovalModal';

interface DayOffDetailContentsProps {
  id: number;
}

const DEFAULT_VACATION_DOCUMENT_TAG_ID = 'vacation_document_id';

export default function DayOffDetailContents({ id }: DayOffDetailContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');

  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [showPress, setShowPress] = useState<boolean>(false);

  const [showRequest, setShowRequest] = useState<boolean>(false);

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

    Promise.all([import('html2canvas-pro'), import('jspdf')]).then(
      async ([{ default: html2canvas }, { default: jsPDF }]) => {
        const canvas = await html2canvas(docElement);
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(canvas, 'JPEG', 0, 0, 210, 297);
        pdf.save(
          `휴가계_${vacationDocument.user.username}_${dayjs(vacationDocument.startDate).format('YYYYMMDD')}.pdf`,
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

        {/* 휴가계 다운로드 버튼 */}
        <div className="bg-base-300 flex w-full flex-row items-center justify-center gap-6 rounded-lg p-6">
          <div className="flex-1">
            <button
              type="button"
              className="btn btn-outline btn-warning w-full"
              disabled={vacationDocument?.status !== 'WAITING'}
              onClick={() => setShowPress(true)}
            >
              <IoNotifications className="size-6" />
              {t('actions.press')}
            </button>
          </div>
          <div
            className={cx('flex-1', {
              tooltip: vacationDocument?.status !== 'DRAFT',
            })}
            data-tip={t('tooltip.alreadyRequested')}
          >
            <button
              type="button"
              className="btn btn-primary w-full"
              disabled={vacationDocument?.status !== 'DRAFT'}
              onClick={() => setShowRequest(true)}
            >
              <PiUploadFill className="size-6" />
              {t('actions.request')}
            </button>
          </div>
          <div
            className={cx('flex-1', {
              tooltip: vacationDocument?.status === 'DRAFT',
            })}
            data-tip={t('tooltip.draftNoDownload')}
          >
            <button
              type="button"
              className="btn btn-outline w-full"
              disabled={isPdfLoading || ['CANCELLED', 'REJECTED', 'DRAFT'].includes(vacationDocument?.status || '')}
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

        {/* 휴가계 정보 */}
        <div className="bg-base-300 flex w-full items-center justify-center rounded-lg p-6">
          <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
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

      <RequestConfirmModal show={showRequest} documentId={id} onClose={() => setShowRequest(false)} />
    </>
  );
}
