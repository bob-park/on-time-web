'use client';

import { useEffect } from 'react';

import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

import { useResetLastPage, useSaveLastPage } from '@/app/_components/lastPage';

import { useStore } from '@/shared/rootStore';

import { getDaysOfWeek } from '@/utils/parse';

import { useGetResultAttendanceRecord, useRecordAttendance } from '@/domain/attendance/query/AttendanceRecord';
import cx from 'classnames';
import dayjs from 'dayjs';

interface AttendanceRecordResultProps {
  result?: AttendanceRecord;
}

function AttendanceRecordResult({ result }: AttendanceRecordResultProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* icon */}
      <div className={cx(result ? 'text-green-600' : 'text-red-600')}>
        {result ? <FaCheckCircle className="h-24 w-24" /> : <FaTimesCircle className="h-24 w-24" />}
      </div>

      {/* contents */}
      <div className="w-full">
        {result ? (
          <div className="flex w-full flex-col items-center justify-start gap-2">
            {/* 출근 / 퇴근 */}
            <div className="">
              <h2 className="text-lg font-bold">
                {result.clockInTime && !result.clockOutTime && '출근 처리되었습니다.'}
                {result.clockInTime && result.clockOutTime && '퇴근 처리되었습니다.'}
              </h2>
            </div>

            {/* 근무일 */}
            <div className="flex w-full items-center justify-start gap-3">
              <div className="w-32 flex-none text-right">근무일 : </div>
              <div className="text-left">
                <span>{dayjs(result.workingDate).format('YYYY년 MM월 DD일')}</span>
                <span className="ml-1">({getDaysOfWeek(dayjs(result.workingDate).day())})</span>
              </div>
            </div>

            {/* 출근 시간 */}
            <div className="flex w-full items-center justify-start gap-3">
              <div className="w-32 flex-none text-right">출근 시간 : </div>
              <div className="text-left">
                <span>{dayjs(result.clockInTime).format('YYYY년 MM월 DD일')}</span>
                <span className="ml-1">({getDaysOfWeek(dayjs(result.clockInTime).day())})</span>
                <span> </span>
                <span className="">{dayjs(result.clockInTime).format('HH:mm:ss')}</span>
              </div>
            </div>

            {/* 퇴근 예정 시간 */}
            <div className="flex w-full items-center justify-start gap-3">
              <div className="w-32 flex-none text-right">퇴근 예정 시간 : </div>
              <div className="text-left">
                <span>{dayjs(result.leaveWorkAt).format('YYYY년 MM월 DD일')}</span>
                <span className="ml-1">({getDaysOfWeek(dayjs(result.leaveWorkAt).day())})</span>
                <span> </span>
                <span className="">{dayjs(result.leaveWorkAt).format('HH:mm:ss')}</span>
              </div>
            </div>

            {/* 퇴근 시간 */}
            {result.clockOutTime && (
              <div className="flex items-center justify-start gap-3">
                <div className="w-32 flex-none text-right">퇴근 시간 : </div>
                <div className="text-left">
                  <span>{dayjs(result.clockOutTime).format('YYYY년 MM월 DD일')}</span>
                  <span className="ml-1">({getDaysOfWeek(dayjs(result.clockOutTime).day())})</span>
                  <span> </span>
                  <span className="">{dayjs(result.clockOutTime).format('HH:mm:ss')}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="">
            <h3 className="text-lg font-bold">잘못된 접근입니다.</h3>
          </div>
        )}
      </div>
    </div>
  );
}

interface AttendanceRecordContentsProps {
  checkId: string;
}

export default function AttendanceRecordContents({ checkId }: AttendanceRecordContentsProps) {
  // store
  const currentUser = useStore((state) => state.currentUser);

  // hooks
  const saveLastPage = useSaveLastPage();
  const resetLastPage = useResetLastPage();

  // query
  const { result } = useGetResultAttendanceRecord({ checkId, userUniqueId: currentUser?.uniqueId || '' });
  const { record, isLoading } = useRecordAttendance();

  // useEffect
  useEffect(() => {
    saveLastPage();

    return () => {
      resetLastPage();
    };
  }, []);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    record({ checkId, userUniqueId: currentUser.uniqueId });
  }, [currentUser]);

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3">
      <div className="mt-6">
        {/* 처리 결과 표시 */}
        {isLoading && !result && (
          <div className="mt-10 flex h-56 flex-col items-center justify-center gap-3">
            <span className="loading loading-infinity loading-lg"></span>
          </div>
        )}

        {!isLoading && currentUser && <AttendanceRecordResult result={result} />}
      </div>
    </div>
  );
}
