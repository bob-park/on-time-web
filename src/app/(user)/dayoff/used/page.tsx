import Link from 'next/link';

import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DayOffHistoryContents from './_components/DayOffHistoryContents';

export default async function DayOffHistoryPage() {
  const t = await getTranslations('dayoff.used');

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title + action */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        actions={
          <Link href="/dayoff/requests" className="btn btn-primary btn-sm">
            {t('requestAction')}
          </Link>
        }
      />

      {/* content */}
      <DayOffHistoryContents />
    </div>
  );
}
