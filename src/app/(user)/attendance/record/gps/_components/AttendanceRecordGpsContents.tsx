'use client';

import { useEffect, useState } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { GiNightSleep } from 'react-icons/gi';

import useGps from '@/domain/attendance/hooks/useGps';
import { useGenerateCurrentCheck, useGetCurrentCheck } from '@/domain/attendance/query/attendanceCheck';
import { useGetAttendanceGps } from '@/domain/attendance/query/attendanceGps';
import { useGetAttendanceRecord, useRecordAttendance } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';

import { isSameMarginOfError } from '@/utils/dataUtils';
import { getDaysOfWeek, round } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

export default function AttendanceRecordGpsContents() {
  const now = dayjs();

  // state
  const [selectGpsId, setSelectGpsId] = useState<number>();
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_IN');

  // hooks
  const { isSupport, position } = useGps();

  // query
  const { currentUser } = useGetCurrentUser();
  const { gpsResult } = useGetAttendanceGps();
  const { currentCheck } = useGetCurrentCheck();
  const { generateCheck, isLoading } = useGenerateCurrentCheck();
  const {
    record,
    isLoading: isRecording,
    error: recordErr,
  } = useRecordAttendance(() => {
    reloadRecord();
  });
  const { attendanceRecords, reloadRecord } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: now.format('YYYY-MM-DD'),
    endDate: now.format('YYYY-MM-DD'),
  });

  const attendanceResult = attendanceRecords[0];

  // useEffect
  useEffect(() => {
    generateCheck({ type: 'GPS', attendanceType: selectType });
    setSelectGpsId(gpsResult[0]?.id);
  }, [gpsResult && gpsResult.length > 0]);

  useEffect(() => {
    generateCheck({ type: 'GPS', attendanceType: selectType });
  }, [selectType]);

  useEffect(() => {
    if (!currentCheck) {
      return;
    }

    const intervalId = setInterval(() => {
      if (dayjs(currentCheck.expiredDate).isBefore(dayjs())) {
        generateCheck({ type: 'QR', attendanceType: selectType });
      }
    }, 1_000);

    return () => {
      clearInterval(intervalId);
    };
  }, [currentCheck, selectType]);

  // handle
  const handleRecord = () => {
    currentCheck && record({ checkId: currentCheck.id });
  };

  return (
    <div className="flex size-full flex-col items-center justify-center gap-3">
      <div className="w-full">
        {/* 장소 */}
        <div className="mt-5 flex h-12 w-full items-center justify-center gap-3">
          <div className="flex-none text-right">장소 : </div>
          <div className="flex flex-row items-center justify-center gap-3">
            {gpsResult.map((gps) => (
              <button
                key={`gps-location-id-${gps.id}`}
                className={cx('btn', { 'btn-neutral': gps.id === selectGpsId })}
                onClick={() => setSelectGpsId(gps.id)}
              >
                {gps.name}
              </button>
            ))}
          </div>
        </div>

        {/* 출퇴근 버튼 */}
        <div className="mt-10 flex w-full flex-row items-center justify-center gap-3">
          <button
            className={cx('btn btn-lg', { 'btn-primary': selectType === 'CLOCK_IN' })}
            onClick={() => setSelectType('CLOCK_IN')}
          >
            출근
          </button>
          <button
            className={cx('btn btn-lg', { 'btn-primary': selectType === 'CLOCK_OUT' })}
            onClick={() => setSelectType('CLOCK_OUT')}
          >
            퇴근
          </button>
        </div>

        {/* 정보 */}
        {isLoading && (
          <div className="mt-10 flex h-28 flex-col items-center justify-center gap-3">
            <span className="loading loading-infinity loading-lg"></span>
          </div>
        )}

        <div className="mt-10 flex flex-col items-center justify-center gap-3">
          <div className="flex flex-col items-center justify-start gap-1">
            {!isLoading && currentCheck && (
              <>
                <div className="flex items-center justify-start gap-3">
                  <div className="flex-none text-right">근무일 : </div>
                  <div className="text-left">
                    <span>{dayjs(currentCheck.workingDate).format('YYYY년 MM월 DD일')}</span>
                    <span className="ml-1">({getDaysOfWeek(dayjs(currentCheck.workingDate).day())})</span>
                  </div>
                </div>
                <div className="flex items-center justify-start gap-3">
                  <div className="flex-none text-right">생성일 : </div>
                  <div className="text-left">{dayjs(currentCheck.createdDate).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>
                <div className="flex items-center justify-start gap-3">
                  <div className="flex-none text-right">만료일 : </div>
                  <div className="text-left">{dayjs(currentCheck.expiredDate).format('YYYY-MM-DD HH:mm:ss')}</div>
                </div>

                <div className="mt-5 flex items-center justify-start gap-3">
                  <div
                    className={cx({
                      tooltip:
                        isDiffLocation(
                          gpsResult.find((item) => item.id === selectGpsId),
                          position,
                        ) || !isSupport,
                    })}
                    data-tip="현재 위치에서 처리할 수 없지만, 너굴맨이 처리함"
                  >
                    <button
                      className="btn btn-neutral"
                      disabled={
                        (attendanceResult && selectType === 'CLOCK_IN' && !!attendanceResult.clockInTime) ||
                        (attendanceResult && selectType === 'CLOCK_OUT' && !!attendanceResult.clockOutTime) ||
                        isRecording
                      }
                      onClick={handleRecord}
                    >
                      {isRecording ? (
                        <>
                          <span className="loading loading-spinner loading-xs" />
                          진행중
                        </>
                      ) : (
                        '진행하기'
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="mt-6">
            {/* 처리 결과 표시 */}
            <AttendanceRecordResult result={attendanceResult} isError={!!recordErr} />
          </div>
        </div>
      </div>
    </div>
  );
}

function isDiffLocation(gps?: AttendanceGps, current?: { latitude: number; longitude: number }): boolean {
  if (!gps || !current) {
    return false;
  }

  const location = {
    latitude: round(gps.latitude, 3),
    longitude: round(gps.longitude, 3),
  };

  const calculateCurrent = {
    latitude: round(current.latitude, 3),
    longitude: round(current.longitude, 3),
  };

  return (
    !isSameMarginOfError(location.latitude, calculateCurrent.latitude, 0.001) ||
    !isSameMarginOfError(location.longitude, calculateCurrent.longitude, 0.001)
  );
}

interface AttendanceRecordResultProps {
  result?: AttendanceRecord;
  isError?: boolean;
}

function AttendanceRecordResult({ result, isError }: AttendanceRecordResultProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      {/* icon */}
      <div
        className={cx('flex flex-col items-center justify-center', {
          'text-green-600': !!result,
          'text-red-600': isError,
        })}
      >
        {result && !result.clockInTime && !isError && <GiNightSleep className="size-24 text-black" />}
        {((result && (result.clockInTime || result.clockOutTime)) || isError) && (
          <FaCheckCircle className="h-24 w-24" />
        )}
        {isError && (
          <div className="mt-3">
            <h3 className="text-lg font-bold">무언가 잘못되었는디?</h3>
          </div>
        )}
      </div>

      {/* contents */}
      <div className="w-full">
        {result && result.clockInTime && (
          <div className="flex w-full flex-col items-center justify-start gap-2">
            {/* 출근 / 퇴근 */}
            <div className="">
              <h2 className="text-lg font-bold">
                {result.clockInTime && !result.clockOutTime && '출근 처리되었습니다.'}
                {result.clockInTime && result.clockOutTime && '퇴근 처리되었습니다.'}
              </h2>
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
        )}
      </div>
    </div>
  );
}
