// day of week
import dayjs from 'dayjs';
import { padStart } from 'lodash';

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

export function parseTimeFormat(seconds: number): string {
  const sec = seconds % 60;
  const min = Math.floor((seconds / 60) % 60);
  const hours = Math.floor(seconds / 3_600);

  return `${padStart(hours + '', 2, '0')}:${padStart(min + '', 2, '0')}:${padStart(sec + '', 2, '0')}`;
}
