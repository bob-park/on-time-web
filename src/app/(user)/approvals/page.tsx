import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DocumentApprovalContents from './_components/DocumentApprovalContents';

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, type, status } = await searchParams;
  const t = await getTranslations('approvals');

  const params: SearchDocumentApprovalHistoryRequest = {
    page: parseInt(page || '0', 0),
    size: 10,
    type: type as DocumentsType,
    status: status as DocumentStatus,
  };

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} subtitle={t('subtitle')} />

      {/* content */}
      <div className="w-full min-w-[600px]">
        <DocumentApprovalContents params={params} />
      </div>
    </div>
  );
}
