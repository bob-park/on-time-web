'use client';

import { useState } from 'react';

import RequestConfirmModal from '@/app/(user)/dayoff/[id]/_components/RequestConfirmModal';
import { useBreadcrumbTitle } from '@/app/_layouts/breadcrumb';
import ApprovalStepper, { toDocumentSteps } from '@/domain/approval/components/ApprovalStepper';
import VacationDocument from '@/domain/document/components/VacationDocument';
import { useVacationDocument } from '@/domain/document/queries/vacation';
import Card from '@/shared/components/Card';
import PageHeader from '@/shared/components/PageHeader';
import dayjs from '@/shared/dayjs';
import delay from '@/utils/delay';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

import PressApprovalModal from './PressApprovalModal';

interface DayOffDetailContentsProps {
  id: number;
}

const DEFAULT_VACATION_DOCUMENT_TAG_ID = 'vacation_document_id';

export default function DayOffDetailContents({ id }: DayOffDetailContentsProps) {
  // i18n
  const t = useTranslations('approval.detail');
  const tf = useTranslations('common.filter');

  // breadcrumb
  useBreadcrumbTitle(t('dayoffTitle'));

  // state
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);
  const [showPress, setShowPress] = useState<boolean>(false);

  const [showRequest, setShowRequest] = useState<boolean>(false);

  // query
  const { vacationDocument } = useVacationDocument(id);

  const steps = vacationDocument ? toDocumentSteps(vacationDocument, t('stepRequest')) : [];

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
      {/* eyebrow + title + PDF */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('dayoffTitle')}
        description={
          vacationDocument
            ? t('summary', {
                requester: vacationDocument.user.username,
                type: tf('typeVacation'),
                date: dayjs(vacationDocument.createdDate).format('YYYY-MM-DD'),
              })
            : undefined
        }
        actions={
          <div
            className={cx({
              tooltip: vacationDocument?.status === 'DRAFT',
            })}
            data-tip={t('tooltip.draftNoDownload')}
          >
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              disabled={isPdfLoading || ['CANCELLED', 'REJECTED', 'DRAFT'].includes(vacationDocument?.status || '')}
              onClick={handlePdfDownloadClick}
            >
              {isPdfLoading && <span className="loading loading-spinner loading-xs" />}
              {isPdfLoading ? t('actions.pdfLoading') : t('actions.pdf')}
            </button>
          </div>
        }
      />

      {/* A4 문서 · 결재 패널 */}
      <div className="grid grid-cols-1 gap-5 2xl:grid-cols-[1000px_360px] 2xl:items-start">
        {/* document — 1000px 고정이라 좁은 화면에서는 가로 스크롤 */}
        <div className="overflow-x-auto">
          <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {vacationDocument && <VacationDocument id={DEFAULT_VACATION_DOCUMENT_TAG_ID} document={vacationDocument} />}
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
                {t('actions.request')}
              </button>
            </div>
            <button
              type="button"
              className="btn btn-subtle"
              disabled={vacationDocument?.status !== 'WAITING'}
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
          vacationDocument?.approvalHistories.find((item) => item.status === 'WAITING')?.approvalLine.userUniqueId
        }
        onClose={() => setShowPress(false)}
      />

      <RequestConfirmModal show={showRequest} documentId={id} onClose={() => setShowRequest(false)} />
    </>
  );
}
