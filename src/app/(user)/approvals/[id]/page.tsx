import { getApprovalDetail } from '@/app/api/v1/documents/_lib/enrichDocument';
import {
  OverTimeWorkDocument as OverTimeWorkDocumentDto,
  VacationDocument as VacationDocumentDto,
} from '@/domain/document/apis/document.dto';
import OverTimeWorkDocument from '@/domain/document/components/OverTimeWorkDocument';
import VacationDocument from '@/domain/document/components/VacationDocument';
import PageHeader from '@/shared/components/PageHeader';
import dayjs from '@/shared/dayjs';

import { getTranslations } from 'next-intl/server';

import ApprovalProceedContents from './_components/ApprovalProceedContents';

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;
  const t = await getTranslations('approval.detail');
  const tf = await getTranslations('common.filter');

  const res = await getApprovalDetail(id);

  const isVacation = res.document.type === 'VACATION';
  const title = isVacation ? t('dayoffTitle') : t('overtimeTitle');

  return (
    <div className="animate-fade-up w-full">
      {/* eyebrow + title */}
      <PageHeader
        eyebrow={t('proceedEyebrow')}
        title={title}
        description={t('summary', {
          requester: res.document.user.username,
          type: isVacation ? tf('typeVacation') : tf('typeOvertime'),
          date: dayjs(res.document.createdDate).format('YYYY-MM-DD'),
        })}
      />

      {/* A4 문서 · 결재 패널 */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px] xl:items-start">
        {/* document — 1000px 고정이라 좁은 화면에서는 가로 스크롤 */}
        <div className="overflow-x-auto">
          <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_32px_rgba(0,0,0,0.08)]">
            {isVacation && (
              <VacationDocument id="approval_document_vacation_id" document={res.document as VacationDocumentDto} />
            )}
            {res.document.type === 'OVERTIME_WORK' && (
              <OverTimeWorkDocument
                id="approval_overtime_work_document_id"
                document={res.document as OverTimeWorkDocumentDto}
              />
            )}
          </div>
        </div>

        {/* 결재 진행 + 처리 */}
        <ApprovalProceedContents id={id} title={title} />
      </div>
    </div>
  );
}
