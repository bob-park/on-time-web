'use client';

import { useState } from 'react';

import { VacationType } from '@/domain/document/apis/document.dto';
import DocumentStatusBadge from '@/domain/document/components/DocumentStatusBadge';
import { useVacationDocuments } from '@/domain/document/queries/vacation';
import { useUserLeaveEntry } from '@/domain/users/queries/user';
import Badge from '@/shared/components/Badge';
import { Card, CardSection } from '@/shared/components/Card';
import Segment from '@/shared/components/Segment';
import StatCard from '@/shared/components/StatCard';
import { TableSkeletonRows, rowClass, tdClass, thClass } from '@/shared/components/Table';
import dayjs from '@/shared/dayjs';

import { useTranslations } from 'next-intl';

export default function DayOffHistoryContents() {
  const t = useTranslations('dayoff.used');

  const thisYear = dayjs().year();
  const [selectedYear, setSelectedYear] = useState<number>(thisYear);

  const yearOptions = [thisYear, thisYear - 1, thisYear - 2].map((year) => ({
    label: t('year', { year }),
    value: year,
  }));

  const { vacationDocuments, isLoading } = useVacationDocuments({
    startDateFrom: `${selectedYear}-01-01`,
    endDateTo: `${selectedYear}-12-31`,
    status: 'APPROVED',
    page: 0,
    size: 1000,
  });

  const { leaveEntry } = useUserLeaveEntry(selectedYear);
  const totalLeaveDays = leaveEntry?.totalLeaveDays ?? 0;
  const usedLeaveDays = leaveEntry?.usedLeaveDays ?? 0;

  const sortedDocuments = [...vacationDocuments].sort((a, b) => (dayjs(a.startDate).isAfter(b.startDate) ? 1 : -1));

  return (
    <div className="flex w-full flex-col gap-4">
      {/* 연도 필터 */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-3 text-xs font-semibold">{t('yearLabel')}</span>
        <Segment
          ariaLabel={t('yearFilterAria')}
          options={yearOptions}
          value={selectedYear}
          onChange={setSelectedYear}
        />
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t('stat.total')} value={totalLeaveDays.toFixed(1)} unit={t('unit')} />
        <StatCard label={t('stat.used')} value={usedLeaveDays.toFixed(1)} unit={t('unit')} />
        <StatCard
          label={t('stat.remaining')}
          value={(totalLeaveDays - usedLeaveDays).toFixed(1)}
          unit={t('unit')}
          caption={t('stat.expireCaption', { year: selectedYear })}
        />
      </div>

      {/* 상세 내역 */}
      <Card className="mt-1 w-full">
        <CardSection title={t('table.title')}>
          <span className="text-3 text-xs">
            {t('table.count', { year: selectedYear, count: vacationDocuments.length })}
          </span>
        </CardSection>

        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={`w-[10rem] ${thClass}`}>{t('table.colType')}</th>
                <th className={`w-[12rem] ${thClass}`}>{t('table.colPeriod')}</th>
                <th className={`w-[6rem] ${thClass}`}>{t('table.colDays')}</th>
                <th className={`w-[7rem] ${thClass}`}>{t('table.colStatus')}</th>
                <th className={thClass}>{t('table.colReason')}</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <TableSkeletonRows cols={5} />
              ) : sortedDocuments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-3 px-4 py-10 text-center text-sm">
                    {t('empty', { year: selectedYear })}
                  </td>
                </tr>
              ) : (
                sortedDocuments.map((doc) => (
                  <tr key={`vacation-history-${doc.id}`} className={rowClass}>
                    {/* 종류 */}
                    <td className={tdClass}>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <VacationTypeBadge type={doc.vacationType} />
                        {doc.vacationSubType && (
                          <span className="text-3 text-xs">
                            {t(doc.vacationSubType === 'AM_HALF_DAY_OFF' ? 'subType.amHalf' : 'subType.pmHalf')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 기간 */}
                    <td className={tdClass}>
                      {dayjs(doc.startDate).isSame(doc.endDate, 'day') ? (
                        <span className="font-semibold">{dayjs(doc.startDate).format('YYYY.MM.DD')}</span>
                      ) : (
                        <span className="font-semibold">
                          {dayjs(doc.startDate).format('YYYY.MM.DD')}
                          <span className="text-3 font-normal"> — {dayjs(doc.endDate).format('YYYY.MM.DD')}</span>
                        </span>
                      )}
                    </td>

                    {/* 일수 */}
                    <td className={`font-medium ${tdClass}`}>{t('table.days', { days: doc.usedDays.toFixed(1) })}</td>

                    {/* 상태 */}
                    <td className={tdClass}>
                      <DocumentStatusBadge status={doc.status} />
                    </td>

                    {/* 사유 */}
                    <td className={`min-w-0 ${tdClass}`}>
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
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
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
