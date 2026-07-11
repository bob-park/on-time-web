'use client';

import { useState } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { useUserLeaveEntries, useUsersUsedVacations } from '@/domain/user/query/user';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

import DayOffViewContents from './DayOffViewContents';

const COLUMN_COUNT = 19;
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const SKELETON_ROW_COUNT = 5;

const headerCellClass = 'text-base-content/50 px-3 py-2.5 text-center text-xs font-semibold whitespace-nowrap';

// ── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-base-content/[0.06] border-b last:border-b-0">
      <td className="bg-base-300 sticky left-0 z-10 px-3 py-3">
        <div className="bg-base-content/10 mx-auto h-3 w-4 animate-pulse rounded" />
      </td>
      <td className="bg-base-300 border-base-content/[0.08] sticky left-[48px] z-10 border-r px-3 py-3">
        <div className="bg-base-content/10 h-3 w-16 animate-pulse rounded" />
        <div className="bg-base-content/[0.06] mt-1 h-2 w-10 animate-pulse rounded" />
      </td>
      {Array.from({ length: COLUMN_COUNT - 2 }).map((_, i) => (
        <td key={i} className="px-3 py-3">
          <div className="bg-base-content/10 mx-auto h-3 w-8 animate-pulse rounded" />
        </td>
      ))}
    </tr>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DayOffManageContents() {
  const t = useTranslations('manager.vacations');
  const [year, setYear] = useState<number>(dayjs().year());

  const { users, isLoading: isLoadingLeave } = useUserLeaveEntries({ year });
  const { usersUsedVacations, isLoading: isLoadingVacations } = useUsersUsedVacations({ year });
  const isLoading = isLoadingLeave || isLoadingVacations;

  const sortedUsers = [...users].sort((o1, o2) =>
    dayjs(o1.employment?.effectiveDate).isAfter(o2.employment?.effectiveDate) ? 1 : -1,
  );

  return (
    <div className="border-base-content/10 bg-base-300 overflow-hidden rounded-2xl border shadow-sm">
      {/* Header zone — 타이틀 + 연도 navigator */}
      <div className="border-base-content/[0.08] flex items-center justify-between gap-4 border-b px-5 py-4">
        <div>
          <div className="eyebrow">{t('eyebrow')}</div>
          <h2 className="mt-0.5 text-base font-bold tracking-tight">{t('title')}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t('prevYear')}
            className="border-base-content/10 text-base-content/70 hover:bg-base-content/10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
            onClick={() => setYear(year - 1)}
          >
            <IoIosArrowBack className="size-4" />
          </button>
          <span className="min-w-[72px] text-center text-sm font-semibold">
            {t('yearLabel', { year: String(year) })}
          </span>
          <button
            type="button"
            aria-label={t('nextYear')}
            className="border-base-content/10 text-base-content/70 hover:bg-base-content/10 flex h-8 w-8 items-center justify-center rounded-full border transition-colors"
            onClick={() => setYear(year + 1)}
          >
            <IoIosArrowForward className="size-4" />
          </button>
        </div>
      </div>

      {/* Hint */}
      <div className="flex justify-end px-5 pt-3">
        <span className="text-base-content/40 text-[11px]">
          {t.rich('hint', { comp: (chunks) => <span className="text-warning">{chunks}</span> })}
        </span>
      </div>

      {/* Matrix zone — 가로 스크롤 13px 테이블 */}
      <div className="overflow-x-auto p-2">
        <table className="w-max border-collapse text-[13px]" aria-label={t('gridLabel')}>
          <thead>
            <tr className="border-base-content/[0.08] border-b">
              <th className={cx(headerCellClass, 'bg-base-300 sticky left-0 z-20 min-w-[48px]')}>{t('colOrder')}</th>
              <th
                className={cx(
                  headerCellClass,
                  'bg-base-300 border-base-content/[0.08] sticky left-[48px] z-20 min-w-[120px] border-r text-left',
                )}
              >
                {t('colName')}
              </th>
              <th className={cx(headerCellClass, 'min-w-[110px]')}>{t('colEffectiveDate')}</th>
              <th className={cx(headerCellClass, 'min-w-[96px]')}>
                {t('colAnnual')}
                <span className="text-warning">{t('colAnnualComp')}</span>
              </th>
              <th className={cx(headerCellClass, 'border-base-content/[0.08] min-w-[88px] border-r')}>
                {t('colAvailable')}
              </th>
              {MONTHS.map((m) => (
                <th key={`th-month-${m}`} className={cx(headerCellClass, 'min-w-[60px]')}>
                  {t('colMonth', { month: m })}
                </th>
              ))}
              <th className={cx(headerCellClass, 'border-base-content/[0.08] min-w-[80px] border-l')}>
                {t('colTotal')}
              </th>
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
                    <HiOutlineDocumentText className="text-base-content/20 size-10" />
                    <p className="text-base-content/60 text-sm font-semibold">{t('noEmployees')}</p>
                    <p className="text-base-content/40 text-sm">{t('noEmployeesHint')}</p>
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
      </div>
    </div>
  );
}
