import Link from 'next/link';

import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import OvertimeRequestContents from './_components/OvertimeRequestContents';

export default async function OvertimeRequestsPage() {
  const t = await getTranslations('overtime.request');

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title + action */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        actions={
          <Link href="/documents" className="btn btn-ghost btn-sm">
            {t('viewDocuments')} ›
          </Link>
        }
      />

      {/* request form */}
      <div className="w-full max-w-[800px]">
        <OvertimeRequestContents />
      </div>
    </div>
  );
}
