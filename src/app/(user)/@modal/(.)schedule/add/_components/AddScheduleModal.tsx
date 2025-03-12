'use client';

import { useEffect, useRef, useState } from 'react';

import { GiCancel } from 'react-icons/gi';
import { RiCalendarScheduleLine } from 'react-icons/ri';

import { useRouter } from 'next/navigation';

import { useAddAttendanceSchedule } from '@/domain/attendance/query/attendanceRecord';

import Dropdown, { DropdownItem } from '@/shared/components/Dropdown';
import { useStore } from '@/shared/store/rootStore';

import { format } from 'date-fns';
import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

interface AttendanceOption {
  id: DayOffType;
  text: string;
}

const SELECT_OPTIONS_ATTENDANCE: AttendanceOption[] = [
  { id: 'DAY_OFF', text: '연차' },
  { id: 'AM_HALF_DAY_OFF', text: '오전 반차' },
  { id: 'PM_HALF_DAY_OFF', text: '오후 반차' },
];

export default function AddScheduleModal() {
  // router
  const router = useRouter();

  // ref
  const dialogRef = useRef<HTMLDialogElement>(null);
  const selectDatePickerRef = useRef<HTMLDialogElement>(null);

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

  useEffect(() => {
    if (!selectDatePickerRef.current) {
      return;
    }

    showDatePicker ? selectDatePickerRef.current.showModal() : selectDatePickerRef.current.close();
  }, [showDatePicker]);

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
      <div className="modal-box h-[600px] w-[600px]">
        <div className="flex h-[480px] w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">근무 일정 추가</h3>
          </div>

          {/* content */}
          <div className="m-3 flex w-full flex-col items-start justify-center gap-4">
            {/* 구분 */}
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="w-24 flex-none text-right">
                <h4 className="text-base font-semibold">구분 :</h4>
              </div>
              <div className="w-[252px]">
                {/* dropdown */}
                <Dropdown
                  text={SELECT_OPTIONS_ATTENDANCE.find((item) => item.id === selectedDayOffType)?.text || '없음'}
                  onChange={(value) => setSelectedDayOffType(value as DayOffType)}
                >
                  {/* default item */}
                  <DropdownItem text="없음" active={!selectedDayOffType} />

                  {/* items */}
                  {SELECT_OPTIONS_ATTENDANCE.map((item) => (
                    <DropdownItem
                      key={`select-dropdown-item-${item.id}`}
                      value={item.id.toString()}
                      text={item.text}
                      active={selectedDayOffType === item.id}
                    />
                  ))}
                </Dropdown>
              </div>
            </div>

            {/* 날짜 */}
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="w-24 flex-none text-right">
                <h4 className="text-base font-semibold">일자 :</h4>
              </div>
              <div className="relative">
                <button className="input input-border w-[252px]" onClick={() => setShowDatePicker(true)}>
                  <div className="w-full text-center text-base font-semibold">
                    {dayjs(selectDate).format('YYYY-MM-DD')}
                  </div>
                </button>
                <dialog ref={selectDatePickerRef} className="modal">
                  <DayPicker
                    className="react-day-picker"
                    animate
                    locale={ko}
                    mode="single"
                    captionLayout="dropdown-years"
                    selected={selectDate}
                    onSelect={handleChangeDate}
                  />
                </dialog>
              </div>
            </div>
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-24" onClick={handleBackdrop}>
            <GiCancel className="size-6" />
            취소
          </button>
          <button
            className="btn btn-neutral w-24"
            disabled={isLoading || !selectedDayOffType}
            onClick={handleAddSchedule}
          >
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs" />
                추가중
              </>
            ) : (
              <>
                <RiCalendarScheduleLine className="size-6" />
                추가
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
