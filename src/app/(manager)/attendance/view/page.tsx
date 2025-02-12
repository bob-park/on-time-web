import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import SelectUsers from './_components/SelectUsers';

export default function AttendanceViewPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">임직원 근무 현황</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-full">
        {/* user select */}
        <div className="">
          <SelectUsers />
        </div>

        {/* date time view */}
        <div className="mt-5">
          <WorkingTimeProvider>
            <WorkingTimeView />
          </WorkingTimeProvider>
        </div>
      </div>
    </div>
  );
}
