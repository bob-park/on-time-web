import { isIncludeTime } from '@/utils/dataUtils';

import dayjs from 'dayjs';
import padStart from 'lodash/padStart';

// day of week

const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

export function getDaysOfWeek(day: number): string {
  return daysOfWeek[day];
}

export function getWeekStartDate(date: Date): Date {
  const dayOfWeek = dayjs(date).day();

  if (dayOfWeek < 1) {
    return dayjs(date).add(-6, 'day').toDate();
  }

  return dayjs(date).day(1).toDate();
}

export function getDuration(startDate: Date, endDate: Date): number {
  return Math.abs(dayjs(endDate).unix() - dayjs(startDate).unix());
}

export function round(value: number, loc: number): number {
  const pow = Math.pow(10, loc);

  return Math.round(value * pow) / pow;
}

const ONE_HOUR = 3_600;

export function parseHours(seconds: number): string {
  const hours = Math.floor(seconds / ONE_HOUR);
  const min = Math.floor((seconds / 60) % 60);

  return `${hours}h ${padStart(min + '', 2, '0')}m`;
}

// 근무 시간(초). 8시간 초과이거나 점심시간(12시)을 포함하면 1시간을 제외한다.
export function getWorkDuration(workingDate: Date, clockInTime?: Date, clockOutTime?: Date): number {
  if (!clockInTime || !clockOutTime) {
    return 0;
  }

  const duration = getDuration(clockInTime, clockOutTime);
  const hasLunch =
    duration > ONE_HOUR * 8 ||
    isIncludeTime({ from: clockInTime, to: clockOutTime }, dayjs(workingDate).hour(12).toDate());

  return duration - (hasLunch ? ONE_HOUR : 0);
}
