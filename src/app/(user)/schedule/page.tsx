import { IoAddCircle } from 'react-icons/io5';

import Link from 'next/link';

import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

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

            <Link className="btn btn-primary" href="/schedule/add" scroll={false}>
              <IoAddCircle className="size-6" />
              추가
            </Link>
          </div>
          <div className="mt-10">
            <ScheduleContents />
          </div>
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
