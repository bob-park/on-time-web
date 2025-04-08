'use client';

import { useEffect, useState } from 'react';

import { FaCheck } from 'react-icons/fa6';

import { useRouter } from 'next/navigation';

import SelectUserCompLeaveEntriesModal from '@/app/(user)/dayoff/requests/_components/SelectUserCompLeaveEntriesModal';

import { useCreateVacation } from '@/domain/document/query/vacation';

import useToast from '@/shared/hooks/useToast';

import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { DateRange, DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

export default function DayOffRequestContent() {
  // state
  const [showSelectCompLeaveEntries, setShowSelectCompLeaveEntries] = useState<boolean>(false);
  const [selectedVacationType, setSelectedVacationType] = useState<VacationType>();
  const [selectedVacationSubType, setSelectedVacationSubType] = useState<VacationSubType | 'ALL_DAY_OFF'>();
  const [reason, setReason] = useState<string>('개인 사유');
  const [selectedDate, setSelectedDate] = useState<DateRange>(() => ({
    from: dayjs().toDate(),
    to: dayjs().toDate(),
  }));
  const [usedCompLeaveEntries, setUsedCompLeaveEntries] = useState<UsedCompLeaveEntryRequest[]>([]);

  // hooks
  const router = useRouter();
  const { push } = useToast();

  // query
  const { createVacation, isLoading } = useCreateVacation(
    (data) => {
      push('휴가 신청이 완료되었습니다.', 'info');
      router.push(`/dayoff/${data.id}`);
    },
    () => {
      push('먼가 문제가 있는디?', 'error');
    },
  );

  // useEffect
  useEffect(() => {
    showSelectCompLeaveEntries && setUsedCompLeaveEntries([]);
  }, [showSelectCompLeaveEntries]);

  // handle
  const handleRequestClick = () => {
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

  return (
    <>
      <div className="flex size-full flex-col items-center justify-center gap-10">
        {/* card */}
        <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-3 p-3 shadow-sm">
          {/* body */}
          <div className="card-body w-full">
            <div className="flex flex-col gap-10">
              {/* type */}
              <div className="flex flex-row items-center gap-3">
                <span className="w-32 flex-none text-right text-base font-semibold">휴가 구분 :</span>
                <div className="">
                  <form className="filter">
                    <input
                      className="btn btn-square"
                      type="reset"
                      value="×"
                      onClick={() => setSelectedVacationType(undefined)}
                    />
                    <input
                      className={cx('btn', { 'btn-neutral': selectedVacationType === 'GENERAL' })}
                      type="radio"
                      name="vacationTypes"
                      aria-label="연차"
                      onClick={() => setSelectedVacationType('GENERAL')}
                    />
                    <input
                      className={cx('btn', { 'btn-neutral': selectedVacationType === 'COMPENSATORY' })}
                      type="radio"
                      name="vacationTypes"
                      aria-label="대체 휴가"
                      onClick={() => setSelectedVacationType('COMPENSATORY')}
                    />

                    <div className="tooltip" data-tip="예비군(민방위) 가냥?">
                      <input
                        className={cx('btn', { 'btn-neutral': selectedVacationType === 'OFFICIAL' })}
                        type="radio"
                        name="vacationTypes"
                        aria-label="공가"
                        onClick={() => setSelectedVacationType('OFFICIAL')}
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* subtype */}
              <div className="flex flex-row items-center gap-3">
                <span className="w-32 flex-none text-right text-base font-semibold">부가 구분 :</span>
                <div className="">
                  <form className="filter">
                    <input
                      className="btn btn-square"
                      type="reset"
                      value="×"
                      onClick={() => setSelectedVacationSubType(undefined)}
                    />
                    <div className="tooltip mr-1" data-tip="하루종일 놀고 싶어?">
                      <input
                        className={cx('btn', { 'btn-neutral': selectedVacationSubType === 'ALL_DAY_OFF' })}
                        type="radio"
                        name="vacationSubTypes"
                        aria-label="종일"
                        onClick={() => setSelectedVacationSubType('ALL_DAY_OFF')}
                      />
                    </div>
                    <div className="tooltip mr-1" data-tip="늦잠자고 싶어?">
                      <input
                        className={cx('btn', { 'btn-neutral': selectedVacationSubType === 'AM_HALF_DAY_OFF' })}
                        type="radio"
                        name="vacationSubTypes"
                        aria-label="오전 반차"
                        onClick={() => setSelectedVacationSubType('AM_HALF_DAY_OFF')}
                      />
                    </div>
                    <div className="tooltip" data-tip="일찍 가고 싶어?">
                      <input
                        className={cx('btn', { 'btn-neutral': selectedVacationSubType === 'PM_HALF_DAY_OFF' })}
                        type="radio"
                        name="vacationSubTypes"
                        aria-label="오후 반차"
                        onClick={() => setSelectedVacationSubType('PM_HALF_DAY_OFF')}
                      />
                    </div>
                  </form>
                </div>
              </div>

              {/* date select */}
              <div className="flex flex-row items-center gap-3">
                <span className="w-32 flex-none text-right text-base font-semibold">일 자 :</span>
                <div className="">
                  <div className="input input-border w-[380px]">
                    <div className="w-full text-center text-base font-semibold">
                      <span>
                        {dayjs(selectedDate.from).format('YYYY-MM-DD')}
                        <span>({getDaysOfWeek(dayjs(selectedDate.from).day())})</span>
                      </span>
                      <span> - </span>
                      <span>
                        {dayjs(selectedDate.to).format('YYYY-MM-DD')}
                        <span>({getDaysOfWeek(dayjs(selectedDate.to).day())})</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center justify-center gap-3">
              <div className="">
                <DayPicker
                  className="react-day-picker"
                  animate
                  locale={ko}
                  mode="range"
                  captionLayout="dropdown-years"
                  selected={selectedDate}
                  onSelect={(value) => value && setSelectedDate(value)}
                />
              </div>
            </div>

            {/* select comp leave entries */}
            <div
              className={cx('flex flex-row items-center gap-3', {
                hidden: selectedVacationType !== 'COMPENSATORY',
              })}
            >
              <span className="w-32 flex-none text-right text-base font-semibold">보상 휴가 :</span>
              <div className="">
                <button
                  className={cx('btn', { 'btn-neutral': usedCompLeaveEntries.length !== 0 })}
                  onClick={() => setShowSelectCompLeaveEntries(true)}
                >
                  {usedCompLeaveEntries.length !== 0 ? (
                    <>
                      <FaCheck className="size-5" /> 보상 휴가 선택 완료
                    </>
                  ) : (
                    <>보상 휴가 선택</>
                  )}
                </button>
              </div>
            </div>

            {/* reason */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-base font-semibold">사 유 :</span>
              <div className="">
                <label className="input w-[380px]">
                  <input
                    type="text"
                    className="grow"
                    placeholder="개인 사유"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                  <span className="badge badge-neutral badge-xs">필수</span>
                </label>
              </div>
            </div>
          </div>

          {/* action button */}
          <div className="my-10 flex flex-row gap-4">
            <button type="button" className="btn w-36">
              취소
            </button>
            <button
              type="button"
              className="btn btn-neutral w-36"
              disabled={isLoading || !selectedVacationType || !selectedVacationSubType || !reason}
              onClick={handleRequestClick}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner" />
                  신청중
                </>
              ) : (
                '신청'
              )}
            </button>
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
