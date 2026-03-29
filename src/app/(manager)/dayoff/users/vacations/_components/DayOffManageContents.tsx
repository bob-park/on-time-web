'use client';

import { useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { HiOutlineDocumentText } from 'react-icons/hi';

import { useUserLeaveEntries, useUsersUsedVacations } from '@/domain/user/query/user';

import dayjs from 'dayjs';

import DayOffViewContents from './DayOffViewContents';

export default function DayOffManageContents() {
  const [year, setYear] = useState<number>(dayjs().year());

  const { users, isLoading: isLoadingLeave } = useUserLeaveEntries({ year });
  const { usersUsedVacations, isLoading: isLoadingVacations } = useUsersUsedVacations({ year });
  const isLoading = isLoadingLeave || isLoadingVacations;

  const sortedUsers = [...users].sort((o1, o2) =>
    dayjs(o1.employment?.effectiveDate).isAfter(o2.employment?.effectiveDate) ? 1 : -1,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header zone */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <span className="text-[15px] font-semibold text-slate-800">임직원 휴가 사용 현황</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => setYear(year - 1)}
          >
            <IoIosArrowBack className="size-4" />
          </button>
          <span className="text-[15px] font-semibold text-slate-800 min-w-[64px] text-center">{year}년</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            onClick={() => setYear(year + 1)}
          >
            <IoIosArrowForward className="size-4" />
          </button>
        </div>
      </div>

      {/* Matrix zone */}
      <div className="overflow-x-auto">
        <table className="w-max border-collapse">
          <thead>
            <tr className="h-10 border-b border-slate-200 bg-slate-50">
              <th className="sticky left-0 z-20 bg-slate-50 w-12 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                순번
              </th>
              <th className="sticky left-[48px] z-20 bg-slate-50 w-20 px-3 border-r border-slate-200 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                성명
              </th>
              <th className="w-28 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                입사일
              </th>
              <th className="w-24 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                연차<span className="text-blue-400">(보상)</span>
              </th>
              <th className="w-24 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                전년차감
              </th>
              <th className="w-24 px-3 border-r border-slate-200 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                사용가능
              </th>
              {new Array(12).fill(null).map((_, i) => (
                <th
                  key={`th-month-${i}`}
                  className="w-16 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center"
                >
                  {i + 1}월
                </th>
              ))}
              <th className="w-24 px-3 border-l border-slate-200 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                합계
              </th>
              <th className="w-24 px-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-slate-500 text-center">
                잔여
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={20} className="py-8 text-center">
                  <div className="flex justify-center">
                    <div className="h-4 w-48 animate-pulse rounded bg-slate-200" />
                  </div>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={20} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineDocumentText className="size-10 text-slate-300" />
                    <p className="text-[15px] font-semibold text-slate-500">직원 데이터가 없습니다</p>
                    <p className="text-[13px] text-slate-400">연도를 변경하거나 직원 데이터를 확인해 주세요.</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedUsers.map((user, index) => (
                <DayOffViewContents
                  key={`dayoff-manage-contents-${user.id}`}
                  order={index + 1}
                  user={user}
                  usedVacations={
                    usersUsedVacations.find((item) => item.userUniqueId === user.id)?.usedVacations || []
                  }
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
