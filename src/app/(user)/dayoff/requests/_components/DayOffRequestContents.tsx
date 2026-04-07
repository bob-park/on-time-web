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
  label: string;
  description: string;
}

const VACATION_TYPES: VacationTypeOption[] = [
  { value: 'GENERAL', label: '연차', description: '일반 연차 휴가' },
  { value: 'COMPENSATORY', label: '보상 휴가', description: '휴일 근무 대체 휴가' },
  { value: 'OFFICIAL', label: '공가', description: '예비군 / 민방위 등' },
];

const VACATION_SUBTYPES = [
  { value: 'ALL_DAY_OFF' as const, label: '종일', days: 1 },
  { value: 'AM_HALF_DAY_OFF' as VacationSubType, label: '오전 반차', days: 0.5 },
  { value: 'PM_HALF_DAY_OFF' as VacationSubType, label: '오후 반차', days: 0.5 },
];

export default function DayOffRequestContent() {
  const [selectedVacationType, setSelectedVacationType] = useState<VacationType>();
  const [selectedVacationSubType, setSelectedVacationSubType] = useState<VacationSubType | 'ALL_DAY_OFF'>();
  const [reason, setReason] = useState<string>('개인 사유');
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
      push('휴가 신청 문서의 초안이 생성되었습니다.', 'info');
      router.push(`/dayoff/${data.id}`);
    },
    () => {
      push('신청 중 오류가 발생했습니다.', 'error');
    },
  );

  useEffect(() => {
    showSelectCompLeaveEntries && setUsedCompLeaveEntries([]);
  }, [showSelectCompLeaveEntries]);

  const handleRequestClick = () => {
    setHasAttemptedSubmit(true);

    if (!selectedVacationType || !selectedVacationSubType || !reason) {
      push('필수 항목을 입력해주세요', 'error');
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
        <div className="flex w-full flex-row gap-4">
          {/* Left — 휴가 구분 설정 */}
          <div className="w-80 flex-none rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-slate-800">
              휴가 구분 <span className="font-normal text-slate-400">Settings</span>
            </p>

            {/* 연차 구분 */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
              연차 구분
              {hasAttemptedSubmit && !selectedVacationType && (
                <span className="ml-2 text-red-500">선택해 주세요</span>
              )}
            </p>
              <div className="flex flex-col gap-2">
                {VACATION_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setSelectedVacationType(type.value);
                      if (type.value !== 'COMPENSATORY') setUsedCompLeaveEntries([]);
                    }}
                    className={cx(
                      'flex flex-col items-start rounded-xl border px-4 py-3 text-left transition-colors duration-150',
                      selectedVacationType === type.value
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <span className="text-sm font-semibold">{type.label}</span>
                    <span
                      className={cx(
                        'text-xs',
                        selectedVacationType === type.value ? 'text-slate-300' : 'text-slate-400',
                      )}
                    >
                      {type.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 부가 구분 */}
            <div className="mb-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
              부가 구분
              {hasAttemptedSubmit && !selectedVacationSubType && (
                <span className="ml-2 text-red-500">선택해 주세요</span>
              )}
            </p>
              <div className="flex flex-col gap-2">
                {VACATION_SUBTYPES.map((sub) => (
                  <button
                    key={sub.value}
                    type="button"
                    onClick={() => setSelectedVacationSubType(sub.value)}
                    className={cx(
                      'flex items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-colors duration-150',
                      selectedVacationSubType === sub.value
                        ? 'border-slate-800 bg-slate-800 text-white'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                    )}
                  >
                    <span className="font-medium">{sub.label}</span>
                    <span
                      className={cx(
                        'text-xs',
                        selectedVacationSubType === sub.value ? 'text-slate-300' : 'text-slate-400',
                      )}
                    >
                      {sub.days}일
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 보상 휴가 선택 (COMPENSATORY 시에만) */}
            {selectedVacationType === 'COMPENSATORY' && (
              <div className="mb-5">
                <p className="mb-2 text-xs font-medium text-slate-500">보상 휴가 선택</p>
                <button
                  type="button"
                  onClick={() => setShowSelectCompLeaveEntries(true)}
                  className={cx(
                    'flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                    usedCompLeaveEntries.length !== 0
                      ? 'border-slate-800 bg-slate-800 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100',
                  )}
                >
                  {usedCompLeaveEntries.length !== 0 ? (
                    <>
                      <FaCheck className="size-3.5" /> 보상 휴가 선택 완료
                    </>
                  ) : (
                    '보상 휴가 선택'
                  )}
                </button>
              </div>
            )}

            {/* 사유 */}
            <div>
              <p className="mb-2 text-xs font-medium text-slate-500">
                사유
                {hasAttemptedSubmit && !reason && (
                  <span className="ml-2 text-red-500">입력해 주세요</span>
                )}
              </p>
              <input
                type="text"
                maxLength={200}
                className={cx(
                  'w-full rounded-xl border bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-[border-color,background-color] duration-150 focus:border-slate-400 focus:bg-white focus:outline-none',
                  hasAttemptedSubmit && !reason ? 'border-red-300' : 'border-slate-200',
                )}
                placeholder="개인 사유"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          </div>

          {/* Right — 날짜 선택 */}
          <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-slate-800">
              날짜 선택 <span className="font-normal text-slate-400">Select Dates</span>
            </p>
            <div className="flex flex-1 items-start justify-center">
              <DayPicker
                className="react-day-picker"
                locale={ko}
                mode="range"
                selected={selectedDate}
                onSelect={(value) => value && setSelectedDate(value)}
              />
            </div>
          </div>
        </div>

        {/* Bottom — 신청 요약 패널 */}
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-800">
              신청 요약 <span className="font-normal text-slate-400">Summary</span>
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-8">
            {/* 선택 날짜 */}
            <div>
              <p className="text-xs text-slate-400">선택 날짜</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">
                {dayjs(selectedDate.from).format('YYYY.MM.DD')}
                {selectedDate.to && !dayjs(selectedDate.from).isSame(selectedDate.to, 'day') && (
                  <> — {dayjs(selectedDate.to).format('YYYY.MM.DD')}</>
                )}
              </p>
            </div>

            {/* 사용 기간 */}
            <div>
              <p className="text-xs text-slate-400">사용 기간</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{usedDays.toFixed(1)} 일</p>
            </div>

            {/* 사용 후 잔여 */}
            <div>
              <p className="text-xs text-slate-400">사용 후 잔여</p>
              <p
                className={cx('mt-0.5 text-sm font-semibold', remainingAfterUse < 0 ? 'text-red-500' : 'text-slate-800')}
              >
                {remainingAfterUse.toFixed(1)} 일
              </p>
            </div>

            {/* 승인 예상 */}
            <div>
              <p className="text-xs text-slate-400">승인 예상</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">→ 즉시</p>
            </div>

            {/* 버튼 (우측 정렬) */}
            <div className="ml-auto flex gap-3">
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-50"
                onClick={() => {
                  setSelectedVacationType(undefined);
                  setSelectedVacationSubType(undefined);
                  setReason('개인 사유');
                  setSelectedDate({ from: dayjs().toDate(), to: dayjs().toDate() });
                  setUsedCompLeaveEntries([]);
                }}
              >
                취소 (Cancel)
              </button>
              <button
                type="button"
                disabled={isLoading || !canSubmit}
                onClick={handleRequestClick}
                className="rounded-xl bg-slate-800 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-700 disabled:opacity-40"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="loading loading-spinner loading-xs" />
                    초안 생성 중
                  </span>
                ) : (
                  '초안 생성 (Create Draft)'
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
