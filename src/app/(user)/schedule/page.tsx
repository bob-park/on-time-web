import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import AddScheduleButton from './_components/AddScheduleButton';
import ScheduleContents from './_components/ScheduleContents';

export default function SchedulePage() {
  return (
    <div className="flex size-full flex-col items-start justify-start gap-3">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">근무 일정</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-[1152px]">
        <WorkingTimeProvider>
          <div className="flex size-full flex-row items-center justify-between gap-2">
            <div className="">
              <WorkingTimeView />
            </div>

            <AddScheduleButton />
          </div>
          <div className="mt-10">
            <ScheduleContents />
          </div>
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
