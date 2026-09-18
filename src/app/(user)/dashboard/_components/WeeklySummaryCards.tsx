'use client';

import { useContext } from 'react';

import { AttendanceRecord } from '@/domain/attendance/apis/attendance.dto';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useProceedingApprovalCount, useUser, useUserLeaveEntry } from '@/domain/users/queries/user';
import { useUserCompLeaveEntries } from '@/domain/users/queries/userCompLeaveEntry';
import Badge from '@/shared/components/Badge';
import StatCard from '@/shared/components/StatCard';
import dayjs from '@/shared/dayjs';
import { ONE_HOUR, getWorkDuration, parseHours } from '@/utils/parse';

import { useTranslations } from 'next-intl';

const WEEKLY_TOTAL_HOURS = 40;

function calcCumulativeSeconds(attendanceRecords: AttendanceRecord[], now: Date): number {
  return attendanceRecords
    .map((item) => getWorkDuration(item.workingDate, item.clockInTime, item.clockOutTime, now))
    .reduce((sum, v) => sum + v, 0);
}

export default function WeeklySummaryCards() {
  const t = useTranslations('dashboard');
  const { selectDate } = useContext(WorkingTimeContext);
  const { user: currentUser } = useUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });
  const { compLeaveEntries } = useUserCompLeaveEntries();
  const { leaveEntry } = useUserLeaveEntry(dayjs().year());
  const { count } = useProceedingApprovalCount();

  const now = dayjs().toDate();

  /* 1. 이번 주 누적 근무 — 당일 근무 중이면 현재 시각까지 포함 (getWorkDuration 이 판단) */
  const cumulativeSeconds = calcCumulativeSeconds(attendanceRecords, now);
  const cumulativeHours = Math.floor(cumulativeSeconds / ONE_HOUR);
  const remainingSeconds = Math.max(WEEKLY_TOTAL_HOURS * ONE_HOUR - cumulativeSeconds, 0);
  const isOnTrack = cumulativeHours >= WEEKLY_TOTAL_HOURS * 0.5;

  /* 2. 오늘 근무 — 이미 조회한 주간 기록에서 오늘을 찾는다 (추가 요청 없음) */
  const todayRecord = attendanceRecords.find((item) => dayjs(item.workingDate).isSame(now, 'day'));
  const todaySeconds = todayRecord
    ? getWorkDuration(todayRecord.workingDate, todayRecord.clockInTime, todayRecord.clockOutTime, now)
    : 0;

  /* 3. 잔여 연차 */
  const totalLeaveDays = leaveEntry?.totalLeaveDays ?? 0;
  const remainingLeaveDays = totalLeaveDays - (leaveEntry?.usedLeaveDays ?? 0);
  const leaveRing = totalLeaveDays
    ? Math.max(0, Math.min(100, Math.round((remainingLeaveDays / totalLeaveDays) * 100)))
    : 0;
  const compLeaveDays = compLeaveEntries.reduce((sum, entry) => sum + (entry.leaveDays - entry.usedDays), 0);

  return (
    <div className="animate-fade-up grid w-full grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        label={t('statWeekly')}
        value={`${cumulativeHours}h`}
        unit={`/ ${WEEKLY_TOTAL_HOURS}h`}
        caption={
          <>
            <Badge variant={isOnTrack ? 'ok' : 'wait'}>{isOnTrack ? t('statusOnTrack') : t('statusBehind')}</Badge>
            {remainingSeconds > 0 && <span>{t('statWeeklyTarget', { time: parseHours(remainingSeconds) })}</span>}
          </>
        }
      />

      <StatCard
        label={t('statToday')}
        value={todaySeconds > 0 ? parseHours(todaySeconds) : '—'}
        caption={
          todayRecord?.clockInTime
            ? t('statTodayCaption', {
                clockIn: dayjs(todayRecord.clockInTime).format('HH:mm'),
                clockOut: todayRecord.leaveWorkAt ? dayjs(todayRecord.leaveWorkAt).format('HH:mm') : '—',
              })
            : undefined
        }
      />

      <StatCard
        label={t('statLeave')}
        value={remainingLeaveDays}
        unit="일"
        ring={leaveRing}
        caption={t('statLeaveCaption', { comp: compLeaveDays })}
      />

      <StatCard label={t('statProceeding')} value={count} unit="건" />
    </div>
  );
}
