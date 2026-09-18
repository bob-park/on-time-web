'use client';

import { memo, useContext } from 'react';

import { AttendanceRecord, DayOffType } from '@/domain/attendance/apis/attendance.dto';
import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';
import { useGetAttendanceRecord } from '@/domain/attendance/queries/attendanceRecord';
import { useUser } from '@/domain/users/queries/user';
import Badge from '@/shared/components/Badge';
import { Card, CardSection } from '@/shared/components/Card';
import dayjs from '@/shared/dayjs';
import { getWorkDuration, parseHours } from '@/utils/parse';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;
const DAILY_TOTAL_HOURS = 8;
const DEFAULT_WEEKENDS = [0, 6];

type CategoryKey = 'work' | 'dayOff' | 'halfDayOff' | 'holiday';

function getCategoryKey(date: Date, dayOffType?: DayOffType): CategoryKey {
  if (dayOffType === 'DAY_OFF') return 'dayOff';
  if (dayOffType === 'AM_HALF_DAY_OFF' || dayOffType === 'PM_HALF_DAY_OFF') return 'halfDayOff';
  if (DEFAULT_WEEKENDS.includes(dayjs(date).day())) return 'holiday';
  return 'work';
}

interface WorkingRecordRowProps {
  date: Date;
  clockInTime?: Date;
  clockOutTime?: Date;
  dayOffType?: DayOffType;
}

const WorkingRecordRow = memo(function WorkingRecordRow({
  date,
  clockInTime,
  clockOutTime,
  dayOffType,
}: WorkingRecordRowProps) {
  const t = useTranslations('dashboard');

  const isToday = dayjs().isSame(date, 'day');
  const isInProgress = isToday && !!clockInTime && !clockOutTime;

  const workDuration = getWorkDuration(date, clockInTime, isInProgress ? dayjs().toDate() : clockOutTime);
  const durationPercent = Math.min(Math.round((workDuration / (ONE_HOUR * DAILY_TOTAL_HOURS)) * 100), 100);
  const isOver = workDuration > ONE_HOUR * DAILY_TOTAL_HOURS;

  const categoryKey = getCategoryKey(date, dayOffType);
  const isOff = categoryKey === 'dayOff' || categoryKey === 'halfDayOff';

  return (
    <div
      className={cx('hover:bg-base-200 flex items-center gap-3 rounded-[10px] px-2.5 py-2.5 transition-colors', {
        'bg-primary-soft': isToday,
        'opacity-60': !clockInTime && !isOff,
      })}
    >
      {/* DAY / DATE */}
      <div className="w-16 flex-none text-[13px] font-semibold">
        {dayjs(date).format('dd')}
        <span className="text-3 block text-[11px] font-normal">{dayjs(date).format('MM/DD')}</span>
      </div>

      {/* DURATION BAR */}
      <div className="bg-base-300 relative h-2 flex-1 overflow-hidden rounded-full">
        <div
          className={cx('absolute inset-y-0 left-0 rounded-full', isOver ? 'bg-warning' : 'bg-primary')}
          style={{ width: `${durationPercent}%` }}
        />
      </div>

      {/* DURATION */}
      <div className="w-16 flex-none text-right text-[13px] font-semibold tabular-nums">
        {workDuration > 0 ? parseHours(workDuration) : '—'}
      </div>

      {/* TIME RANGE / CATEGORY */}
      <div className="text-3 w-[110px] flex-none text-right text-xs">
        {isOff ? (
          <Badge variant="primary">{t(categoryKey === 'dayOff' ? 'categoryDayOff' : 'categoryHalfDayOff')}</Badge>
        ) : isInProgress ? (
          <span>
            {dayjs(clockInTime).format('HH:mm')} – <span className="text-primary font-semibold">{t('working')}</span>
          </span>
        ) : clockInTime && clockOutTime ? (
          `${dayjs(clockInTime).format('HH:mm')} – ${dayjs(clockOutTime).format('HH:mm')}`
        ) : categoryKey === 'holiday' ? (
          <Badge variant="neutral">{t('categoryHoliday')}</Badge>
        ) : (
          '—'
        )}
      </div>
    </div>
  );
});

function getDates(
  selectDate: { startDate: Date; endDate: Date },
  attendanceRecords: AttendanceRecord[],
): WorkingRecordRowProps[] {
  const result: WorkingRecordRowProps[] = [];
  let current = dayjs(selectDate.startDate).hour(0).minute(0).second(0).millisecond(0).toDate();

  while (current <= selectDate.endDate) {
    const record = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(current).format('YYYY-MM-DD'),
    );
    result.push(
      record
        ? {
            date: current,
            clockInTime: record.clockInTime,
            clockOutTime: record.clockOutTime,
            dayOffType: record.dayOffType,
          }
        : { date: current },
    );
    current = dayjs(current).add(1, 'day').toDate();
  }

  return result;
}

export default function WorkingRecordContents() {
  const t = useTranslations('dashboard');
  const { selectDate } = useContext(WorkingTimeContext);
  const { user: currentUser } = useUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <Card className="animate-fade-up delay-150">
      <CardSection title={t('sectionWeek')} link={{ href: '/schedule', label: t('viewAll') }}>
        <WorkingTimeView />
      </CardSection>

      <div className="p-2">
        {dataList.map((item) => (
          <WorkingRecordRow
            key={`working-record-${dayjs(item.date).unix()}`}
            date={item.date}
            clockInTime={item.clockInTime}
            clockOutTime={item.clockOutTime}
            dayOffType={item.dayOffType}
          />
        ))}
      </div>
    </Card>
  );
}
