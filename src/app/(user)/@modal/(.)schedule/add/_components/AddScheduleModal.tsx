'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck } from 'react-icons/fa';
import { RiCalendarScheduleLine } from 'react-icons/ri';

import { useRouter } from 'next/navigation';

import { DayOffType } from '@/domain/attendance/apis/attendance.dto';
import { useAddAttendanceSchedule } from '@/domain/attendance/queries/attendanceRecord';
import { useStore } from '@/shared/store/rootStore';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

interface AttendanceOption {
  id?: DayOffType;
  key: string;
}

const SELECT_OPTIONS_ATTENDANCE: AttendanceOption[] = [
  { id: undefined, key: 'categoryNone' },
  { id: 'DAY_OFF', key: 'categoryDayOff' },
  { id: 'AM_HALF_DAY_OFF', key: 'categoryAmHalfDayOff' },
  { id: 'PM_HALF_DAY_OFF', key: 'categoryPmHalfDayOff' },
];

export default function AddScheduleModal() {
  // hooks
  const t = useTranslations('schedule');

  // router
  const router = useRouter();

  // ref
  const dialogRef = useRef<HTMLDialogElement>(null);

  // state
  const [selectDate, setSelectDate] = useState<Date>(dayjs().toDate());
  const [selectedDayOffType, setSelectedDayOffType] = useState<DayOffType | undefined>();
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // store
  const show = useStore((state) => state.showModal);
  const updateShow = useStore((state) => state.updateShowModal);

  // query
  const { addSchedule, isLoading } = useAddAttendanceSchedule(() => {
    handleBackdrop();
  });

  // useEffect
  useEffect(() => {
    if (!dialogRef.current) {
      return;
    }

    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show]);

  // handle
  const handleBackdrop = () => {
    updateShow(false);

    router.push('/schedule');
  };

  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      handleBackdrop();
    }
  };

  const handleAddSchedule = () => {
    addSchedule({
      workingDate: dayjs(selectDate).format('YYYY-MM-DD'),
      dayOffType: selectedDayOffType || null,
    });
  };

  const handleChangeDate = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    setSelectDate(date);
    setShowDatePicker(false);
  };

  return (
    <dialog ref={dialogRef} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box bg-base-100 border-base-300 rounded-box shadow-whisper w-[520px] max-w-[calc(100vw-48px)] border p-7">
        {/* header */}
        <h3 className="text-lg font-bold">{t('addTitle')}</h3>

        {/* 구분 */}
        <div className="mt-6 flex flex-col gap-2">
          <span className="text-2 text-xs font-semibold tracking-wider uppercase">{t('category')}</span>
          <div role="group" aria-label={t('category')} className="flex flex-wrap gap-2">
            {SELECT_OPTIONS_ATTENDANCE.map((option) => {
              const selected = selectedDayOffType === option.id;

              return (
                <button
                  key={`select-attendance-${option.key}`}
                  type="button"
                  aria-pressed={selected}
                  className={cx(
                    'flex cursor-pointer items-center gap-2 rounded-[10px] border px-3.5 py-2 text-[13px] font-medium transition-colors duration-150',
                    selected
                      ? 'border-primary bg-primary-soft text-primary font-semibold'
                      : 'border-base-300 bg-base-100 text-2 hover:bg-base-200',
                  )}
                  onClick={() => setSelectedDayOffType(option.id)}
                >
                  {t(option.key)}
                  {selected && <FaCheck className="text-primary size-3" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 일자 */}
        <div className="mt-5 flex flex-col gap-2">
          <label className="text-2 text-xs font-semibold tracking-wider uppercase">{t('date')}</label>
          <button
            type="button"
            className="btn btn-outline justify-start"
            onClick={() => setShowDatePicker((prev) => !prev)}
          >
            <RiCalendarScheduleLine className="size-5" />
            {dayjs(selectDate).format('YYYY-MM-DD')}
          </button>

          {showDatePicker && (
            <div className="bg-base-200 border-base-300 mt-1 flex justify-center rounded-xl border p-4">
              <DayPicker
                className="rdp-theme"
                animate
                locale={ko}
                mode="single"
                captionLayout="dropdown-years"
                selected={selectDate}
                onSelect={handleChangeDate}
              />
            </div>
          )}
        </div>

        {/* action */}
        <div className="modal-action mt-7">
          <button className="btn btn-ghost" onClick={handleBackdrop}>
            {t('cancel')}
          </button>
          <button className="btn btn-primary" disabled={isLoading || !selectedDayOffType} onClick={handleAddSchedule}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                {t('adding')}
              </>
            ) : (
              <>
                <RiCalendarScheduleLine className="size-5" />
                {t('addAction')}
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
