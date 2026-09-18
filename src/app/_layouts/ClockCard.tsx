'use client';

// 오늘 근태 기록 → 출근 전 / 근무 중 / 퇴근 완료. 사이드바 카드(ClockCard)와 모바일 dock FAB(ClockFab)가 같은 훅을 쓴다.
import { useEffect, useState } from 'react';

import { IoTimeOutline } from 'react-icons/io5';

import Link from 'next/link';

import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import { getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import padStart from 'lodash/padStart';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;

function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);
  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

function useTodayClock() {
  const t = useTranslations('workingBar');
  const [now, setNow] = useState<Date>(() => new Date());

  const { user } = useUser();
  const today = dayjs().format('YYYY-MM-DD');
  const { attendanceRecords, isLoading } = useGetAttendanceRecord({
    userUniqueId: user?.id || '',
    startDate: today,
    endDate: today,
  });

  const record = attendanceRecords.find((item) => dayjs(item.workingDate).format('YYYY-MM-DD') === today);
  const clockInTime = record?.clockInTime;
  const clockOutTime = record?.clockOutTime;
  const leaveWorkAt = record?.leaveWorkAt;

  const isDone = !!clockInTime && !!clockOutTime;
  const isWorking = !!clockInTime && !clockOutTime;

  // 근무 중일 때만 1분 틱
  useEffect(() => {
    if (!isWorking) {
      return;
    }
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [isWorking]);

  let label = t('beforeWork');
  let sub: string | undefined;
  let elapsed = '—';

  if (isWorking) {
    elapsed = parseHours(getDuration(clockInTime, now));
    label = t('working', { time: dayjs(clockInTime).format('HH:mm') });
    sub = leaveWorkAt ? t('leaveTarget', { time: dayjs(leaveWorkAt).format('HH:mm') }) : undefined;
  } else if (isDone) {
    elapsed = parseHours(getDuration(clockInTime, clockOutTime));
    label = t('todayDone');
  }

  return {
    ready: !!user && !isLoading,
    isWorking,
    isDone,
    label,
    sub,
    elapsed,
    t,
  };
}

export default function ClockCard() {
  const { ready, isWorking, isDone, label, sub, elapsed, t } = useTodayClock();

  if (!ready) {
    return null;
  }

  return (
    <div
      className="bg-primary-soft rounded-box mx-4 mb-2 border p-3.5"
      style={{ borderColor: 'var(--primary-subtle)' }}
    >
      {/* status */}
      <div className="text-2 flex items-center gap-2 text-xs">
        {isWorking ? (
          <span className="relative flex size-2 flex-none">
            <span className="bg-success absolute inline-flex size-full animate-ping rounded-full opacity-60" />
            <span className="bg-success relative inline-flex size-2 rounded-full" />
          </span>
        ) : (
          <span className="bg-base-300 size-2 flex-none rounded-full" />
        )}
        <span className="truncate">{label}</span>
      </div>

      {/* elapsed */}
      <div className="mt-1 mb-2 text-xl font-bold tracking-tight">{elapsed}</div>
      {sub && <div className="text-3 -mt-1 mb-2 text-xs">{sub}</div>}

      {/* CTA */}
      {!isDone && (
        <Link href="/attendance/record/gps" className="btn btn-primary btn-sm w-full">
          {isWorking ? t('clockOut') : t('clockIn')}
        </Link>
      )}
    </div>
  );
}

// 모바일 dock 가운데 FAB — 같은 상태, 아이콘만
export function ClockFab() {
  const { ready, isWorking, isDone, t } = useTodayClock();

  if (!ready) {
    return null;
  }

  return (
    <Link
      href="/attendance/record/gps"
      aria-label={isWorking ? t('clockOut') : t('clockIn')}
      style={{ boxShadow: '0 8px 20px color-mix(in oklab, var(--color-primary) 40%, transparent)' }}
      className={cx(
        'bg-primary text-primary-content border-base-100 -mt-7 flex size-14 items-center justify-center rounded-full border-4',
        isDone && 'pointer-events-none opacity-50',
      )}
    >
      <IoTimeOutline className="size-6" />
    </Link>
  );
}
