// day of week
import dayjs from 'dayjs';

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
