'use client';

import { useState } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { useUserLeaveEntries, useUsersUsedVacations } from '@/domain/users/queries/user';
import Card from '@/shared/components/Card';
import Segment from '@/shared/components/Segment';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import DayOffViewContents from './DayOffViewContents';

const COLUMN_COUNT = 19;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const SKELETON_ROW_COUNT = 5;

const headerCellClass = 'text-3 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap';

// ── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-soft border-b last:border-b-0">
      <td className="bg-base-100 sticky left-0 z-10 px-3 py-3">
        <div className="bg-base-300 mx-auto h-3 w-4 animate-pulse rounded" />
      </td>
      <td className="bg-base-100 border-soft sticky left-[48px] z-10 border-r px-3 py-3">
        <div className="bg-base-300 h-3 w-16 animate-pulse rounded" />
        <div className="bg-base-200 mt-1 h-2 w-10 animate-pulse rounded" />
      </td>
      {Array.from({ length: COLUMN_COUNT - 2 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="bg-base-300 mx-auto h-3 w-8 animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DayOffManageContents() {
  const t = useTranslations('manager.vacations');

  const thisYear = dayjs().year();
  const [year, setYear] = useState<number>(thisYear);

  const yearOptions = [thisYear, thisYear - 1, thisYear - 2].map((value) => ({
    label: t('yearLabel', { year: String(value) }),
    value,
  }));

  const { users, isLoading: isLoadingLeave } = useUserLeaveEntries({ year });
  const { usersUsedVacations, isLoading: isLoadingVacations } = useUsersUsedVacations({ year });
  const isLoading = isLoadingLeave || isLoadingVacations;

  const sortedUsers = [...users].sort((o1, o2) =>
    dayjs(o1.employment?.effectiveDate).isAfter(o2.employment?.effectiveDate) ? 1 : -1,
  );

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 연도 필터 + 안내 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-3 text-xs font-semibold">{t('yearFilterLabel')}</span>
        <Segment ariaLabel={t('yearFilterAria')} options={yearOptions} value={year} onChange={setYear} />
        <span className="flex-1" />
        <span className="text-3 text-[11px]">
          {t.rich('hint', { comp: (chunks) => <span className="text-2 font-semibold">{chunks}</span> })}
        </span>
      </div>

      {/* Matrix zone — 가로 스크롤 13px 테이블 */}
      <Card className="overflow-x-auto p-2">
        <table className="w-max border-collapse text-[13px]" aria-label={t('gridLabel')}>
          <thead>
            <tr className="border-soft border-b">
              <th className={cx(headerCellClass, 'bg-base-200 sticky left-0 z-20 min-w-[48px]')}>{t('colOrder')}</th>
              <th
                className={cx(
                  headerCellClass,
                  'bg-base-200 border-soft sticky left-[48px] z-20 min-w-[120px] border-r text-left',
                )}
              >
                {t('colName')}
              </th>
              <th className={cx(headerCellClass, 'min-w-[110px]')}>{t('colEffectiveDate')}</th>
              <th className={cx(headerCellClass, 'min-w-[96px]')}>
                {t('colAnnual')}
                <span className="text-2">{t('colAnnualComp')}</span>
              </th>
              <th className={cx(headerCellClass, 'border-soft min-w-[88px] border-r')}>{t('colAvailable')}</th>
              {MONTHS.map((m) => (
                <th key={`th-month-${m}`} className={cx(headerCellClass, 'min-w-[60px]')}>
                  {t('colMonth', { month: m })}
                </th>
              ))}
              <th className={cx(headerCellClass, 'border-soft min-w-[80px] border-l')}>{t('colTotal')}</th>
              <th className={cx(headerCellClass, 'min-w-[80px]')}>{t('colRemaining')}</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => <SkeletonRow key={i} />)
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <HiOutlineDocumentText className="text-3 size-10" />
                    <p className="text-2 text-sm font-semibold">{t('noEmployees')}</p>
                    <p className="text-3 text-sm">{t('noEmployeesHint')}</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedUsers.map((user, index) => (
                <DayOffViewContents
                  key={`dayoff-manage-contents-${user.id}`}
                  order={index + 1}
                  user={user}
                  usedVacations={usersUsedVacations.find((item) => item.userUniqueId === user.id)?.usedVacations || []}
                />
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
