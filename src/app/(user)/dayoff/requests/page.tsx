import Link from 'next/link';

import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DayOffRequestContent from './_components/DayOffRequestContents';

export default async function DayOffRequestsPage() {
  const t = await getTranslations('dayoff.request');

  return (
    <div className="animate-fade-up flex size-full flex-col">
      {/* eyebrow + title + action */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        description={t('description')}
        actions={
          <Link href="/dayoff/used" className="btn btn-ghost btn-sm">
            {t('viewHistory')} ›
          </Link>
        }
      />

      {/* request form */}
      <DayOffRequestContent />
    </div>
  );
}
