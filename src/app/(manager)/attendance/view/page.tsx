import { TbDownload } from 'react-icons/tb';

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
        <div className="flex flex-row items-center justify-start gap-2">
          <div className="w-32 flex-none text-right">임직원 :</div>
          <div className="">
            <SelectUsers />
          </div>
        </div>

        {/* date time view */}
        <div className="mt-5">
          <div className="flex flex-row items-center justify-between gap-2">
            <div className="">
              <WorkingTimeProvider>
                <WorkingTimeView />
              </WorkingTimeProvider>
            </div>
            <div className="">
              <button className="btn btn-neutral">
                <TbDownload className="size-6" />
                내보내기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
