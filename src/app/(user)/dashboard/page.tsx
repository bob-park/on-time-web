import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import WeeklySummaryCards from './_componets/WeeklySummaryCards';
import WorkingRecordContents from './_componets/WorkingRecordContents';

export default function DashboardPage() {
  return (
    <div className="flex size-full flex-col items-start justify-start gap-2">
      <WorkingTimeProvider>
        {/* breadcrumb + title + date nav */}
        <div className="flex w-full items-end justify-between">
          <div className="w-full">
            <h2 className="mt-1 text-2xl font-bold text-gray-900">근로 시간</h2>
          </div>
          <WorkingTimeView />
        </div>

        {/* summary cards */}
        <div className="mt-4 w-full">
          <WeeklySummaryCards />
        </div>

        {/* attendance table */}
        <div className="w-full">
          <WorkingRecordContents />
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
