import AllEmployeesGrid from '@/app/(manager)/attendance/view/_components/AllEmployeesGrid';
import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';
import PageHeader from '@/shared/components/PageHeader';

import { getTranslations } from 'next-intl/server';

export default async function AttendanceViewPage() {
  const t = await getTranslations('manager.attendance');

  return (
    <div className="flex h-full w-full max-w-screen-lg flex-col gap-2">
      <WorkingTimeProvider>
        <PageHeader eyebrow={t('eyebrow')} title={t('title')} actions={<WorkingTimeView />} />

        <div className="min-h-0 flex-1">
          <AllEmployeesGrid />
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
