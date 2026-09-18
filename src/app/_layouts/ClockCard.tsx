'use client';

// 오늘 근태 기록 → 출근 전 / 근무 중 / 퇴근 완료. 사이드바 카드(ClockCard)와 모바일 dock FAB(ClockFab)가 같은 훅을 쓴다.
import { useEffect, useState } from 'react';

import { IoTimeOutline } from 'react-icons/io5';

import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import { getDuration, parseHours } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

function useTodayClock() {
  const t = useTranslations('workingBar');
  const [now, setNow] = useState<Date>(() => new Date());

  const { user } = useUser();
  const today = dayjs().format('YYYY-MM-DD');
  const { attendanceRecords, isFetched } = useGetAttendanceRecord({
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
    // 마운트 직후 한 번 갱신 — 출근 직후 경과 시간이 최대 1분 뒤처지는 것을 막는다
    setNow(new Date());
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
    ready: !!user && isFetched,
    isWorking,
    isDone,
    label,
    sub,
    elapsed,
    t,
  };
}

export default function ClockCard() {
  const { ready, isWorking, label, sub, elapsed, t } = useTodayClock();

  // 로딩 중에도 같은 높이를 차지해 사이드바가 흔들리지 않게 한다
  // (p-3.5 28 + border 2 + status 16 + mt-1/text-xl/mb-2 40 + btn-sm 32 = 118px)
  if (!ready) {
    return (
      <div
        className="bg-primary-soft rounded-box mx-4 mb-2 h-[118px] border"
        style={{ borderColor: 'var(--primary-subtle)' }}
        aria-hidden
      />
    );
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

      {/* CTA 없음 — 출퇴근 기록(근태 처리) 기능이 비활성화되어 상태만 표시한다. 재활성화 시 /attendance/record/gps 링크 복원 */}
    </div>
  );
}

// 모바일 dock 가운데 FAB — 같은 상태, 아이콘만
export function ClockFab() {
  const { ready, isWorking, isDone, t } = useTodayClock();

  // dock 이 5칸을 유지하도록 로딩 중에도 자리를 차지한다
  if (!ready) {
    return <span className="bg-base-300 border-base-100 -mt-7 size-14 flex-none rounded-full border-4" aria-hidden />;
  }

  // 출퇴근 기록 기능이 비활성화되어 링크가 아닌 상태 표시용 요소만 렌더링한다.
  return (
    <span
      role="img"
      aria-label={isDone ? t('todayDone') : isWorking ? t('clockOut') : t('beforeWork')}
      className={cx(
        'bg-primary text-primary-content border-base-100 -mt-7 flex size-14 flex-none items-center justify-center rounded-full border-4',
        !isWorking && 'opacity-50',
      )}
      style={{ boxShadow: '0 8px 20px color-mix(in oklab, var(--color-primary) 40%, transparent)' }}
    >
      <IoTimeOutline className="size-6" />
    </span>
  );
}
