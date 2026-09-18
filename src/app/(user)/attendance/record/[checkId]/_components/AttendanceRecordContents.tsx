'use client';

import { useEffect } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import { AttendanceRecord } from '@/domain/attendance/apis/attendance.dto';
import { useGetResultAttendanceRecord, useRecordAttendance } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
}

function InfoRow({ label, value, accent }: InfoRowProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-2 text-[13px]">{label}</span>
      <span className={cx('text-[15px] font-bold', { 'text-primary': accent })}>{value}</span>
    </div>
  );
}

interface AttendanceRecordResultProps {
  result?: AttendanceRecord;
}

function AttendanceRecordResult({ result }: AttendanceRecordResultProps) {
  const t = useTranslations('attendance.record');
  const success = !!result;

  return (
    <div className="animate-fade-up flex flex-col items-center gap-7 pt-16 pb-10 text-center">
      {/* icon */}
      <span
        className={cx('flex size-20 items-center justify-center rounded-full text-4xl', {
          'bg-primary text-primary-content shadow-whisper': success,
          'bg-error text-error-content shadow-whisper': !success,
        })}
      >
        {success ? <FaCheck /> : <FaTimes />}
      </span>

      {/* contents */}
      {success ? (
        <>
          <h2 className="text-2xl font-bold tracking-tight">
            {result.clockInTime && !result.clockOutTime && t('clockInDone')}
            {result.clockInTime && result.clockOutTime && t('clockOutDone')}
          </h2>

          <div className="bg-base-100 border-base-300 rounded-box shadow-whisper w-full max-w-[420px] border px-5 text-left">
            <div className="divide-base-300 divide-y">
              <InfoRow
                label={t('workingDate')}
                value={
                  <>
                    {dayjs(result.workingDate).format('YYYY.MM.DD')} ({getDaysOfWeek(dayjs(result.workingDate).day())})
                  </>
                }
              />
              <InfoRow accent label={t('clockInTime')} value={dayjs(result.clockInTime).format('HH:mm:ss')} />
              <InfoRow label={t('leaveWorkAt')} value={dayjs(result.leaveWorkAt).format('HH:mm:ss')} />
              {result.clockOutTime && (
                <InfoRow accent label={t('clockOutTime')} value={dayjs(result.clockOutTime).format('HH:mm:ss')} />
              )}
            </div>
          </div>

          <span className="text-3 text-[13px]">{t('closeHint')}</span>
        </>
      ) : (
        <h2 className="text-2xl font-bold tracking-tight">{t('invalidAccess')}</h2>
      )}
    </div>
  );
}

interface AttendanceRecordContentsProps {
  checkId: string;
}

export default function AttendanceRecordContents({ checkId }: AttendanceRecordContentsProps) {
  // query
  const { user: currentUser } = useUser();
  const { result } = useGetResultAttendanceRecord({ checkId });
  const { record, isLoading } = useRecordAttendance();

  // useEffect
  useEffect(() => {
    record({ checkId });
  }, [currentUser]);

  return (
    <div className="flex w-full flex-col items-center justify-center">
      {/* 처리 결과 표시 */}
      {isLoading && !result && (
        <div className="flex h-56 flex-col items-center justify-center pt-16">
          <span className="loading loading-infinity loading-lg text-primary"></span>
        </div>
      )}

      {!isLoading && currentUser && <AttendanceRecordResult result={result} />}
    </div>
  );
}
