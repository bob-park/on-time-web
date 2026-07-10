'use client';

import { useContext } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { GiNightSleep } from 'react-icons/gi';
import { IoIosTime, IoIosWarning } from 'react-icons/io';

import { WorkingTimeContext } from '@/domain/attendance/components/WorkingTimeProvider';
import { useGetAttendanceRecord } from '@/domain/attendance/query/attendanceRecord';
import { useGetCurrentUser } from '@/domain/user/query/user';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useTranslations } from 'next-intl';

dayjs.extend(duration);

const DEFAULT_WEEKENDS = [0, 6];
const DEFAULT_FAMILY_DAY_WEEKS = [0, 2];

// hour-axis ticks (00 → 23) positioned by percentage of the 24h track
const AXIS_HOURS = [
  { label: '00', left: '0%' },
  { label: '03', left: '12.5%' },
  { label: '06', left: '25%' },
  { label: '09', left: '37.5%' },
  { label: '12', left: '50%' },
  { label: '15', left: '62.5%' },
  { label: '18', left: '75%' },
  { label: '21', left: '87.5%' },
  { label: '23', left: '100%' },
];

const TRACK_GRIDLINES =
  'repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0, rgba(255,255,255,0.05) 1px, transparent 1px, transparent calc(100% / 24))';

export default function ScheduleContents() {
  const t = useTranslations('schedule');
  const { selectDate } = useContext(WorkingTimeContext);

  // query
  const { currentUser } = useGetCurrentUser();
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.id || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <div className="bg-base-300 w-full rounded-lg p-5 select-none">
      {/* axis header */}
      <div className="grid grid-cols-[192px_1fr] items-center gap-4 border-b border-white/[0.08] px-2 pb-2.5">
        <span className="text-base-content/60 text-[11px] font-semibold tracking-[1.4px] uppercase">
          {t('workingDay')}
        </span>
        <div className="relative h-3.5">
          {AXIS_HOURS.map((hour) => (
            <span
              key={`schedule-axis-${hour.label}`}
              className="text-base-content/40 absolute top-0 -translate-x-1/2 text-[10px]"
              style={{ left: hour.left }}
            >
              {hour.label}
            </span>
          ))}
        </div>
      </div>

      {/* rows */}
      {dataList.map((item, index) => (
        <WorkingScheduleItem
          key={`working-schedule-item-${index}`}
          date={item.date}
          status={item.status}
          dayOffType={item.dayOffType}
          clockInTime={item.clockInTime}
          leaveWorkAt={item.leaveWorkAt}
          clockOutTime={item.clockOutTime}
        />
      ))}
    </div>
  );
}

function getDates(selectDate: { startDate: Date; endDate: Date }, attendanceRecords: AttendanceRecord[]) {
  const result = new Array<WorkingScheduleItemProps>();

  let currentDate = dayjs(selectDate.startDate).hour(0).minute(0).second(0).millisecond(0).toDate();

  while (currentDate <= selectDate.endDate) {
    const attendanceRecord = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(currentDate).format('YYYY-MM-DD'),
    );

    if (!attendanceRecord) {
      result.push({ date: currentDate });
    } else {
      result.push({
        date: currentDate,
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
        clockInTime: attendanceRecord.clockInTime,
        leaveWorkAt: attendanceRecord.leaveWorkAt,
        clockOutTime: attendanceRecord.clockOutTime,
      });
    }

    currentDate = dayjs(currentDate).add(1, 'day').toDate();
  }

  return result;
}

interface WorkingScheduleItemProps {
  date: Date;
  dayOffType?: DayOffType;
  status?: AttendanceStatus;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
}

const WorkingScheduleItem = ({
  date,
  dayOffType,
  status,
  clockInTime,
  leaveWorkAt,
  clockOutTime,
}: WorkingScheduleItemProps) => {
  const t = useTranslations('schedule');

  const now = dayjs().hour(0).minute(0).second(0).millisecond(0);
  const isToday = now.isSame(date);
  const isLive = isToday && !!clockInTime && !clockOutTime;
  const day = dayjs(date).day();

  const clockIn =
    clockInTime ||
    (!DEFAULT_WEEKENDS.includes(day) && getTimelineTime(date, dayOffType === 'AM_HALF_DAY_OFF' ? 14 : 9));
  const clockOut =
    clockOutTime ||
    leaveWorkAt ||
    (!DEFAULT_WEEKENDS.includes(day) &&
      getTimelineTime(date, dayOffType === 'PM_HALF_DAY_OFF' || isFamilyDay(date) ? 14 : 18));

  return (
    <div
      className={cx(
        'grid grid-cols-[192px_1fr] items-center gap-4 rounded-md px-2 py-2.5 transition-colors duration-100 first:mt-1 hover:bg-white/[0.04]',
        isToday ? 'bg-primary/[0.06]' : 'border-t border-white/[0.04]',
      )}
    >
      {/* day column */}
      <div className="flex items-center gap-2.5 text-[13px]">
        <StatusChip dayOffType={dayOffType} status={status} />

        <span className="font-bold">{dayjs(date).format('MM.DD')}</span>

        <span
          className={cx('text-xs', {
            'text-info': day === 6,
            'text-error': day === 0,
            'text-base-content/60': day !== 0 && day !== 6,
          })}
        >
          {getDaysOfWeek(day)}
          {isToday && ` · ${t('todaySuffix')}`}
        </span>

        {dayOffType === 'DAY_OFF' && <DayOffBadge>{t('categoryDayOff')}</DayOffBadge>}
        {dayOffType === 'AM_HALF_DAY_OFF' && <DayOffBadge>{t('categoryAmHalfDayOff')}</DayOffBadge>}
        {dayOffType === 'PM_HALF_DAY_OFF' && <DayOffBadge>{t('categoryPmHalfDayOff')}</DayOffBadge>}
      </div>

      {/* timeline track */}
      <WorkingTimeItems
        date={date}
        status={status}
        clockIn={clockIn}
        clockOut={clockOut}
        isLive={isLive}
        hideBar={dayOffType === 'DAY_OFF'}
      />
    </div>
  );
};

interface StatusChipProps {
  dayOffType?: DayOffType;
  status?: AttendanceStatus;
}

const StatusChip = ({ dayOffType, status }: StatusChipProps) => {
  let chip = 'bg-base-content/10';
  let icon = <IoIosTime className="text-base-content/50 size-3.5" />;

  if (dayOffType === 'DAY_OFF') {
    chip = 'bg-info/15';
    icon = <GiNightSleep className="text-info size-3.5" />;
  } else if (status === 'WARNING') {
    chip = 'bg-warning/15';
    icon = <IoIosWarning className="text-warning size-3.5" />;
  } else if (status === 'SUCCESS') {
    chip = 'bg-primary/15';
    icon = <FaCheckCircle className="text-primary size-3.5" />;
  }

  return <span className={cx('flex size-6 flex-none items-center justify-center rounded-full', chip)}>{icon}</span>;
};

const DayOffBadge = ({ children }: { children: React.ReactNode }) => (
  <span className="bg-info/15 text-info inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold">
    {children}
  </span>
);

interface WorkingTimeItemsProps {
  date: Date;
  status?: AttendanceStatus;
  clockIn?: Date | false;
  clockOut?: Date | false;
  isLive?: boolean;
  hideBar?: boolean;
}

const WorkingTimeItems = ({ date, status, clockIn, clockOut, isLive, hideBar }: WorkingTimeItemsProps) => {
  const t = useTranslations('schedule');

  const showBar = !hideBar && (!DEFAULT_WEEKENDS.includes(dayjs(date).day()) || (!!status && status !== 'WAITING'));

  const left = calculateTimeRatio(clockIn || dayjs().hour(9).toDate());
  const width = calculateTimeRatio(clockOut || dayjs().hour(18).toDate()) - left;

  return (
    <div className="relative flex h-[26px] w-full items-center rounded" style={{ background: TRACK_GRIDLINES }}>
      {showBar && (
        <div
          className={cx(
            { tooltip: clockIn && clockOut },
            'absolute top-1/2 h-3 -translate-y-1/2 rounded-full',
            status === 'WARNING' ? 'bg-warning/40' : 'bg-white/25',
          )}
          data-tip={`${clockIn && dayjs(clockIn).format('HH:mm')} - ${clockOut && dayjs(clockOut).format('HH:mm')} ${((!status || status === 'WAITING') && `(${t('scheduled')})`) || ''} `}
          style={{ left: `${left}%`, width: `${width}%` }}
        >
          {isLive && (
            <span className="bg-primary absolute top-1/2 right-0 size-3 -translate-y-1/2 rounded-full shadow-[0_0_10px_2px_rgba(30,215,96,0.6)]" />
          )}
        </div>
      )}
    </div>
  );
};

function getTimelineTime(date: Date, hours: number, minutes: number = 0): Date {
  return dayjs(new Date(date.getFullYear(), date.getMonth(), date.getDate()))
    .set('hours', hours)
    .set('minutes', minutes)
    .set('seconds', 0)
    .toDate();
}

function calculateTimeRatio(date: Date) {
  const total = 24 * 3_600;
  const current = dayjs(date);

  const seconds = current.hour() * 3_600 + current.minute() * 60;

  return Math.round((seconds / total) * 100);
}

function isFamilyDay(date: Date) {
  const weeksOfMonth = dayjs.duration(dayjs(date).diff(dayjs(date).startOf('month'))).weeks();

  return DEFAULT_FAMILY_DAY_WEEKS.includes(weeksOfMonth) && dayjs(date).day() === 5;
}
