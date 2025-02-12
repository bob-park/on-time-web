'use client';

import { useEffect, useRef, useState } from 'react';

import { GiCancel } from 'react-icons/gi';
import { IoIosArrowDown, IoIosArrowUp } from 'react-icons/io';
import { RiCalendarScheduleLine } from 'react-icons/ri';

import { useRouter } from 'next/navigation';

import { useAddAttendanceSchedule } from '@/domain/attendance/query/attendanceRecord';

import { useStore } from '@/shared/rootStore';

import cx from 'classnames';
import dayjs from 'dayjs';
import Datepicker from 'react-tailwindcss-datepicker';

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

  // state
  const [selectDate, setSelectDate] = useState<{ startDate: Date; endDate: Date }>({
    startDate: dayjs().toDate(),
    endDate: dayjs().toDate(),
  });
  const [showDayOffType, setShowDayOffType] = useState<boolean>(false);
  const [selectedDayOffType, setSelectedDayOffType] = useState<DayOffType | null>(null);

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
    // TODO add schedule
    addSchedule({ workingDate: dayjs(selectDate.startDate).format('YYYY-MM-DD'), dayOffType: selectedDayOffType });
  };

  const handleChangeDayOffType = (dayOffType: DayOffType | null) => {
    setShowDayOffType(false);
    setSelectedDayOffType(dayOffType);
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
              <div className="w-full">
                <div className={cx('dropdown w-[252px]', showDayOffType && 'dropdown-open')}>
                  <div
                    className="relative flex h-12 w-full flex-row items-center justify-center gap-2 rounded-lg border px-3 py-2"
                    onClick={() => setShowDayOffType(!showDayOffType)}
                  >
                    <div className="">
                      <span className="">
                        {SELECT_OPTIONS_ATTENDANCE.find((item) => item.id === selectedDayOffType)?.text || '없음'}
                      </span>
                    </div>
                    <div className="absolute right-4">{showDayOffType ? <IoIosArrowUp /> : <IoIosArrowDown />}</div>
                  </div>
                  <ul className="menu dropdown-content z-[1] w-full rounded-box bg-base-100 p-2 shadow">
                    <li
                      className={cx(selectedDayOffType === null && 'rounded-lg bg-neutral text-white')}
                      onClick={() => handleChangeDayOffType(null)}
                    >
                      <div>없음</div>
                    </li>
                    {SELECT_OPTIONS_ATTENDANCE.map((item) => (
                      <li
                        key={`select-dropdown-item-${item.id}`}
                        className={cx(selectedDayOffType === item.id && 'rounded-lg bg-neutral text-white')}
                        onClick={() => handleChangeDayOffType(item.id)}
                      >
                        <div>{item.text}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 날짜 */}
            <div className="flex flex-row items-center justify-center gap-4">
              <div className="w-24 flex-none text-right">
                <h4 className="text-base font-semibold">일자 :</h4>
              </div>
              <div className="">
                <Datepicker
                  i18n="ko"
                  useRange={false}
                  asSingle
                  inputClassName="input input-bordered w-full"
                  value={selectDate}
                  onChange={(value) =>
                    setSelectDate({
                      startDate: value?.startDate || dayjs().toDate(),
                      endDate: value?.endDate || dayjs().toDate(),
                    })
                  }
                />
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
          <button className="btn btn-neutral w-24" disabled={isLoading} onClick={handleAddSchedule}>
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
