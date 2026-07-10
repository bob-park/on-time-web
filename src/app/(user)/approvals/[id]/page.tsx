import { cookies } from 'next/headers';

import OverTimeWorkDocument from '@/domain/document/components/OverTimeWorkDocument';
import VacationDocument from '@/domain/document/components/VacationDocument';
import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import ApprovalProceedContents from './_components/ApprovalProceedContents';

const { WEB_SERVICE_HOST } = process.env;

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;
  const t = await getTranslations('approval.detail');

  const cookieStore = await cookies();

  const res = await fetch(`${WEB_SERVICE_HOST}/documents/approval/${id}`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
  })
    .then((res) => res.json())
    .then((data: ApprovalHistory) => data);

  return (
    <div className="animate-fade-up flex size-full flex-col items-center gap-4">
      {/* eyebrow + title */}
      <div className="w-full max-w-[1200px]">
        <PageHeader eyebrow={t('proceedEyebrow')} title={t('proceedTitle')} />
      </div>

      {/* contents */}
      <div className="flex w-full max-w-[1200px] flex-col items-center justify-center gap-4">
        {/* proceed buttons */}
        <div className="w-full">
          <ApprovalProceedContents id={id} currentId={res.approvalLine.id} />
        </div>

        {/* document info */}
        <div className="w-full">
          <div className="bg-base-300 flex w-full items-center justify-center rounded-lg p-6">
            <div className="aspect-[1/1.414] w-[1000px] shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
              {res.document.type === 'VACATION' && (
                <VacationDocument id="approval_document_vacation_id" document={res.document as VacationDocument} />
              )}
              {res.document.type === 'OVERTIME_WORK' && (
                <OverTimeWorkDocument
                  id="approval_overtime_work_document_id"
                  document={res.document as OverTimeWorkDocument}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
