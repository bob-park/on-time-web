import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DocumentApprovalContents from './_components/DocumentApprovalContents';

export default async function ApprovalsPage() {
  const t = await getTranslations('approvals');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

      {/* content */}
      <DocumentApprovalContents />
    </div>
  );
}
