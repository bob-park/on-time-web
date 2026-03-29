'use client';

import { useGetCurrentUser } from '@/domain/user/query/user';

import dayjs from 'dayjs';

export default function UserLeaveEntryContents() {
  const { currentUser } = useGetCurrentUser();

  const leaveEntry = currentUser?.leaveEntry;
  const year = leaveEntry?.year || dayjs().year();
  const totalLeaveDays = leaveEntry?.totalLeaveDays ?? 0;
  const usedLeaveDays = leaveEntry?.usedLeaveDays ?? 0;
  const freeLeaveDays = totalLeaveDays - usedLeaveDays;
  const freeCompLeaveDays = (leaveEntry?.totalCompLeaveDays ?? 0) - (leaveEntry?.usedCompLeaveDays ?? 0);

  return (
    <div className="flex w-full flex-row gap-4">
      {/* 전체 연차 */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-gray-500">전체 연차</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {totalLeaveDays}
          <span className="ml-1 text-base font-normal text-gray-400">일</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">{year}년 기준</p>
      </div>

      {/* 사용 연차 */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-gray-500">사용 연차</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {usedLeaveDays}
          <span className="ml-1 text-base font-normal text-gray-400">일</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">누적 사용</p>
      </div>

      {/* 잔여 연차 — 강조 카드 */}
      <div className="flex-1 rounded-2xl bg-slate-800 p-5 text-white shadow-sm">
        <p className="text-xs font-medium text-slate-300">잔여 연차</p>
        <p className="mt-1 text-3xl font-bold">
          {freeLeaveDays}
          <span className="ml-1 text-base font-normal text-slate-300">일</span>
        </p>
        <p className="mt-1 text-xs text-slate-400">사용 가능</p>
      </div>

      {/* 보상 휴가 잔여 */}
      <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-medium text-gray-500">보상 휴가 잔여</p>
        <p className="mt-1 text-3xl font-bold text-gray-900">
          {freeCompLeaveDays}
          <span className="ml-1 text-base font-normal text-gray-400">일</span>
        </p>
        <p className="mt-1 text-xs text-gray-400">보상 휴가</p>
      </div>
    </div>
  );
}
