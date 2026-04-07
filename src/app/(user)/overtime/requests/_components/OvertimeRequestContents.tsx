'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { useCreateOverTimeWorkDocument } from '@/domain/document/query/overtime';

import useToast from '@/shared/hooks/useToast';

import { getDaysOfWeek } from '@/utils/parse';

import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { HiOutlineDocumentText } from 'react-icons/hi';

import SelectUserModal from './SelectUserModal';

interface WorkTime {
  startDate: Date;
  endDate: Date;
  userUniqueId?: string;
  username: string;
  contents: string;
  isDayOff: boolean;
}

function toDate(date: Date, hour: number, minute: number) {
  return dayjs(date).hour(hour).minute(minute).second(0).millisecond(0).toDate();
}

const pillClass = (active: boolean) =>
  active
    ? 'bg-slate-800 text-white rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-100 cursor-pointer'
    : 'bg-slate-100 text-slate-600 rounded-full px-3.5 py-1.5 text-sm font-medium hover:bg-slate-200 transition-colors duration-100 cursor-pointer';

const fieldLabel = 'w-[72px] flex-none text-xs font-semibold uppercase tracking-wider text-slate-400 pt-2';

const inputClass =
  'border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder:text-slate-300 outline-none focus:border-slate-400';

const selectClass = 'border border-slate-200 rounded-lg px-2 py-1.5 text-sm bg-white text-slate-800';

export default function OvertimeRequestContents() {
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);
  const [showUser, setShowUser] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isRegisteredUser, setIsRegisteredUser] = useState<boolean | undefined>(undefined);
  const [username, setUsername] = useState<string | undefined>(undefined);
  const [userUniqueId, setUserUniqueId] = useState<string | undefined>(undefined);
  const [contents, setContents] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startHour, setStartHour] = useState(0);
  const [startMinutes, setStartMinutes] = useState(0);
  const [endHour, setEndHour] = useState(0);
  const [endMinutes, setEndMinutes] = useState(0);
  const [isDayOff, setIsDayOff] = useState(true);

  const datePickerRef = useRef<HTMLDivElement>(null);
  const { push } = useToast();
  const router = useRouter();

  const { createOverTimeWork, isLoading } = useCreateOverTimeWorkDocument(
    () => {
      push('휴일 근무 보고서 초안이 작성되었습니다.', 'info');
      router.push('/documents');
    },
    () => push('문서 생성에 실패했습니다. 다시 시도해 주세요.', 'error'),
  );

  useEffect(() => {
    if (!showDatePicker) return;
    const handler = (e: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDatePicker]);

  const handleAddWorkTime = () => {
    if (isRegisteredUser === undefined) {
      push('등록 여부를 선택해 주세요.', 'warning');
      return;
    }
    if (!username) {
      push('인원을 선택하거나 이름을 입력해 주세요.', 'warning');
      return;
    }
    if (!contents) {
      push('근무 목적을 입력해 주세요.', 'warning');
      return;
    }
    if (!date) {
      push('근무일을 선택해 주세요.', 'warning');
      return;
    }

    const isOvernight =
      endHour < startHour || (endHour === startHour && endMinutes < startMinutes);
    const endDateBase = isOvernight ? dayjs(date).add(1, 'day').toDate() : date;

    setWorkTimes((prev) => [
      ...prev,
      {
        startDate: toDate(date, startHour, startMinutes),
        endDate: toDate(endDateBase, endHour, endMinutes),
        userUniqueId,
        username,
        contents,
        isDayOff,
      },
    ]);

    setIsRegisteredUser(undefined);
    setUsername(undefined);
    setUserUniqueId(undefined);
    setContents(undefined);
    setDate(undefined);
    setStartHour(0);
    setStartMinutes(0);
    setEndHour(0);
    setEndMinutes(0);
    setIsDayOff(true);
  };

  const handleSelectUser = (user: User) => {
    setUserUniqueId(user.id);
    setUsername(user.username);
  };

  const handleCreateDocument = () => {
    if (workTimes.length === 0 || isLoading) return;
    createOverTimeWork({
      times: workTimes.map((wt) => ({
        userUniqueId: wt.userUniqueId,
        username: wt.username,
        contents: wt.contents,
        startDate: dayjs(wt.startDate).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(wt.endDate).format('YYYY-MM-DDTHH:mm:ss'),
        isDayOff: wt.isDayOff,
      })),
    });
  };

  return (
    <>
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Form zone */}
        <div className="flex flex-col gap-4 p-5">
          {/* 등록 여부 */}
          <div className="flex items-start gap-3">
            <span className={fieldLabel}>등록 여부</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-full bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-400 transition-colors duration-100 hover:bg-slate-200 cursor-pointer"
                onClick={() => {
                  setIsRegisteredUser(undefined);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                ×
              </button>
              <button
                type="button"
                aria-pressed={isRegisteredUser === true}
                className={pillClass(isRegisteredUser === true)}
                onClick={() => {
                  setIsRegisteredUser(true);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                등록 직원
              </button>
              <button
                type="button"
                aria-pressed={isRegisteredUser === false}
                className={pillClass(isRegisteredUser === false)}
                onClick={() => {
                  setIsRegisteredUser(false);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                미등록 직원
              </button>
            </div>
          </div>

          {/* 인원 (conditional on 등록 여부) */}
          {isRegisteredUser !== undefined && (
            <div className="flex items-start gap-3">
              <span className={fieldLabel}>인원</span>
              {isRegisteredUser ? (
                <button
                  type="button"
                  className={
                    userUniqueId
                      ? 'rounded-lg bg-slate-800 px-3 py-2 text-sm font-medium text-white'
                      : `${inputClass} cursor-pointer`
                  }
                  onClick={() => setShowUser(true)}
                >
                  {username || '인원 선택'}
                </button>
              ) : (
                <input
                  type="text"
                  className={`${inputClass} w-48`}
                  placeholder="성명"
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value || undefined)}
                />
              )}
            </div>
          )}

          {/* 근무 목적 */}
          <div className="flex items-start gap-3">
            <span className={fieldLabel}>근무 목적</span>
            <input
              type="text"
              className={`${inputClass} flex-1`}
              placeholder="근무 목적 입력"
              value={contents || ''}
              onChange={(e) => setContents(e.target.value || undefined)}
            />
          </div>

          {/* 근무일 */}
          <div className="flex items-start gap-3">
            <span className={fieldLabel}>근무일</span>
            <div className="relative" ref={datePickerRef}>
              <button
                type="button"
                className={inputClass}
                onClick={() => setShowDatePicker((v) => !v)}
              >
                {date
                  ? `${dayjs(date).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(date).day())})`
                  : '날짜 선택'}
              </button>
              {showDatePicker && (
                <div className="absolute left-0 top-full z-50 mt-1 rounded-xl border border-slate-200 bg-white shadow-lg">
                  <DayPicker
                    className="react-day-picker"
                    locale={ko}
                    mode="single"
                    captionLayout="dropdown-years"
                    selected={date}
                    onSelect={(value) => {
                      if (value) {
                        setDate(value);
                        setShowDatePicker(false);
                      }
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* 근무 시간 */}
          <div className="flex items-start gap-3">
            <span className={fieldLabel}>근무 시간</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400">시작</span>
              <select
                value={startHour}
                onChange={(e) => setStartHour(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')} 시
                  </option>
                ))}
              </select>
              <select
                value={startMinutes}
                onChange={(e) => setStartMinutes(Number(e.target.value))}
                className={selectClass}
              >
                <option value={0}>00 분</option>
                <option value={30}>30 분</option>
              </select>
              <span className="text-xs text-slate-400">—</span>
              <span className="text-xs text-slate-400">종료</span>
              <select
                value={endHour}
                onChange={(e) => setEndHour(Number(e.target.value))}
                className={selectClass}
              >
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {String(i).padStart(2, '0')} 시
                  </option>
                ))}
              </select>
              <select
                value={endMinutes}
                onChange={(e) => setEndMinutes(Number(e.target.value))}
                className={selectClass}
              >
                <option value={0}>00 분</option>
                <option value={30}>30 분</option>
              </select>
            </div>
          </div>

          {/* 보상휴가 */}
          <div className="flex items-start gap-3">
            <span className={fieldLabel}>보상휴가</span>
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={isDayOff}
                onChange={(e) => setIsDayOff(e.target.checked)}
              />
              <span className="text-sm text-slate-500">보상휴가로 처리</span>
            </div>
          </div>

          {/* Add button */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white"
              onClick={handleAddWorkTime}
            >
              + 목록에 추가
            </button>
          </div>
        </div>

        {/* Divider */}
        <hr className="border-slate-100" />

        {/* List zone */}
        <div>
          <p className="px-5 pb-2 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
            추가된 근무 내역 ({workTimes.length}건)
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="h-10 border-b border-slate-200 bg-slate-50">
                  <th className="px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    근무일
                  </th>
                  <th className="px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    근무 시간
                  </th>
                  <th className="px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    근무 목적
                  </th>
                  <th className="px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    근무자
                  </th>
                  <th className="px-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                    보상휴가
                  </th>
                  <th className="w-12 px-4" />
                </tr>
              </thead>
              <tbody>
                {workTimes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <HiOutlineDocumentText className="size-10 text-slate-300" />
                        <p className="text-sm font-semibold text-slate-500">추가된 항목이 없습니다</p>
                        <p className="text-sm text-slate-400">위 양식을 작성한 후 추가 버튼을 클릭하세요.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workTimes.map((wt, index) => (
                    <tr key={index} className="h-[52px] border-b border-slate-100 last:border-b-0">
                      <td className="px-4 text-sm text-slate-500">
                        {dayjs(wt.startDate).format('YYYY-MM-DD')} ({getDaysOfWeek(dayjs(wt.startDate).day())})
                      </td>
                      <td className="px-4 text-sm text-slate-500">
                        {dayjs(wt.startDate).format('HH:mm')} — {dayjs(wt.endDate).format('HH:mm')}
                      </td>
                      <td className="px-4 text-sm text-slate-500">{wt.contents}</td>
                      <td className="px-4 text-sm text-slate-500">{wt.username}</td>
                      <td className="px-4">
                        {wt.isDayOff && (
                          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                            적용
                          </span>
                        )}
                      </td>
                      <td className="px-4">
                        <button
                          type="button"
                          aria-label="삭제"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                          onClick={() => setWorkTimes((prev) => prev.filter((_, i) => i !== index))}
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit zone */}
        <div className="flex justify-end gap-3 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            className="rounded-lg border border-slate-200 bg-white px-5 py-2 text-sm text-slate-600"
            onClick={() => router.push('/documents')}
          >
            취소
          </button>
          <button
            type="button"
            className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
            disabled={workTimes.length === 0 || isLoading}
            onClick={handleCreateDocument}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="loading loading-spinner loading-xs" />
                처리 중...
              </span>
            ) : (
              '초안 생성'
            )}
          </button>
        </div>
      </div>

      <SelectUserModal show={showUser} onClose={() => setShowUser(false)} onSelect={handleSelectUser} />
    </>
  );
}
