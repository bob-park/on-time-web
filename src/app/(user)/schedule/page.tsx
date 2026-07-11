import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';
import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

import AddScheduleButton from './_components/AddScheduleButton';
import ScheduleContents from './_components/ScheduleContents';

export default async function SchedulePage() {
  const t = await getTranslations('schedule');

  return (
    <div className="w-full">
      {/* eyebrow + title */}
      <PageHeader eyebrow={t('eyebrow')} title={t('title')} />

      <WorkingTimeProvider>
        <div className="overflow-x-auto">
          <div className="w-[1152px]">
            {/* toolbar: week navigator + add */}
            <div className="mb-6 flex w-full flex-row items-center justify-between gap-2">
              <div>
                <WorkingTimeView />
              </div>

              <AddScheduleButton />
            </div>

            {/* gantt timeline */}
            <ScheduleContents />
          </div>
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
