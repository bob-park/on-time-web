'use client';

import { useEffect, useRef, useState } from 'react';

import { FaCheck, FaTimes } from 'react-icons/fa';

import Dropdown, { DropdownItem } from '@/shared/components/Dropdown';

import { getDaysOfWeek } from '@/utils/parse';

import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';

interface SelectDatetimePickerModalProps {
  show: boolean;
  onClose?: () => void;
  onSelect?: (dateRange: { startDate: Date; endDate: Date }) => void;
}

export default function SelectDatetimeModal({ show, onClose, onSelect }: SelectDatetimePickerModalProps) {
  // ref
  const ref = useRef<HTMLDialogElement>(null);

  // state
  const [startDate, setStartDate] = useState<Date>(dayjs().toDate());
  const [startHour, setStartHour] = useState<number>(0);
  const [startMinutes, setStartMinutes] = useState<number>(0);

  const [endDate, setEndDate] = useState<Date>(dayjs().toDate());
  const [endHour, setEndHour] = useState<number>(0);
  const [endMinutes, setEndMinutes] = useState<number>(0);

  // useEffect
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (show) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
  }, [show]);

  // handle
  const handleClose = () => {
    onClose && onClose();
  };

  const handleKeyboardDown = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  const handleSelectDate = () => {
    onSelect && onSelect({ startDate: new Date(), endDate: new Date() });
    handleClose();
  };

  return (
    <dialog ref={ref} className="modal" onKeyDownCapture={handleKeyboardDown}>
      <div className="modal-box max-w-5xl">
        <div className="flex w-full flex-col items-start justify-start gap-3">
          {/* header */}
          <div className="">
            <h3 className="text-lg font-bold">날짜 시간 입력</h3>
          </div>

          {/* content */}
          <div className="m-3 flex flex-col items-start justify-center gap-4">
            {/* 시작 시간 */}
            <div className="flex flex-row items-start gap-2">
              <div className="w-32 flex-none text-right font-bold">시작 시간:</div>
              <div className="flex w-full flex-col items-center">
                {/* display date time */}
                <div className="flex flex-row items-center justify-center gap-2">
                  <div className="input input-border">
                    <div className="w-full text-center text-base font-semibold">
                      <span>{dayjs(startDate).format('YYYY-MM-DD')}</span>
                      <span className="mx-1">
                        <span>(</span>
                        <span>{getDaysOfWeek(dayjs(startDate).day())}</span>
                        <span>)</span>
                      </span>
                    </div>
                  </div>

                  <HourPicker name="start-hour" hour={startHour} />
                </div>

                {/* date time picker */}
                <div className="">
                  <DayPicker
                    className="react-day-picker"
                    animate
                    locale={ko}
                    mode="single"
                    captionLayout="dropdown-years"
                    selected={startDate}
                    onSelect={(value) => value && setStartDate(value)}
                  />
                </div>
              </div>
            </div>

            {/* 종료 시간 */}
            <div className="flex flex-row items-start gap-2">
              <div className="w-32 flex-none text-right font-bold">종료 시간:</div>
              <div className="flex w-full flex-col items-center">
                {/* display date time */}
                <div className="">
                  <div className="input input-border">
                    <div className="w-full text-center text-base font-semibold">
                      <span>{dayjs(endDate).format('YYYY-MM-DD')}</span>
                      <span className="mx-1">
                        <span>(</span>
                        <span>{getDaysOfWeek(dayjs(startDate).day())}</span>
                        <span>)</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* date time picker */}
                <div className="">
                  <DayPicker
                    className="react-day-picker"
                    animate
                    locale={ko}
                    mode="single"
                    captionLayout="dropdown-years"
                    selected={endDate}
                    onSelect={(value) => value && setEndDate(value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* action */}
        <div className="modal-action">
          <button className="btn w-32" onClick={handleClose}>
            <FaTimes className="size-6" />
            안할까?
          </button>
          <button className="btn btn-primary w-32" onClick={handleSelectDate}>
            <FaCheck className="size-5" />
            변경해?
          </button>
        </div>
      </div>
    </dialog>
  );
}

function HourPicker({ name, hour }: { name: string; hour: number }) {
  return (
    <Dropdown text={hour}>
      {new Array(24).fill('0').map((_, index) => (
        <DropdownItem
          key={`datepicker-${name}-${index}`}
          active={index === hour}
          value={index + ''}
          text={index + ''}
        />
      ))}
    </Dropdown>
  );
}
