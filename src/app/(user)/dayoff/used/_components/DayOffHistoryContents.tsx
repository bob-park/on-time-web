'use client';

import { useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { VacationSubType, VacationType } from '@/domain/document/apis/document.dto';
import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import { useVacationDocuments } from '@/domain/document/queries/vacation';
import { useUserLeaveEntry } from '@/domain/users/queries/user';
import Badge from '@/shared/components/Badge';
import StatCard from '@/shared/components/StatCard';

import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';

const thClass =
  'text-2 border-b border-soft px-4 py-2.5 text-left text-[11px] font-semibold tracking-[1.4px] uppercase';

export default function DayOffHistoryContents() {
  const t = useTranslations('dayoff.used');

  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  const { vacationDocuments, isLoading } = useVacationDocuments({
    startDateFrom: `${selectedYear}-01-01`,
    endDateTo: `${selectedYear}-12-31`,
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });

  const { leaveEntry } = useUserLeaveEntry(selectedYear);
  const freeLeaveDays = (leaveEntry?.totalLeaveDays ?? 0) - (leaveEntry?.usedLeaveDays ?? 0);

  // 총 사용일 합산
  const totalUsedDays = vacationDocuments.reduce((sum, v) => sum + v.usedDays, 0);
  const totalGeneralDays = vacationDocuments
    .filter((v) => v.vacationType === 'GENERAL')
    .reduce((sum, v) => sum + v.usedDays, 0);
  const totalCompDays = vacationDocuments
    .filter((v) => v.vacationType === 'COMPENSATORY')
    .reduce((sum, v) => sum + v.usedDays, 0);

  const handleYearChange = (delta: number) => {
    setSelectedYear((y) => y + delta);
  };

  const sortedDocuments = [...vacationDocuments].sort((a, b) => (dayjs(a.startDate).isAfter(b.startDate) ? 1 : -1));

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 연도 네비게이터 */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label={t('prevYear')}
          className="border-base-300 text-2 hover:bg-base-200 hover:text-base-content flex size-9 items-center justify-center rounded-[10px] border transition-colors duration-150"
          onClick={() => handleYearChange(-1)}
        >
          <IoIosArrowBack className="size-4" />
        </button>
        <span className="text-base-content min-w-[4.5rem] text-center text-base font-bold">
          {t('year', { year: selectedYear })}
        </span>
        <button
          type="button"
          aria-label={t('nextYear')}
          className="border-base-300 text-2 hover:bg-base-200 hover:text-base-content flex size-9 items-center justify-center rounded-[10px] border transition-colors duration-150"
          onClick={() => handleYearChange(1)}
        >
          <IoIosArrowForward className="size-4" />
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* 총 사용일 */}
        <StatCard label={t('stat.totalUsed')} value={totalUsedDays.toFixed(1)} unit={t('unit')}>
          <div className="mt-3 flex flex-wrap gap-2">
            {totalGeneralDays > 0 && (
              <Badge variant="primary">{t('stat.generalChip', { days: totalGeneralDays.toFixed(1) })}</Badge>
            )}
            {totalCompDays > 0 && (
              <Badge variant="wait">{t('stat.compChip', { days: totalCompDays.toFixed(1) })}</Badge>
            )}
            {totalUsedDays === 0 && <span className="text-3 text-xs">{t('stat.noneUsed')}</span>}
          </div>
        </StatCard>

        {/* 잔여 연차 */}
        <StatCard
          label={t('stat.remaining')}
          value={freeLeaveDays.toFixed(1)}
          unit={t('unit')}
          caption={t('stat.expireCaption', { year: selectedYear })}
        />
      </div>

      {/* 상세 내역 */}
      <div className="bg-base-100 border-base-300 rounded-box shadow-whisper mt-1 w-full border">
        <div className="border-soft flex items-center justify-between border-b px-5 py-4">
          <span className="text-base-content text-sm font-semibold">{t('table.title')}</span>
          <span className="text-3 text-xs">
            {t('table.count', { year: selectedYear, count: vacationDocuments.length })}
          </span>
        </div>

        <div className="w-full overflow-x-auto select-none">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className={`w-16 ${thClass}`}>{t('table.colNo')}</th>
                <th className={`w-[7rem] ${thClass}`}>{t('table.colType')}</th>
                <th className={`w-[6rem] ${thClass}`}>{t('table.colSubType')}</th>
                <th className={`w-[11rem] ${thClass}`}>{t('table.colDate')}</th>
                <th className={`w-[6rem] ${thClass}`}>{t('table.colDays')}</th>
                <th className={thClass}>{t('table.colNote')}</th>
                <th className={`w-[7rem] ${thClass}`}>{t('table.colStatus')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <SkeletonRows />
              ) : sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-3 py-16 text-center text-sm">
                    {t('empty', { year: selectedYear })}
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((doc, index) => (
                  <tr
                    key={`vacation-history-${doc.id}`}
                    className="border-soft hover:bg-base-200 border-b transition-colors duration-100 last:border-b-0"
                  >
                    {/* 번호 */}
                    <td className="text-3 px-4 py-4 text-sm">{index + 1}</td>

                    {/* 종류 */}
                    <td className="px-4 py-4">
                      <VacationTypeBadge type={doc.vacationType} />
                    </td>

                    {/* 구분 */}
                    <td className="text-2 px-4 py-4">
                      <VacationSubTypeText subType={doc.vacationSubType} />
                    </td>

                    {/* 사용일 */}
                    <td className="text-base-content px-4 py-4">
                      {dayjs(doc.startDate).isSame(doc.endDate, 'day') ? (
                        <span className="font-semibold">{dayjs(doc.startDate).format('YYYY.MM.DD')}</span>
                      ) : (
                        <span className="font-semibold">
                          {dayjs(doc.startDate).format('YYYY.MM.DD')}
                          <span className="text-3 font-normal"> — {dayjs(doc.endDate).format('YYYY.MM.DD')}</span>
                        </span>
                      )}
                    </td>

                    {/* 사용일수 */}
                    <td className="text-base-content px-4 py-4 font-medium">
                      {t('table.days', { days: doc.usedDays.toFixed(1) })}
                    </td>

                    {/* 비고 */}
                    <td className="min-w-0 px-4 py-4">
                      <div className="space-y-1">
                        {doc.reason && <p className="text-2 truncate">{doc.reason}</p>}
                        {doc.usedCompLeaveEntries?.map((entry) => (
                          <p key={`comp-entry-${entry.id}`} className="text-3 text-xs">
                            {dayjs(entry.compLeaveEntry.effectiveDate).format('YYYY-MM-DD')} —{' '}
                            {entry.compLeaveEntry.contents}
                          </p>
                        ))}
                      </div>
                    </td>

                    {/* 상태 */}
                    <td className="px-4 py-4">
                      <DocumentStatusBadge status={doc.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function VacationTypeBadge({ type }: { type: VacationType }) {
  const t = useTranslations('dayoff.used');
  switch (type) {
    case 'COMPENSATORY':
      return <Badge variant="wait">{t('type.compensatory')}</Badge>;
    case 'OFFICIAL':
      return <Badge variant="neutral">{t('type.official')}</Badge>;
    default:
      return <Badge variant="primary">{t('type.general')}</Badge>;
  }
}

function VacationSubTypeText({ subType }: { subType?: VacationSubType }) {
  const t = useTranslations('dayoff.used');

  switch (subType) {
    case 'AM_HALF_DAY_OFF':
      return <span>{t('subType.amHalf')}</span>;
    case 'PM_HALF_DAY_OFF':
      return <span>{t('subType.pmHalf')}</span>;
    default:
      return <span>{t('subType.allDay')}</span>;
  }
}

function SkeletonRows() {
  const widths = [
    { no: 'w-4', type: 'w-14', sub: 'w-12', date: 'w-24', days: 'w-10', note: 'w-40' },
    { no: 'w-4', type: 'w-16', sub: 'w-14', date: 'w-28', days: 'w-10', note: 'w-32' },
    { no: 'w-4', type: 'w-14', sub: 'w-12', date: 'w-24', days: 'w-10', note: 'w-36' },
    { no: 'w-4', type: 'w-14', sub: 'w-16', date: 'w-24', days: 'w-10', note: 'w-28' },
    { no: 'w-4', type: 'w-16', sub: 'w-12', date: 'w-28', days: 'w-10', note: 'w-40' },
  ];
  return (
    <>
      {widths.map((w, i) => (
        <tr key={i} className="border-soft border-b last:border-b-0">
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-3.5 animate-pulse rounded ${w.no}`} />
          </td>
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-[22px] animate-pulse rounded-md ${w.type}`} />
          </td>
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-3.5 animate-pulse rounded ${w.sub}`} />
          </td>
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-3.5 animate-pulse rounded ${w.date}`} />
          </td>
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-3.5 animate-pulse rounded ${w.days}`} />
          </td>
          <td className="px-4 py-4">
            <div className={`bg-base-300 h-3.5 animate-pulse rounded ${w.note}`} />
          </td>
          <td className="px-4 py-4">
            <div className="bg-base-300 h-[22px] w-16 animate-pulse rounded-md" />
          </td>
        </tr>
      ))}
    </>
  );
}
