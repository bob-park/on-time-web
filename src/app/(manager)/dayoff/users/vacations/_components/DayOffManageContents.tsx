'use client';

import { useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { useUserLeaveEntries, useUsersUsedVacations } from '@/domain/user/query/user';

import dayjs from 'dayjs';

import DayOffViewContents from './DayOffViewContents';
import DayOffViewHeader from './DayOffViewHeader';

export default function DayOffManageContents() {
  // state
  const [year, setYear] = useState<number>(dayjs().year());

  // query
  const { users } = useUserLeaveEntries({ year });
  const { usersUsedVacations } = useUsersUsedVacations({ year });

  return (
    <div className="flex size-full max-w-[calc(100vw-400px)] flex-col gap-3">
      {/*  select year */}
      <div className="mt-3 w-full">
        <div className="flex flex-row items-center justify-center gap-10">
          <button className="btn btn-neutral" onClick={() => setYear(year - 1)}>
            <IoIosArrowBack className="size-6" />
          </button>
          <h3 className="text-2xl font-bold">{year}년</h3>
          <button className="btn btn-neutral" onClick={() => setYear(year + 1)}>
            <IoIosArrowForward className="size-6" />
          </button>
        </div>
      </div>

      {/* view */}
      <div className="flex w-full flex-col gap-3 overflow-auto">
        {/* headers */}
        <DayOffViewHeader />

        {/* users */}
        {users
          .sort((o1, o2) => (dayjs(o1.employment?.effectiveDate).isAfter(o2.employment?.effectiveDate) ? 1 : -1))
          .map((user, index) => (
            <DayOffViewContents
              key={`dayoff-manage-contents-${user.id}`}
              order={index + 1}
              user={user}
              usedVacations={usersUsedVacations.find((item) => item.userUniqueId === user.id)?.usedVacations || []}
            />
          ))}
      </div>
    </div>
  );
}
