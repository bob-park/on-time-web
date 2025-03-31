'use client';

import { useEffect, useRef, useState } from 'react';

import { getDaysOfWeek } from '@/utils/parse';

import dayjs from 'dayjs';
import { DateRange, DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

export default function DayOffRequestContent() {
  // state
  const [selectedDate, setSelectedDate] = useState<DateRange>(() => ({
    from: dayjs().toDate(),
    to: dayjs().toDate(),
  }));

  return (
    <div className="flex size-full flex-col items-center justify-center gap-10">
      {/* card */}
      <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-3 p-3 shadow-sm">
        {/* body */}
        <div className="card-body w-full">
          <div className="flex flex-col gap-10">
            {/* type */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-lg font-semibold">휴가 구분 :</span>
              <div className="">
                <form className="filter">
                  <input className="btn btn-square" type="reset" value="×" />
                  <input className="btn" type="radio" name="vacationTypes" aria-label="연차" />
                  <input className="btn" type="radio" name="vacationTypes" aria-label="대체 휴가" />
                  <div className="tooltip mr-1" data-tip="아프지마 나도 아펑?">
                    <input className="btn" type="radio" name="vacationTypes" aria-label="병가" />
                  </div>
                  <div className="tooltip" data-tip="예비군(민방위) 가냥?">
                    <input className="btn" type="radio" name="vacationTypes" aria-label="공가" />
                  </div>
                </form>
              </div>
            </div>

            {/* subtype */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-lg font-semibold">부가 구분 :</span>
              <div className="">
                <form className="filter">
                  <input className="btn btn-square" type="reset" value="×" />
                  <div className="tooltip mr-1" data-tip="하루종일 놀고 싶어?">
                    <input className="btn" type="radio" name="vacationSubTypes" aria-label="종일" />
                  </div>
                  <div className="tooltip mr-1" data-tip="늦잠자고 싶어?">
                    <input className="btn" type="radio" name="vacationSubTypes" aria-label="오전 반차" />
                  </div>
                  <div className="tooltip" data-tip="일찍 가고 싶어?">
                    <input className="btn" type="radio" name="vacationSubTypes" aria-label="오후 반차" />
                  </div>
                </form>
              </div>
            </div>

            {/* date select */}
            <div className="flex flex-row items-center gap-3">
              <span className="w-32 flex-none text-right text-lg font-semibold">일 자 :</span>
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
        </div>

        <div className="flex flex-row items-center gap-3">
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
        {/* action button */}
        <div className="flex flex-row gap-4">
          <button type="button" className="btn w-36">
            취소
          </button>
          <button type="button" className="btn btn-neutral w-36">
            신청
          </button>
        </div>
      </div>
    </div>
  );
}
