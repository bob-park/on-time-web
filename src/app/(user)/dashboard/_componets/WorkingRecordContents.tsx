'use client';

import { memo, useContext } from 'react';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { isIncludeTime } from '@/utils/dataUtils';
import { getDuration } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import padStart from 'lodash/padStart';
import { useTranslations } from 'next-intl';

const ONE_HOUR = 3_600;
const DAILY_TOTAL_HOURS = 8;
const DEFAULT_WEEKENDS = [0, 6];

type CategoryKey = 'work' | 'dayOff' | 'halfDayOff' | 'holiday';

function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);
  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

function getCategoryKey(date: Date, dayOffType?: DayOffType): CategoryKey {
  if (dayOffType === 'DAY_OFF') return 'dayOff';
  if (dayOffType === 'AM_HALF_DAY_OFF' || dayOffType === 'PM_HALF_DAY_OFF') return 'halfDayOff';
  if (DEFAULT_WEEKENDS.includes(dayjs(date).day())) return 'holiday';
  return 'work';
}

function getCategoryBadgeStyle(category: CategoryKey): string {
  if (category === 'dayOff' || category === 'halfDayOff') return 'bg-info/15 text-info';
  return 'bg-base-content/10 text-base-content/60';
}

interface WorkingRecordRowProps {
  date: Date;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  status?: AttendanceStatus;
  dayOffType?: DayOffType;
}

const WorkingRecordRow = memo(function WorkingRecordRow({
  date,
  clockInTime,
  leaveWorkAt,
  clockOutTime,
  status,
  dayOffType,
}: WorkingRecordRowProps) {
  const t = useTranslations('dashboard');

  const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const isToday = now.isSame(date);
  const isInProgress = isToday && clockInTime && !clockOutTime;
  const isWeekend = DEFAULT_WEEKENDS.includes(dayjs(date).day());

  const rawDuration = clockInTime && clockOutTime ? getDuration(clockInTime, clockOutTime) : 0;
  const workDuration = rawDuration
    ? rawDuration -
      (rawDuration > ONE_HOUR * 8 ||
      isIncludeTime(
        {
          from: clockInTime || dayjs(date).hour(0).toDate(),
          to: clockOutTime || dayjs(date).hour(0).toDate(),
        },
        dayjs(date).hour(12).toDate(),
      )
        ? ONE_HOUR
        : 0)
    : 0;

  const durationPercent = Math.min(Math.round((workDuration / (ONE_HOUR * DAILY_TOTAL_HOURS)) * 100), 100);
  const categoryKey = getCategoryKey(date, dayOffType);
  const categoryLabel = t(
    categoryKey === 'dayOff'
      ? 'categoryDayOff'
      : categoryKey === 'halfDayOff'
        ? 'categoryHalfDayOff'
        : categoryKey === 'holiday'
          ? 'categoryHoliday'
          : 'categoryWork',
  );
  const isUnder = status === 'WARNING';

  const emptyCell = <span className="text-base-content/40">—</span>;

  return (
    <tr
      className={cx('border-b border-white/[0.04] transition-colors duration-100 hover:bg-white/[0.04]', {
        'bg-primary/[0.07]': isToday,
      })}
    >
      {/* DATE / DAY */}
      <td className="px-4 py-3.5">
        <span className="text-sm font-bold">{dayjs(date).format('MM.DD')}</span>
        <span className="text-base-content/60 ml-1.5 text-[13px]">
          {dayjs(date).locale('ko').format('dd')}
          {isToday && ` · ${t('todaySuffix')}`}
        </span>
      </td>

      {/* CATEGORY */}
      <td className="px-4 py-3.5">
        <span
          className={cx(
            'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold',
            getCategoryBadgeStyle(categoryKey),
          )}
        >
          {categoryLabel}
        </span>
      </td>

      {/* CLOCK-IN */}
      <td className="px-4 py-3.5 text-sm">{clockInTime ? dayjs(clockInTime).format('HH:mm') : emptyCell}</td>

      {/* TARGET CLOCK-OUT */}
      <td className="text-base-content/60 px-4 py-3.5 text-[13px]">
        {leaveWorkAt ? dayjs(leaveWorkAt).format('HH:mm') : emptyCell}
      </td>

      {/* CLOCK-OUT */}
      <td className="px-4 py-3.5 text-sm">
        {isInProgress ? (
          <span className="text-primary animate-pulse font-bold">{t('working')}</span>
        ) : clockOutTime ? (
          dayjs(clockOutTime).format('HH:mm')
        ) : (
          emptyCell
        )}
      </td>

      {/* WORK DURATION */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-1 w-[120px] overflow-hidden rounded bg-white/15">
            <span
              className={cx('block h-full rounded', isUnder ? 'bg-warning' : 'bg-primary')}
              style={{ width: `${durationPercent}%` }}
            />
          </span>
          <span className="text-base-content/60 text-[13px]">{workDuration > 0 ? parseHours(workDuration) : '—'}</span>
        </div>
      </td>

      {/* STATUS */}
      <td className="px-4 py-3.5">
        {isWeekend && !status ? null : (
          <span
            className={cx(
              'inline-block h-2 w-2 rounded-full',
              status === 'SUCCESS' ? 'bg-primary' : status === 'WARNING' ? 'bg-error' : 'bg-white/25',
            )}
          />
        )}
      </td>
    </tr>
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
            leaveWorkAt: record.leaveWorkAt,
            status: record.status,
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
  const { selectDate, updateSelectDate } = useContext(WorkingTimeContext);
  const { currentUser } = useGetCurrentUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  const handlePrevWeek = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(-7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(-7, 'day').toDate(),
    });
  };

  const handleNextWeek = () => {
    updateSelectDate({
      startDate: dayjs(selectDate.startDate).add(7, 'day').toDate(),
      endDate: dayjs(selectDate.endDate).add(7, 'day').toDate(),
    });
  };

  return (
    <div className="animate-fade-up bg-base-300 w-full rounded-lg p-5 delay-225">
      {/* section header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="text-lg font-semibold">{t('sectionTitle')}</span>
        <span className="text-base-content/60 text-[13px]">{t('weekCount', { count: dataList.length })}</span>
      </div>

      {/* table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colDate')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colCategory')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colClockIn')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colTargetClockOut')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colClockOut')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colWorkTime')}
              </th>
              <th className="text-base-content/60 border-b border-white/10 px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase">
                {t('colStatus')}
              </th>
            </tr>
          </thead>
          <tbody>
            {dataList.map((item) => (
              <WorkingRecordRow
                key={`working-record-${dayjs(item.date).unix()}`}
                date={item.date}
                clockInTime={item.clockInTime}
                leaveWorkAt={item.leaveWorkAt}
                clockOutTime={item.clockOutTime}
                status={item.status}
                dayOffType={item.dayOffType}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* footer */}
      <div className="mt-3.5 flex items-center justify-end gap-2">
        <button onClick={handlePrevWeek} className="btn btn-ghost btn-sm">
          ‹ {t('prevWeek')}
        </button>
        <button onClick={handleNextWeek} className="btn btn-ghost btn-sm">
          {t('nextWeek')} ›
        </button>
      </div>
    </div>
  );
}
