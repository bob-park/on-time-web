'use client';

import { useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { useVacationDocuments } from '@/domain/document/query/vacation';
import { useGetCurrentUser } from '@/domain/user/query/user';

import dayjs from 'dayjs';

export default function DayOffHistoryContents() {
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const { vacationDocuments, isLoading } = useVacationDocuments({
    startDateFrom: `${selectedYear}-01-01`,
    endDateTo: `${selectedYear}-12-31`,
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });

  const { currentUser } = useGetCurrentUser();
  const leaveEntry = currentUser?.leaveEntry;
  const freeLeaveDays = (leaveEntry?.totalLeaveDays ?? 0) - (leaveEntry?.usedLeaveDays ?? 0);

  // 총 사용일 합산
  const totalUsedDays = vacationDocuments.reduce((sum, v) => sum + v.usedDays, 0);
  const totalGeneralDays = vacationDocuments
    .filter((v) => v.vacationType === 'GENERAL')
    .reduce((sum, v) => sum + v.usedDays, 0);
  const totalCompDays = vacationDocuments
    .filter((v) => v.vacationType === 'COMPENSATORY')
    .reduce((sum, v) => sum + v.usedDays, 0);

  const handleYearChange = (delta: number) => {
    setSelectedYear((y) => y + delta);
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 연도 네비게이터 */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors duration-150 hover:bg-gray-50"
          onClick={() => handleYearChange(-1)}
        >
          <IoIosArrowBack className="size-4" />
        </button>
        <span className="min-w-[4rem] text-center text-sm font-semibold text-gray-800">{selectedYear}년</span>
        <button
          type="button"
          className="flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors duration-150 hover:bg-gray-50"
          onClick={() => handleYearChange(1)}
        >
          <IoIosArrowForward className="size-4" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="flex w-full flex-row gap-4">
        {/* 총 사용일 */}
        <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-gray-500">총 사용일</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {totalUsedDays.toFixed(1)}
            <span className="ml-1 text-base font-normal text-gray-400">일</span>
          </p>
          <div className="mt-2 flex gap-2">
            {totalGeneralDays > 0 && (
              <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                연차 {totalGeneralDays.toFixed(1)}일
              </span>
            )}
            {totalCompDays > 0 && (
              <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">
                보상 {totalCompDays.toFixed(1)}일
              </span>
            )}
            {totalUsedDays === 0 && <span className="text-xs text-gray-400">사용 내역 없음</span>}
          </div>
        </div>

        {/* 잔여 연차 */}
        <div className="flex-1 rounded-2xl bg-slate-800 p-5 text-white shadow-sm">
          <p className="text-xs font-medium text-slate-300">잔여 연차</p>
          <p className="mt-1 text-3xl font-bold">
            {freeLeaveDays.toFixed(1)}
            <span className="ml-1 text-base font-normal text-slate-300">일</span>
          </p>
          <p className="mt-2 text-xs text-slate-400">다음 만료일 {selectedYear}년 12월 31일</p>
        </div>
      </div>

      {/* 상세 내역 테이블 */}
      <div className="w-full rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-4">
          <p className="text-sm font-semibold text-gray-800">상세 내역</p>
        </div>

        {/* 테이블 헤더 */}
        <div className="grid grid-cols-[3rem_7rem_6rem_10rem_5rem_1fr_6rem] items-center border-b border-gray-100 bg-gray-50 px-6 py-3 text-xs font-medium text-gray-500">
          <div>번호</div>
          <div>종류</div>
          <div>구분</div>
          <div>사용일</div>
          <div>사용일수</div>
          <div>비고</div>
          <div>상태</div>
        </div>

        {/* 테이블 바디 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">불러오는 중...</div>
        ) : vacationDocuments.length === 0 ? (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            {selectedYear}년 휴가 사용 내역이 없습니다.
          </div>
        ) : (
          vacationDocuments
            .sort((a, b) => (dayjs(a.startDate).isAfter(b.startDate) ? 1 : -1))
            .map((doc, index) => (
              <div
                key={`vacation-history-${doc.id}`}
                className="grid grid-cols-[3rem_7rem_6rem_10rem_5rem_1fr_6rem] items-center border-b border-gray-50 px-6 py-4 text-sm text-gray-700 transition-colors duration-150 last:border-0 hover:bg-gray-50"
              >
                {/* 번호 */}
                <div className="text-gray-400">{index + 1}</div>

                {/* 종류 */}
                <div>
                  <VacationTypeBadge type={doc.vacationType} />
                </div>

                {/* 구분 */}
                <div className="text-gray-600">
                  <VacationSubTypeText subType={doc.vacationSubType} />
                </div>

                {/* 사용일 */}
                <div className="text-gray-700">
                  {dayjs(doc.startDate).isSame(doc.endDate, 'day') ? (
                    dayjs(doc.startDate).format('YYYY.MM.DD')
                  ) : (
                    <>
                      {dayjs(doc.startDate).format('YYYY.MM.DD')}
                      <br />
                      <span className="text-gray-400">— {dayjs(doc.endDate).format('YYYY.MM.DD')}</span>
                    </>
                  )}
                </div>

                {/* 사용일수 */}
                <div className="font-medium text-gray-800">{doc.usedDays.toFixed(1)}일</div>

                {/* 비고 */}
                <div className="space-y-1">
                  {doc.reason && <p className="text-gray-600">{doc.reason}</p>}
                  {doc.usedCompLeaveEntries?.map((entry) => (
                    <p key={`comp-entry-${entry.id}`} className="text-xs text-gray-400">
                      {dayjs(entry.compLeaveEntry.effectiveDate).format('YYYY-MM-DD')} — {entry.compLeaveEntry.contents}
                    </p>
                  ))}
                </div>

                {/* 상태 */}
                <div>
                  <DocumentStatusBadge status={doc.status} />
                </div>
              </div>
            ))
        )}

      </div>
    </div>
  );
}

function VacationTypeBadge({ type }: { type: VacationType }) {
  switch (type) {
    case 'COMPENSATORY':
      return (
        <span className="rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700">보상휴가</span>
      );
    case 'OFFICIAL':
      return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">공가</span>;
    default:
      return <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">연차</span>;
  }
}

function VacationSubTypeText({ subType }: { subType?: VacationSubType }) {
  switch (subType) {
    case 'AM_HALF_DAY_OFF':
      return <span>오전 반차</span>;
    case 'PM_HALF_DAY_OFF':
      return <span>오후 반차</span>;
    default:
      return <span>종일</span>;
  }
}

function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  switch (status) {
    case 'APPROVED':
      return <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">승인됨</span>;
    case 'REJECTED':
      return <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">거절됨</span>;
    case 'WAITING':
      return (
        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700">대기 중</span>
      );
    case 'CANCELLED':
      return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">취소됨</span>;
    default:
      return <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">임시저장</span>;
  }
}
