'use client';

import { useState } from 'react';

import PressApprovalModal from '@/app/(user)/dayoff/[id]/_components/PressApprovalModal';
import RequestConfirmModal from '@/app/(user)/dayoff/[id]/_components/RequestConfirmModal';
import { useBreadcrumbTitle } from '@/app/_layouts/breadcrumb';
import ApprovalStepper, { toDocumentSteps } from '@/domain/approval/components/ApprovalStepper';
import OverTimeWorkDocument from '@/domain/document/components/OverTimeWorkDocument';
import { useOverTimeWorkDocument } from '@/domain/document/queries/overtime';
import Card from '@/shared/components/Card';
import PageHeader from '@/shared/components/PageHeader';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

interface OvertimeWorkDocumentContentsProps {
  id: number;
}

const DEFAULT_DOCUMENT_ID = 'overtime_work_document_id';

export default function OvertimeWorkDocumentContents({ id }: OvertimeWorkDocumentContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');
  const tf = useTranslations('common.filter');

  // breadcrumb
  useBreadcrumbTitle(t('overtimeTitle'));

  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [showPress, setShowPress] = useState<boolean>(false);
  const [showRequest, setShowRequest] = useState<boolean>(false);

  // query
  const { overTimeWorkDocument } = useOverTimeWorkDocument(id);

  const steps = overTimeWorkDocument ? toDocumentSteps(overTimeWorkDocument, t('stepRequest')) : [];

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
      {/* eyebrow + title + PDF */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('overtimeTitle')}
        description={
          overTimeWorkDocument
            ? t('summary', {
                requester: overTimeWorkDocument.user.username,
                type: tf('typeOvertime'),
                date: dayjs(overTimeWorkDocument.createdDate).format('YYYY-MM-DD'),
              })
            : undefined
        }
        actions={
          <div
            className={cx({
              tooltip: overTimeWorkDocument?.status === 'DRAFT',
            })}
            data-tip={t('tooltip.draftNoDownload')}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={isPdfLoading || ['CANCELLED', 'REJECTED', 'DRAFT'].includes(overTimeWorkDocument?.status || '')}
              onClick={handlePdfDownloadClick}
            >
              {isPdfLoading && <span className="loading loading-spinner loading-xs" />}
              {isPdfLoading ? t('actions.pdfLoading') : t('actions.pdf')}
            </button>
          </div>
        }
      />

      {/* A4 문서 · 결재 패널 */}
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1fr_360px] 2xl:items-start">
        {/* document — 1000px 고정이라 좁은 화면에서는 가로 스크롤 */}
        <div className="overflow-x-auto">
          <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {overTimeWorkDocument && <OverTimeWorkDocument id={DEFAULT_DOCUMENT_ID} document={overTimeWorkDocument} />}
          </div>
        </div>

        <div className="flex flex-col gap-4 2xl:sticky 2xl:top-4">
          {/* 결재 진행 */}
          <Card className="p-5">
            <h3 className="mb-2.5 text-[15px] font-semibold">{t('statusTitle')}</h3>
            <ApprovalStepper steps={steps} />
          </Card>

          {/* 처리 */}
          <Card className="flex flex-col gap-2 p-5">
            <div
              className={cx({
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
                {t('actions.request')}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-subtle"
              disabled={overTimeWorkDocument?.status !== 'WAITING'}
              onClick={() => setShowPress(true)}
            >
              {t('actions.press')}
            </button>
          </Card>
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
    </>
  );
}
