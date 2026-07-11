import Link from 'next/link';

import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import DayOffRequestContent from './_components/DayOffRequestContents';
import UserLeaveEntryContents from './_components/UserLeaveEntryContents';

export default async function DayOffRequestsPage() {
  const t = await getTranslations('dayoff.request');

  return (
    <div className="animate-fade-up flex size-full flex-col gap-4">
      {/* eyebrow + title + action */}
      <PageHeader
        eyebrow={t('eyebrow')}
        title={t('title')}
        actions={
          <Link href="/dayoff/used" className="btn btn-ghost btn-sm">
            {t('viewHistory')} ›
          </Link>
        }
      />

      {/* balance cards */}
      <UserLeaveEntryContents />

      {/* request form */}
      <DayOffRequestContent />
    </div>
  );
}
