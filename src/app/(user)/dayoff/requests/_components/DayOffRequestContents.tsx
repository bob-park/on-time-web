'use client';

import { useEffect, useState } from 'react';

import { FaCheck } from 'react-icons/fa6';

import { useRouter } from 'next/navigation';

import SelectUserCompLeaveEntriesModal from '@/app/(user)/dayoff/requests/_components/SelectUserCompLeaveEntriesModal';
import { useCreateVacation } from '@/domain/document/query/vacation';
import { useGetCurrentUser } from '@/domain/user/query/user';
import useToast from '@/shared/hooks/useToast';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { DateRange, DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

function countBusinessDays(from: Date, to: Date): number {
  let count = 0;
  let current = dayjs(from).startOf('day');
  const end = dayjs(to).startOf('day');
  while (current.isBefore(end) || current.isSame(end)) {
    const day = current.day();
    if (day !== 0 && day !== 6) count++;
    current = current.add(1, 'day');
  }
  return count;
}

interface VacationTypeOption {
  value: VacationType;
  labelKey: string;
  descKey: string;
}

const VACATION_TYPES: VacationTypeOption[] = [
  { value: 'GENERAL', labelKey: 'general', descKey: 'generalDesc' },
  { value: 'COMPENSATORY', labelKey: 'compensatory', descKey: 'compensatoryDesc' },
  { value: 'OFFICIAL', labelKey: 'official', descKey: 'officialDesc' },
];

const VACATION_SUBTYPES = [
  { value: 'ALL_DAY_OFF' as const, labelKey: 'allDay', days: 1 },
  { value: 'AM_HALF_DAY_OFF' as VacationSubType, labelKey: 'amHalf', days: 0.5 },
  { value: 'PM_HALF_DAY_OFF' as VacationSubType, labelKey: 'pmHalf', days: 0.5 },
];

export default function DayOffRequestContent() {
  const t = useTranslations('dayoff.request');

  const [selectedVacationType, setSelectedVacationType] = useState<VacationType>();
  const [selectedVacationSubType, setSelectedVacationSubType] = useState<VacationSubType | 'ALL_DAY_OFF'>();
  const [reason, setReason] = useState<string>(t('settings.reasonPlaceholder'));
  const [selectedDate, setSelectedDate] = useState<DateRange>(() => ({
    from: dayjs().toDate(),
    to: dayjs().toDate(),
  }));
  const [usedCompLeaveEntries, setUsedCompLeaveEntries] = useState<UsedCompLeaveEntryRequest[]>([]);
  const [showSelectCompLeaveEntries, setShowSelectCompLeaveEntries] = useState<boolean>(false);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState<boolean>(false);

  const router = useRouter();
  const { push } = useToast();
  const { currentUser } = useGetCurrentUser();

  const { createVacation, isLoading } = useCreateVacation(
    (data) => {
      push(t('toast.created'), 'info');
      router.push(`/dayoff/${data.id}`);
    },
    () => {
      push(t('toast.error'), 'error');
    },
  );

  useEffect(() => {
    showSelectCompLeaveEntries && setUsedCompLeaveEntries([]);
  }, [showSelectCompLeaveEntries]);

  const handleRequestClick = () => {
    setHasAttemptedSubmit(true);

    if (!selectedVacationType || !selectedVacationSubType || !reason) {
      push(t('toast.required'), 'error');
      return;
    }
    createVacation({
      vacationType: selectedVacationType,
      vacationSubType: selectedVacationSubType === 'ALL_DAY_OFF' ? undefined : selectedVacationSubType,
      startDate: dayjs(selectedDate.from).format('YYYY-MM-DD'),
      endDate: dayjs(selectedDate.to).format('YYYY-MM-DD'),
      reason,
      compLeaveEntries: usedCompLeaveEntries,
    });
  };

  // summary calculations
  const isHalfDay = selectedVacationSubType === 'AM_HALF_DAY_OFF' || selectedVacationSubType === 'PM_HALF_DAY_OFF';
  const businessDays = selectedDate.from && selectedDate.to ? countBusinessDays(selectedDate.from, selectedDate.to) : 0;
  const usedDays = isHalfDay ? 0.5 : businessDays;
  const freeLeaveDays = (currentUser?.leaveEntry?.totalLeaveDays ?? 0) - (currentUser?.leaveEntry?.usedLeaveDays ?? 0);
  const remainingAfterUse = freeLeaveDays - usedDays;

  const canSubmit = !!selectedVacationType && !!selectedVacationSubType && !!reason;

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        {/* 2-column layout */}
        <div className="flex w-full flex-col gap-4 lg:flex-row">
          {/* Left — 휴가 구분 설정 */}
          <div className="bg-base-300 flex w-full flex-none flex-col gap-5 rounded-lg p-6 lg:w-80">
            {/* 휴가 구분 */}
            <div>
              <p className="text-base-content/60 mb-2 text-xs font-medium">
                {t('settings.typeLabel')}
                {hasAttemptedSubmit && !selectedVacationType && (
                  <span className="text-error ml-2">{t('settings.selectRequired')}</span>
                )}
              </p>
              <div className="flex flex-col gap-2">
                {VACATION_TYPES.map((type) => {
                  const selected = selectedVacationType === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => {
                        setSelectedVacationType(type.value);
                        if (type.value !== 'COMPENSATORY') setUsedCompLeaveEntries([]);
                      }}
                      className={cx(
                        'flex flex-col items-start gap-1 rounded-lg px-4 py-3 text-left transition-colors duration-150',
                        selected ? 'ring-primary bg-primary/10 ring-1 ring-inset' : 'bg-secondary hover:bg-[#2e2e2e]',
                      )}
                    >
                      <span className={cx('text-sm font-bold', selected && 'text-primary')}>
                        {t(`type.${type.labelKey}`)}
                      </span>
                      <span className="text-base-content/50 text-xs">{t(`type.${type.descKey}`)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 부가 구분 */}
            <div>
              <p className="text-base-content/60 mb-2 text-xs font-medium">
                {t('settings.subTypeLabel')}
                {hasAttemptedSubmit && !selectedVacationSubType && (
                  <span className="text-error ml-2">{t('settings.selectRequired')}</span>
                )}
              </p>
              <div className="flex flex-col gap-2">
                {VACATION_SUBTYPES.map((sub) => {
                  const selected = selectedVacationSubType === sub.value;
                  return (
                    <button
                      key={sub.value}
                      type="button"
                      onClick={() => setSelectedVacationSubType(sub.value)}
                      className={cx(
                        'flex h-10 items-center justify-between rounded-full px-4 text-[13px] transition-colors duration-150',
                        selected ? 'bg-primary text-primary-content font-bold' : 'bg-secondary hover:bg-[#2e2e2e]',
                      )}
                    >
                      <span>{t(`subType.${sub.labelKey}`)}</span>
                      <span className={cx('text-xs', selected ? 'text-primary-content/65' : 'text-base-content/50')}>
                        {t('subType.days', { days: sub.days })}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 보상 휴가 선택 (COMPENSATORY 시에만) */}
            {selectedVacationType === 'COMPENSATORY' && (
              <div>
                <p className="text-base-content/60 mb-2 text-xs font-medium">{t('settings.compLabel')}</p>
                <button
                  type="button"
                  onClick={() => setShowSelectCompLeaveEntries(true)}
                  className={cx(
                    'flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                    usedCompLeaveEntries.length !== 0
                      ? 'ring-primary bg-primary/10 text-primary ring-1 ring-inset'
                      : 'bg-secondary hover:bg-[#2e2e2e]',
                  )}
                >
                  {usedCompLeaveEntries.length !== 0 ? (
                    <>
                      <FaCheck className="size-3.5" /> {t('settings.compSelected')}
                    </>
                  ) : (
                    t('settings.compSelect')
                  )}
                </button>
              </div>
            )}

            {/* 사유 */}
            <div>
              <p className="text-base-content/60 mb-2 text-xs font-medium">
                {t('settings.reasonLabel')}
                {hasAttemptedSubmit && !reason && (
                  <span className="text-error ml-2">{t('settings.inputRequired')}</span>
                )}
              </p>
              <input
                type="text"
                maxLength={200}
                className={cx(
                  'bg-base-300 text-base-content placeholder:text-base-content/40 w-full rounded-full px-4 py-2.5 text-sm transition-shadow duration-150 focus:outline-none',
                  hasAttemptedSubmit && !reason
                    ? 'shadow-[inset_0_0_0_1px_#f3727f]'
                    : 'shadow-[inset_0_0_0_1px_#7c7c7c] focus:shadow-[inset_0_0_0_1px_#1ed760]',
                )}
                placeholder={t('settings.reasonPlaceholder')}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* Right — 날짜 선택 */}
          <div className="bg-base-300 flex flex-1 flex-col rounded-lg p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base-content text-base font-semibold">{t('calendar.title')}</p>
              {selectedDate.from && selectedDate.to && (
                <span className="bg-primary/15 text-primary inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold">
                  {t('calendar.rangeBadge', { days: usedDays })}
                </span>
              )}
            </div>
            <div className="flex flex-1 items-start justify-center">
              <DayPicker
                className="rdp-dark"
                locale={ko}
                mode="range"
                selected={selectedDate}
                onSelect={(value) => value && setSelectedDate(value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom — 신청 요약 패널 */}
        <div className="bg-base-300 w-full rounded-lg p-6">
          <div className="flex flex-wrap items-center gap-8">
            {/* 선택 날짜 */}
            <div>
              <p className="text-base-content/50 text-[11px] font-semibold tracking-wider uppercase">
                {t('summary.selectedDate')}
              </p>
              <p className="text-base-content mt-1 text-base font-bold">
                {dayjs(selectedDate.from).format('YYYY.MM.DD')}
                {selectedDate.to && !dayjs(selectedDate.from).isSame(selectedDate.to, 'day') && (
                  <> — {dayjs(selectedDate.to).format('YYYY.MM.DD')}</>
                )}
              </p>
            </div>

            {/* 사용 기간 */}
            <div>
              <p className="text-base-content/50 text-[11px] font-semibold tracking-wider uppercase">
                {t('summary.usedDays')}
              </p>
              <p className="text-base-content mt-1 text-base font-bold">
                {t('summary.days', { days: usedDays.toFixed(1) })}
              </p>
            </div>

            {/* 사용 후 잔여 */}
            <div>
              <p className="text-base-content/50 text-[11px] font-semibold tracking-wider uppercase">
                {t('summary.remainingAfter')}
              </p>
              <p className={cx('mt-1 text-base font-bold', remainingAfterUse < 0 ? 'text-error' : 'text-base-content')}>
                {t('summary.days', { days: remainingAfterUse.toFixed(1) })}
              </p>
            </div>

            {/* 승인 예상 */}
            <div>
              <p className="text-base-content/50 text-[11px] font-semibold tracking-wider uppercase">
                {t('summary.approval')}
              </p>
              <p className="text-base-content mt-1 text-base font-bold">{t('summary.approvalValue')}</p>
            </div>

            {/* 버튼 (우측 정렬) */}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setSelectedVacationType(undefined);
                  setSelectedVacationSubType(undefined);
                  setReason(t('settings.reasonPlaceholder'));
                  setSelectedDate({ from: dayjs().toDate(), to: dayjs().toDate() });
                  setUsedCompLeaveEntries([]);
                }}
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                disabled={isLoading || !canSubmit}
                onClick={handleRequestClick}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    {t('actions.submitting')}
                  </span>
                ) : (
                  t('actions.submit')
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <SelectUserCompLeaveEntriesModal
        show={showSelectCompLeaveEntries}
        onClose={() => setShowSelectCompLeaveEntries(false)}
        onSelect={(items) => setUsedCompLeaveEntries(items)}
      />
    </>
  );
}
