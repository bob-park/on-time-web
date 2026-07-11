import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';
import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import WeeklySummaryCards from './_componets/WeeklySummaryCards';
import WorkingRecordContents from './_componets/WorkingRecordContents';

export default async function DashboardPage() {
  const t = await getTranslations('dashboard');

  return (
    <div className="w-full">
      <WorkingTimeProvider>
        {/* eyebrow + title + week navigator */}
        <PageHeader eyebrow={t('eyebrow')} title={t('title')} actions={<WorkingTimeView />} />

        {/* summary row: hero + comp leave */}
        <WeeklySummaryCards />

        {/* weekly attendance table */}
        <div className="mt-4 w-full">
          <WorkingRecordContents />
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
