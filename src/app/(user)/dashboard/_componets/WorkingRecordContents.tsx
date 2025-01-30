'use client';

import { useContext } from 'react';

import { FaCheckCircle } from 'react-icons/fa';
import { RiErrorWarningFill } from 'react-icons/ri';

import { useStore } from '@/shared/rootStore';

import { getDaysOfWeek, getDuration } from '@/utils/parse';

import { useGetAttendanceRecord } from '@/domain/attendance/query/AttendanceRecord';
import cx from 'classnames';
import dayjs from 'dayjs';
import { padStart } from 'lodash';

import { WorkingTimeContext } from './WorkingTimeProvider';

const ONE_HOUR = 3_600;

function parseTimeFormat(seconds: number): string {
  const min = Math.floor((seconds / 60) % 60);
  const hours = Math.floor(seconds / 3_600);

  return `${hours}시간 ${padStart(min + '', 2, '0')}분`;
}

function WorkingRecordHeaders() {
  return (
    <div className="flex h-14 w-full flex-row items-center justify-center gap-1 border-y-2 border-y-gray-300 text-center font-semibold">
      <span className="w-8 flex-none"></span>
      <span className="w-32 flex-none">근무일</span>
      <span className="w-12 flex-none">구분</span>
      <span className="w-28 flex-none">출근 시간</span>
      <span className="w-28 flex-none">퇴근 예정 시간</span>
      <span className="w-28 flex-none">퇴근 시간</span>
      <span className="w-12 flex-none">휴식</span>
      <span className="w-16 flex-none">연장 근로</span>
      <span className="w-28 flex-none">근무 시간</span>
    </div>
  );
}

interface WorkingRecordItemsProps {
  date: Date;
  clockInTime?: Date;
  leaveWorkAt?: Date;
  clockOutTime?: Date;
  status?: AttendanceStatus;
  dayOffType?: DayOffType;
}

const WorkingRecordItems = ({
  date,
  clockInTime,
  leaveWorkAt,
  clockOutTime,
  status,
  dayOffType,
}: WorkingRecordItemsProps) => {
  const workDurations = clockInTime && clockOutTime && getDuration(clockInTime, clockOutTime);

  return (
    <div className="flex h-14 w-full flex-row items-center justify-center gap-1 rounded-xl text-center duration-150 hover:bg-base-200">
      <span className="w-8 flex-none">
        {status && <>{status === 'SUCCESS' && <FaCheckCircle className="h-6 w-6 text-green-600" />}</>}
        {status && <>{status === 'WARNING' && <RiErrorWarningFill className="h-6 w-6 text-red-600" />}</>}
      </span>
      <span
        className={cx('w-32 flex-none font-semibold', {
          'text-blue-600': dayjs(date).day() === 6,
          'text-red-600': dayjs(date).day() === 0,
        })}
      >
        {`${dayjs(date).format('YYYY.MM.DD')} (${getDaysOfWeek(dayjs(date).day())})`}
      </span>
      <span className="w-12 flex-none font-semibold">{[0, 6].includes(dayjs(date).day()) ? '휴일' : '업무'}</span>
      <span className="w-28 flex-none">{clockInTime && dayjs(clockInTime).format('HH:mm')}</span>
      <span className="w-28 flex-none">{leaveWorkAt && dayjs(leaveWorkAt).format('HH:mm')}</span>
      <span className="w-28 flex-none">{clockOutTime && dayjs(clockOutTime).format('HH:mm')}</span>
      <span className="w-12 flex-none">{workDurations && workDurations > ONE_HOUR * 8 ? 1 : 0}시간</span>
      <span className="w-16 flex-none">0분</span>
      <span className="w-28 flex-none">
        {workDurations && parseTimeFormat(workDurations - (workDurations > ONE_HOUR * 8 ? ONE_HOUR : 0))}
      </span>
    </div>
  );
};

function getDates(selectDate: { startDate: Date; endDate: Date }, attendanceRecords: AttendanceRecord[]) {
  const result = new Array<WorkingRecordItemsProps>();

  let currentDate = dayjs(selectDate.startDate).clone().toDate();

  while (currentDate <= selectDate.endDate) {
    const attendanceRecord = attendanceRecords.find(
      (item) => dayjs(item.workingDate).format('YYYY-MM-DD') === dayjs(currentDate).format('YYYY-MM-DD'),
    );

    if (!attendanceRecord) {
      result.push({ date: currentDate });
    } else {
      result.push({
        date: currentDate,
        clockInTime: attendanceRecord.clockInTime,
        clockOutTime: attendanceRecord.clockOutTime,
        leaveWorkAt: attendanceRecord.leaveWorkAt,
        status: attendanceRecord.status,
        dayOffType: attendanceRecord.dayOffType,
      });
    }

    currentDate = dayjs(currentDate).add(1, 'day').toDate();
  }

  return result;
}

interface WorkTimeBarCharProps {
  totalHours: number;
  currentHours: number;
  color?: string;
  textBlur?: boolean;
}

const WorkTimeBarChart = ({ totalHours, currentHours, color = 'gray', textBlur = true }: WorkTimeBarCharProps) => {
  return (
    <div className="flex flex-row items-center justify-start gap-2">
      <div
        className={cx('h-8 flex-none rounded-2xl')}
        style={{ backgroundColor: color, width: `${(currentHours / totalHours) * 100}%` }}
      ></div>

      <div className={cx('flex-none font-bold', textBlur && 'text-gray-500')}>{currentHours}시간</div>
    </div>
  );
};

export default function WorkingRecordContents() {
  // context
  const { selectDate } = useContext(WorkingTimeContext);

  // store
  const currentUser = useStore((state) => state.currentUser);

  // query
  const { attendanceRecords } = useGetAttendanceRecord({
    userUniqueId: currentUser?.uniqueId || '',
    startDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'),
    endDate: dayjs(selectDate.endDate).format('YYYY-MM-DD'),
  });

  const dataList = getDates(selectDate, attendanceRecords);

  return (
    <div className="mt-5 flex w-full flex-col items-center justify-center gap-1">
      {/* 근로 시간 */}
      <div className="my-6 w-full">
        <div className="flex flex-col items-center justify-start">
          <div className="w-full">
            <h3 className="text-lg font-semibold">근로 시간</h3>
          </div>

          <div className="flex h-14 w-full flex-row items-center justify-start gap-2">
            <div className="w-24 flex-none text-right font-semibold">누적 근로 시간</div>
            <div className="w-1/2 border-l-[1px] pl-2">
              <WorkTimeBarChart
                color="dodgerblue"
                textBlur={false}
                totalHours={40}
                currentHours={Math.floor(
                  attendanceRecords
                    .map((item) => {
                      const duration =
                        (item.clockInTime && item.clockOutTime && getDuration(item.clockInTime, item.clockOutTime)) ||
                        0;

                      return duration - (duration > ONE_HOUR * 8 ? ONE_HOUR : 0);
                    })
                    .reduce((sum, value) => sum + value, 0) / 3_600,
                )}
              />
            </div>
          </div>

          <div className="flex h-14 w-full flex-row items-center justify-start gap-2">
            <div className="w-24 flex-none text-right font-semibold">예상 근로 시간</div>
            <div className="w-1/2 border-l-[1px] pl-2">
              <WorkTimeBarChart totalHours={40} currentHours={40} />
            </div>
          </div>
        </div>
      </div>

      {/* header */}
      <WorkingRecordHeaders />

      {/* contents */}
      {dataList.map((item) => (
        <WorkingRecordItems
          key={`working-record-key-${dayjs(item.date).unix()}`}
          date={item.date}
          clockInTime={item.clockInTime}
          leaveWorkAt={item.leaveWorkAt}
          clockOutTime={item.clockOutTime}
          status={item.status}
          dayOffType={item.dayOffType}
        />
      ))}
    </div>
  );
}
