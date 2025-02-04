import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import WorkingRecordContents from './_componets/WorkingRecordContents';

export default function DashboardPage() {
  return (
    <div className="flex size-full flex-col items-center justify-start gap-3">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">근로 시간</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-full">
        <WorkingTimeProvider>
          <div className="flex w-full max-w-[860px] flex-col items-center justify-center gap-1">
            <WorkingTimeView />
            <div className="w-full">
              <WorkingRecordContents />
            </div>
          </div>
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
