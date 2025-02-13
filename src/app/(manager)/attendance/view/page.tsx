import { TbDownload } from 'react-icons/tb';

import WorkingUserContents from '@/app/(manager)/attendance/view/_components/WorkingUserContents';

import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

import SelectUsers, { SelectUserContextProvider } from './_components/SelectUsers';

export default function AttendanceViewPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">임직원 근무 현황</h2>
      </div>

      {/* contents */}

      <SelectUserContextProvider>
        <WorkingTimeProvider>
          <div className="mt-10 max-w-max">
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
                  <WorkingTimeView />
                </div>
                <div className="">
                  <button className="btn btn-neutral">
                    <TbDownload className="size-6" />
                    내보내기
                  </button>
                </div>
              </div>
            </div>

            {/* data contents */}
            <div className="mt-10">
              <WorkingUserContents />
            </div>
          </div>
        </WorkingTimeProvider>
      </SelectUserContextProvider>
    </div>
  );
}
