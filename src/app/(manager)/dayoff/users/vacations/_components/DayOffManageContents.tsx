'use client';

import { useState } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

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
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header zone */}
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <span className="text-[15px] font-semibold text-slate-800">임직원 휴가 사용 현황</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
            onClick={() => setYear(year - 1)}
          >
            <IoIosArrowBack className="size-4" />
          </button>
          <span className="min-w-[64px] text-center text-[15px] font-semibold text-slate-800">{year}년</span>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
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
              <th className="sticky left-0 z-20 w-12 bg-slate-50 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                순번
              </th>
              <th className="sticky left-[48px] z-20 w-20 border-r border-slate-200 bg-slate-50 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                성명
              </th>
              <th className="w-28 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                입사일
              </th>
              <th className="w-24 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                연차<span className="text-blue-400">(보상)</span>
              </th>
              <th className="w-24 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                전년차감
              </th>
              <th className="w-24 border-r border-slate-200 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                사용가능
              </th>
              {new Array(12).fill(null).map((_, i) => (
                <th
                  key={`th-month-${i}`}
                  className="w-16 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase"
                >
                  {i + 1}월
                </th>
              ))}
              <th className="w-24 border-l border-slate-200 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
                합계
              </th>
              <th className="w-24 px-3 text-center text-[11px] font-semibold tracking-[0.06em] text-slate-500 uppercase">
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
                  usedVacations={usersUsedVacations.find((item) => item.userUniqueId === user.id)?.usedVacations || []}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
