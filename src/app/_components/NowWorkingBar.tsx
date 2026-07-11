'use client';

// 오늘의 근태 기록을 조회해 출근 전/근무 중/퇴근 완료 3상태를 렌더링한다.
// - 근무 중: green pulse dot + "근무 중 · HH:mm 출근" + 경과/8h progress + 퇴근 CTA(btn-primary)
// - 출근 전: gray dot + "출근 전" + 출근하기 CTA(/attendance/record/gps 링크)
// - 퇴근 완료: "오늘 근무 완료 · Xh Ym" + CTA 없음
import { useEffect, useState } from 'react';

import Link from 'next/link';

import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { getDuration } from '@/utils/parse';

import dayjs from 'dayjs';
import padStart from 'lodash/padStart';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;
const DAILY_TOTAL_HOURS = 8;

function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);
  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

export default function NowWorkingBar() {
  const t = useTranslations('workingBar');

  // 근무 중일 때 경과 시간을 갱신하기 위한 1분 틱
  const [now, setNow] = useState<Date>(() => new Date());

  // query — 대시보드와 동일한 오늘-근태 조회 소스 재사용
  const { currentUser } = useGetCurrentUser();
  const today = dayjs().format('YYYY-MM-DD');
  const { attendanceRecords, isLoading } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: today,
    endDate: today,
  });

  const record = attendanceRecords.find((item) => dayjs(item.workingDate).format('YYYY-MM-DD') === today);

  const clockInTime = record?.clockInTime;
  const clockOutTime = record?.clockOutTime;
  const leaveWorkAt = record?.leaveWorkAt;

  const isDone = !!clockInTime && !!clockOutTime;
  const isWorking = !!clockInTime && !clockOutTime;

  // 근무 중일 때만 1분 틱을 돌린다 — 출근 전/퇴근 완료 상태에서는 불필요한 타이머 방지
  useEffect(() => {
    if (!isWorking) {
      return;
    }
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [isWorking]);

  // 로딩/유저 미확정 시 렌더하지 않음
  if (!currentUser || isLoading) {
    return null;
  }

  // 상태별 표시 값
  let label: string;
  let sub: string | undefined;
  let elapsedSeconds = 0;

  if (isWorking) {
    elapsedSeconds = getDuration(clockInTime, now);
    label = t('working', { time: dayjs(clockInTime).format('HH:mm') });
    sub = leaveWorkAt ? t('leaveTarget', { time: dayjs(leaveWorkAt).format('HH:mm') }) : undefined;
  } else if (isDone) {
    const duration = getDuration(clockInTime, clockOutTime);
    label = t('done', { duration: parseHours(duration) });
  } else {
    label = t('beforeWork');
  }

  const percent = Math.min(Math.round((elapsedSeconds / (ONE_HOUR * DAILY_TOTAL_HOURS)) * 100), 100);

  return (
    <div className="bg-base-300 fixed inset-x-2 bottom-14 z-50 flex h-16 items-center justify-between gap-4 rounded-lg px-5 shadow-[0_8px_24px_rgba(0,0,0,0.5)] md:bottom-2">
      {/* status */}
      <div className="flex min-w-0 items-center gap-3">
        {isWorking ? (
          <span className="relative flex size-2.5 flex-none">
            <span className="bg-primary absolute inline-flex size-full animate-ping rounded-full opacity-75" />
            <span className="bg-primary relative inline-flex size-2.5 rounded-full" />
          </span>
        ) : (
          <span className="bg-base-content/30 size-2.5 flex-none rounded-full" />
        )}
        <div className="min-w-0 leading-tight">
          <div className="text-base-content truncate text-[13px] font-bold">{label}</div>
          {sub && <div className="text-base-content/60 truncate text-xs">{sub}</div>}
        </div>
      </div>

      {/* progress (근무 중 · desktop only) */}
      {isWorking && (
        <div className="group text-base-content/60 hidden max-w-[520px] flex-1 items-center gap-2.5 text-[11px] md:flex">
          <span className="flex-none">{parseHours(elapsedSeconds)}</span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-[#4d4d4d]">
            <div
              className="bg-base-content group-hover:bg-primary h-full rounded-full transition-colors"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="flex-none">{DAILY_TOTAL_HOURS}h</span>
        </div>
      )}

      {/* CTA */}
      {isWorking && (
        <Link href="/attendance/record/gps" className="btn btn-primary btn-sm flex-none">
          {t('clockOut')}
        </Link>
      )}
      {!isWorking && !isDone && (
        <Link href="/attendance/record/gps" className="btn btn-primary btn-sm flex-none">
          {t('clockIn')}
        </Link>
      )}
    </div>
  );
}
