'use client';

import { useEffect, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';
import { GiNightSleep } from 'react-icons/gi';

import { AttendanceGps, AttendanceRecord, AttendanceType } from '@/domain/attendance/apis/attendance.dto';
import AttendanceStatusBadge from '@/domain/attendance/components/AttendanceStatusBadge';
import useGps from '@/domain/attendance/hooks/useGps';
import { useGenerateCurrentCheck, useGetCurrentCheck } from '@/domain/attendance/queries/attendanceCheck';
import { useGetAttendanceGps } from '@/domain/attendance/queries/attendanceGps';
import { useGetAttendanceRecord, useRecordAttendance } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import Card from '@/shared/components/Card';
import { isSameMarginOfError } from '@/utils/dataUtils';
import { getDaysOfWeek, round } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

export default function AttendanceRecordGpsContents() {
  const t = useTranslations('attendance.record');
  const now = dayjs();

  // state
  const [selectGpsId, setSelectGpsId] = useState<number>();
  // 출근 처리는 비활성화 상태 — 퇴근만 선택 가능
  const [selectType, setSelectType] = useState<AttendanceType>('CLOCK_OUT');

  // hooks
  const { isSupport, position } = useGps();

  // query
  const { user: currentUser } = useUser();
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

  const isDisabled =
    (attendanceResult && selectType === 'CLOCK_IN' && !!attendanceResult.clockInTime) ||
    (attendanceResult && selectType === 'CLOCK_OUT' && !!attendanceResult.clockOutTime) ||
    isRecording;

  const showTooltip =
    isDiffLocation(
      gpsResult.find((item) => item.id === selectGpsId),
      position,
    ) || !isSupport;

  return (
    <Card className="animate-fade-up mx-auto mt-3 flex w-full max-w-[520px] flex-col gap-6 p-6">
      {/* (a) 장소 — 장소 수가 많을 수 있어 줄바꿈되는 chip 으로 */}
      <div>
        <div className="text-2 mb-2.5 text-xs font-semibold tracking-wider uppercase">{t('gps.locationLabel')}</div>
        <div role="group" aria-label={t('gps.locationLabel')} className="flex flex-wrap gap-2">
          {gpsResult.map((gps) => {
            const selected = selectGpsId === gps.id;

            return (
              <button
                key={`gps-${gps.id}`}
                type="button"
                aria-pressed={selected}
                className={cx(
                  'flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors duration-150',
                  selected
                    ? 'border-primary bg-primary-soft text-primary font-semibold'
                    : 'border-base-300 bg-base-100 text-2 hover:bg-base-200',
                )}
                onClick={() => setSelectGpsId(gps.id)}
              >
                {gps.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* (b) 출 / 퇴근 */}
      <div>
        <div className="text-2 mb-2.5 text-xs font-semibold tracking-wider uppercase">{t('gps.typeLabel')}</div>
        <div className="flex gap-3">
          <button
            className={cx('btn btn-lg flex-1', selectType === 'CLOCK_IN' ? 'btn-primary' : 'btn-outline')}
            onClick={() => setSelectType('CLOCK_IN')}
            disabled
            title={t('gps.clockInDisabled')}
          >
            {t('gps.clockIn')}
          </button>
          <button
            className={cx('btn btn-lg flex-1', selectType === 'CLOCK_OUT' ? 'btn-primary' : 'btn-outline')}
            onClick={() => setSelectType('CLOCK_OUT')}
          >
            {t('gps.clockOut')}
          </button>
        </div>
      </div>

      {/* (c) 토큰 정보 */}
      {isLoading && (
        <div className="flex h-28 items-center justify-center">
          <span className="loading loading-infinity loading-lg text-primary"></span>
        </div>
      )}

      {!isLoading && currentCheck && (
        <div className="bg-base-200 rounded-box px-4">
          <div className="divide-base-300 divide-y">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-2 text-[13px]">{t('workingDate')}</span>
              <span className="text-sm font-bold">
                {dayjs(currentCheck.workingDate).format('YYYY.MM.DD')} (
                {getDaysOfWeek(dayjs(currentCheck.workingDate).day())})
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-2 text-[13px]">{t('gps.createdDate')}</span>
              <span className="text-sm font-bold">{dayjs(currentCheck.createdDate).format('HH:mm:ss')}</span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-2 text-[13px]">{t('gps.expiredDate')}</span>
              <span className="text-sm font-bold">{dayjs(currentCheck.expiredDate).format('HH:mm:ss')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 py-3">
            <span className="bg-primary size-2 animate-pulse rounded-full"></span>
            <span className="text-2 text-xs">{t('gps.autoRefresh')}</span>
          </div>
        </div>
      )}

      {/* (d) 진행하기 */}
      {!isLoading && currentCheck && (
        <div className={cx('w-full', { tooltip: showTooltip })} data-tip={t('gps.tooltip')}>
          <button className="btn btn-lg btn-primary btn-block" disabled={isDisabled} onClick={handleRecord}>
            {isRecording ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {t('gps.proceeding')}
              </>
            ) : (
              t('gps.proceed')
            )}
          </button>
        </div>
      )}

      {/* (e) 처리 결과 */}
      <AttendanceRecordResult result={attendanceResult} isError={!!recordErr} />
    </Card>
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
  const t = useTranslations('attendance.record');

  const showSuccess = !!(result && result.clockInTime);
  const showSleep = !!(result && !result.clockInTime && !isError);

  if (!showSuccess && !showSleep && !isError) {
    return null;
  }

  return (
    <div className="border-soft animate-fade-up w-full border-t pt-5">
      <div className="flex items-center gap-4">
        {/* icon */}
        {showSleep && (
          <span className="bg-base-200 text-2 flex size-12 flex-none items-center justify-center rounded-full text-xl">
            <GiNightSleep />
          </span>
        )}
        {isError && (
          <span className="bg-error text-error-content shadow-whisper flex size-12 flex-none items-center justify-center rounded-full text-xl">
            <FaTimes />
          </span>
        )}
        {showSuccess && !isError && (
          <span className="bg-primary text-primary-content shadow-whisper flex size-12 flex-none items-center justify-center rounded-full text-xl">
            <FaCheck />
          </span>
        )}

        {/* text */}
        <div className="min-w-0">
          {isError && <div className="text-base font-bold">{t('gps.errorTitle')}</div>}
          {showSuccess && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-base font-bold">
                  {result.clockInTime && !result.clockOutTime && t('clockInDone')}
                  {result.clockInTime && result.clockOutTime && t('clockOutDone')}
                </span>
                <AttendanceStatusBadge status={result.status} />
              </div>
              <div className="text-2 mt-1 text-[13px]">
                {result.clockOutTime ? (
                  <>
                    {t('clockOutTime')}{' '}
                    <strong className="text-primary">{dayjs(result.clockOutTime).format('HH:mm')}</strong>
                  </>
                ) : (
                  <>
                    {t('clockInTime')}{' '}
                    <strong className="text-primary">{dayjs(result.clockInTime).format('HH:mm')}</strong>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
