'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import SelectUserCompLeaveEntriesModal from '@/app/(user)/dayoff/requests/_components/SelectUserCompLeaveEntriesModal';
import { UsedCompLeaveEntryRequest, VacationSubType, VacationType } from '@/domain/document/apis/document.dto';
import { useCreateVacation } from '@/domain/document/queries/vacation';
import { useUserLeaveEntry } from '@/domain/users/queries/user';
import { useUserCompLeaveEntries } from '@/domain/users/queries/userCompLeaveEntry';
import Card from '@/shared/components/Card';
import FormSection from '@/shared/components/FormSection';
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

interface VacationChip {
  key: string;
  labelKey: string;
  vacationType: VacationType;
  vacationSubType: VacationSubType | 'ALL_DAY_OFF';
}

// 칩 = 기존 (휴가 구분 × 부가 구분) 조합을 그대로 펼친 것 — 새로운 타입은 없다.
const VACATION_CHIPS: VacationChip[] = [
  { key: 'general', labelKey: 'type.general', vacationType: 'GENERAL', vacationSubType: 'ALL_DAY_OFF' },
  { key: 'amHalf', labelKey: 'subType.amHalf', vacationType: 'GENERAL', vacationSubType: 'AM_HALF_DAY_OFF' },
  { key: 'pmHalf', labelKey: 'subType.pmHalf', vacationType: 'GENERAL', vacationSubType: 'PM_HALF_DAY_OFF' },
  { key: 'comp', labelKey: 'type.compensatory', vacationType: 'COMPENSATORY', vacationSubType: 'ALL_DAY_OFF' },
  { key: 'official', labelKey: 'type.official', vacationType: 'OFFICIAL', vacationSubType: 'ALL_DAY_OFF' },
];

export default function DayOffRequestContent() {
  const t = useTranslations('dayoff.request');

  const [selectedVacationType, setSelectedVacationType] = useState<VacationType>();
  const [selectedVacationSubType, setSelectedVacationSubType] = useState<VacationSubType | 'ALL_DAY_OFF'>();
  const [reason, setReason] = useState<string>(t('reasonDefault'));
  const [selectedDate, setSelectedDate] = useState<DateRange>(() => ({
    from: dayjs().toDate(),
    to: dayjs().toDate(),
  }));
  const [usedCompLeaveEntries, setUsedCompLeaveEntries] = useState<UsedCompLeaveEntryRequest[]>([]);
  const [showSelectCompLeaveEntries, setShowSelectCompLeaveEntries] = useState<boolean>(false);

  const router = useRouter();
  const { push } = useToast();
  const { leaveEntry } = useUserLeaveEntry(new Date().getFullYear());
  const { compLeaveEntries } = useUserCompLeaveEntries();

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
    // 상신 버튼은 같은 조건으로 disabled — 여기서는 타입 좁히기 용도로만 남긴다.
    if (!selectedVacationType || !selectedVacationSubType || !reason) {
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
  const freeLeaveDays = (leaveEntry?.totalLeaveDays ?? 0) - (leaveEntry?.usedLeaveDays ?? 0);
  const remainingAfterUse = freeLeaveDays - usedDays;

  // 보상 휴가 잔여 = 보유한 보상 휴가 항목의 (부여일 - 사용일) 합
  const freeCompLeaveDays = compLeaveEntries.reduce((sum, entry) => sum + (entry.leaveDays - entry.usedDays), 0);

  // 칩 설명에 라이브로 붙는 잔여일 (공가는 잔여 개념 없음)
  const chipRemaining: Partial<Record<string, number>> = {
    general: freeLeaveDays,
    comp: freeCompLeaveDays,
  };

  const selectedChip = VACATION_CHIPS.find(
    (chip) => chip.vacationType === selectedVacationType && chip.vacationSubType === selectedVacationSubType,
  );

  const period =
    selectedDate.from && selectedDate.to && !dayjs(selectedDate.from).isSame(selectedDate.to, 'day')
      ? `${dayjs(selectedDate.from).format('MM/DD')} – ${dayjs(selectedDate.to).format('MM/DD')}`
      : dayjs(selectedDate.from).format('MM/DD');

  // 보상휴가는 사용할 보상 휴가 항목을 고르지 않으면 상신할 수 없다.
  const canSubmit =
    !!selectedVacationType &&
    !!selectedVacationSubType &&
    !!reason &&
    (selectedVacationType !== 'COMPENSATORY' || usedCompLeaveEntries.length > 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card>
          {/* 1 — 휴가 종류 */}
          <FormSection step={1} title={t('step1')} description={t('step1Desc')}>
            <div role="group" aria-label={t('step1')} className="flex flex-wrap gap-2">
              {VACATION_CHIPS.map((chip) => {
                const selected = selectedChip?.key === chip.key;
                const remaining = chipRemaining[chip.key];
                return (
                  <button
                    key={chip.key}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => {
                      setSelectedVacationType(chip.vacationType);
                      setSelectedVacationSubType(chip.vacationSubType);
                      if (chip.vacationType !== 'COMPENSATORY') {
                        setUsedCompLeaveEntries([]);
                        return;
                      }
                      // 이미 보상휴가를 고른 상태에서 다시 누르면 선택이 날아가지 않도록 모달을 열지 않는다.
                      if (selectedVacationType !== 'COMPENSATORY' || usedCompLeaveEntries.length === 0) {
                        setShowSelectCompLeaveEntries(true);
                      }
                    }}
                    className={cx(
                      'flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors duration-150',
                      selected
                        ? 'border-primary bg-primary-soft text-primary font-semibold'
                        : 'border-base-300 bg-base-100 text-2 hover:bg-base-200',
                    )}
                  >
                    {t(chip.labelKey)}
                    {remaining !== undefined && (
                      <small className={cx('font-normal', selected ? 'text-primary' : 'text-3')}>
                        {t('type.remaining', { days: remaining })}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedVacationType === 'COMPENSATORY' && (
              <div className="flex flex-wrap items-center gap-2 pt-3">
                <p className="text-3 text-xs">
                  {usedCompLeaveEntries.length !== 0 ? t('compSelected') : t('compSelectHint')}
                </p>
                {usedCompLeaveEntries.length !== 0 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowSelectCompLeaveEntries(true)}
                  >
                    {t('compChange')}
                  </button>
                )}
              </div>
            )}
          </FormSection>

          {/* 2 — 기간 */}
          <FormSection step={2} title={t('step2')} description={t('step2Desc')}>
            <div className="flex justify-center">
              <DayPicker
                className="rdp-theme"
                locale={ko}
                mode="range"
                selected={selectedDate}
                onSelect={(value) => value && setSelectedDate(value)}
              />
            </div>
            <p className="text-3 pt-3 text-xs">{t('usedHint', { days: usedDays.toFixed(1) })}</p>
          </FormSection>

          {/* 3 — 사유 */}
          <FormSection step={3} title={t('step3')}>
            <textarea
              maxLength={200}
              rows={3}
              className="bg-base-100 text-base-content placeholder:text-3 border-base-300 focus:border-primary w-full resize-none rounded-[10px] border px-4 py-2.5 text-sm transition-colors duration-150 focus:outline-none"
              placeholder={t('reasonDefault')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </FormSection>
        </Card>

        {/* 신청 요약 */}
        <Card className="p-5 lg:sticky lg:top-0">
          <h3 className="text-[15px] font-semibold">{t('summaryTitle')}</h3>
          <div className="border-soft text-2 flex justify-between border-b py-2.5 text-sm">
            {t('summaryType')}
            <b className="text-base-content">{selectedChip ? t(selectedChip.labelKey) : t('empty')}</b>
          </div>
          <div className="border-soft text-2 flex justify-between border-b py-2.5 text-sm">
            {t('summaryPeriod')}
            <b className="text-base-content">{period}</b>
          </div>
          <div className="border-soft text-2 flex justify-between border-b py-2.5 text-sm">
            {t('summaryUsed')}
            <b className="text-base-content">{t('days', { days: usedDays.toFixed(1) })}</b>
          </div>
          <div className="text-2 flex items-baseline justify-between pt-3.5 pb-1 text-sm">
            {t('summaryRemaining')}
            <b className={cx('text-[22px] font-bold', remainingAfterUse < 0 ? 'text-error' : 'text-primary')}>
              {t('days', { days: remainingAfterUse.toFixed(1) })}
            </b>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-3.5 w-full"
            disabled={isLoading || !canSubmit}
            onClick={handleRequestClick}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="loading loading-spinner loading-xs" />
                {t('submitting')}
              </span>
            ) : (
              t('submit')
            )}
          </button>
        </Card>
      </div>

      <SelectUserCompLeaveEntriesModal
        show={showSelectCompLeaveEntries}
        onClose={() => setShowSelectCompLeaveEntries(false)}
        onSelect={(items) => setUsedCompLeaveEntries(items)}
      />
    </>
  );
}
