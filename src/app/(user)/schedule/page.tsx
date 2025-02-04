import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import ScheduleContents from './_components/ScheduleContents';

export default function SchedulePage() {
  return (
    <div className="flex size-full flex-col items-center justify-start gap-3">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">근무 일정</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-full">
        <WorkingTimeProvider>
          <div className="flex size-full flex-row items-center justify-between gap-2">
            <div className="">
              <WorkingTimeView />
            </div>

            <div className="">
              <button className="btn btn-primary">추가</button>
            </div>
          </div>
          <div className="mt-10">
            <ScheduleContents />
          </div>
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
