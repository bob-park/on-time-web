import { cookies } from 'next/headers';

import OverTimeWorkDocument from '@/domain/document/components/OverTimeWorkDocument';
import VacationDocument from '@/domain/document/components/VacationDocument';

import ApprovalProceedContents from './_components/ApprovalProceedContents';

const { WEB_SERVICE_HOST } = process.env;

export default async function ApprovalDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;

  const cookieStore = await cookies();

  const res = await fetch(`${WEB_SERVICE_HOST}/documents/approval/${id}`, {
    method: 'get',
    headers: {
      Cookie: `JSESSIONID=${cookieStore.get('JSESSIONID')?.value || ''}`,
    },
    credentials: 'include',
  })
    .then((res) => res.json())
    .then((data: ApprovalHistory) => data);

  return (
    <div className="flex size-full flex-col items-center gap-2">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">결재 처리 정보</h2>
      </div>

      {/* contents */}
      <div className="mt-5 flex w-full max-w-[1200px] flex-col items-center justify-center gap-3">
        {/* proceed buttons */}
        <div className="w-full">
          <ApprovalProceedContents id={id} currentId={res.approvalLine.id} />
        </div>

        {/* document info */}
        <div className="w-full">
          <div className="card bg-base-100 m-3 flex w-full flex-col items-center justify-center gap-4 shadow-xl">
            <div className="mt-2 aspect-[1/1.414] w-[1000px]">
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
