'use client';

import { useEffect, useRef, useState } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { useRouter } from 'next/navigation';

import { useCreateOverTimeWorkDocument } from '@/domain/document/query/overtime';
import useToast from '@/shared/hooks/useToast';
import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';
import { useTranslations } from 'next-intl';
import { DayPicker } from 'react-day-picker';
import { ko } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

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

const fieldLabel = 'w-20 flex-none pt-2.5 text-xs font-semibold uppercase tracking-wider text-base-content/50';

const pillControl =
  'flex h-11 items-center gap-2.5 rounded-full bg-base-300 px-5 text-sm text-base-content shadow-[inset_0_0_0_1px_#3a3a3a] transition-colors duration-150 hover:bg-[#2e2e2e]';

const pillInput =
  'h-11 rounded-full bg-base-300 px-5 text-sm text-base-content placeholder:text-base-content/40 shadow-[inset_0_0_0_1px_#3a3a3a] transition-shadow duration-150 focus:shadow-[inset_0_0_0_1px_#1ed760] focus:outline-none';

const selectPill =
  'h-11 rounded-full bg-base-300 px-4 text-sm text-base-content shadow-[inset_0_0_0_1px_#3a3a3a] focus:outline-none';

export default function OvertimeRequestContents() {
  const t = useTranslations('overtime.request');

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
      push(t('toast.created'), 'info');
      router.push('/documents');
    },
    () => push(t('toast.error'), 'error'),
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
      push(t('toast.selectRegistered'), 'warning');
      return;
    }
    if (!username) {
      push(t('toast.selectPerson'), 'warning');
      return;
    }
    if (!contents) {
      push(t('toast.inputPurpose'), 'warning');
      return;
    }
    if (!date) {
      push(t('toast.selectDate'), 'warning');
      return;
    }

    const isOvernight = endHour < startHour || (endHour === startHour && endMinutes < startMinutes);
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
      <div className="bg-base-200 rounded-2xl border border-white/5 shadow-sm">
        {/* Card header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-1">
          <span className="text-base-content text-base font-semibold">{t('formTitle')}</span>
          <span className="text-base-content/40 text-[13px]">{t('formHint')}</span>
        </div>

        {/* Form zone */}
        <div className="flex flex-col gap-5 p-6">
          {/* 등록 여부 */}
          <div className="flex items-start gap-4">
            <span className={fieldLabel}>{t('registeredLabel')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-label={t('clearAria')}
                className="text-base-content/50 hover:text-base-content flex h-8 w-8 flex-none items-center justify-center rounded-full transition-colors duration-100 hover:bg-white/10"
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
                className={cx(
                  'h-8 rounded-full px-4 text-sm font-medium transition-colors duration-100',
                  isRegisteredUser === true
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content/60 hover:bg-[#2e2e2e]',
                )}
                onClick={() => {
                  setIsRegisteredUser(true);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                {t('registered')}
              </button>
              <button
                type="button"
                aria-pressed={isRegisteredUser === false}
                className={cx(
                  'h-8 rounded-full px-4 text-sm font-medium transition-colors duration-100',
                  isRegisteredUser === false
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-300 text-base-content/60 hover:bg-[#2e2e2e]',
                )}
                onClick={() => {
                  setIsRegisteredUser(false);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                {t('unregistered')}
              </button>
            </div>
          </div>

          {/* 인원 (conditional on 등록 여부) */}
          {isRegisteredUser !== undefined && (
            <div className="flex items-start gap-4">
              <span className={fieldLabel}>{t('personLabel')}</span>
              {isRegisteredUser ? (
                <button type="button" className={pillControl} onClick={() => setShowUser(true)}>
                  <span className="text-base-content/50">{t('selectPerson')} —</span>
                  <span className={cx(userUniqueId ? 'text-base-content' : 'text-base-content/40')}>
                    {username || t('selectPersonPlaceholder')}
                  </span>
                </button>
              ) : (
                <input
                  type="text"
                  className={cx(pillInput, 'w-52')}
                  placeholder={t('namePlaceholder')}
                  value={username || ''}
                  onChange={(e) => setUsername(e.target.value || undefined)}
                />
              )}
            </div>
          )}

          {/* 근무 목적 */}
          <div className="flex items-start gap-4">
            <span className={fieldLabel}>{t('purposeLabel')}</span>
            <input
              type="text"
              className={cx(pillInput, 'flex-1')}
              placeholder={t('purposePlaceholder')}
              value={contents || ''}
              onChange={(e) => setContents(e.target.value || undefined)}
            />
          </div>

          {/* 근무일 */}
          <div className="flex items-start gap-4">
            <span className={fieldLabel}>{t('workDateLabel')}</span>
            <div className="relative" ref={datePickerRef}>
              <button type="button" className={pillControl} onClick={() => setShowDatePicker((v) => !v)}>
                {date ? (
                  <span>
                    {dayjs(date).format('YYYY-MM-DD')} ({getDaysOfWeek(dayjs(date).day())}) 📅
                  </span>
                ) : (
                  <span className="text-base-content/40">{t('selectDate')} 📅</span>
                )}
              </button>
              {showDatePicker && (
                <div className="bg-base-200 absolute top-full left-0 z-50 mt-2 rounded-xl border border-white/10 p-2 shadow-2xl">
                  <DayPicker
                    className="rdp-dark"
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
          <div className="flex items-start gap-4">
            <span className={fieldLabel}>{t('workTimeLabel')}</span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-base-content/40 text-xs">{t('start')}</span>
              <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} className={selectPill}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {t('hourUnit', { value: String(i).padStart(2, '0') })}
                  </option>
                ))}
              </select>
              <select
                value={startMinutes}
                onChange={(e) => setStartMinutes(Number(e.target.value))}
                className={selectPill}
              >
                <option value={0}>{t('minuteUnit', { value: '00' })}</option>
                <option value={30}>{t('minuteUnit', { value: '30' })}</option>
              </select>
              <span className="text-base-content/40 text-sm">{t('timeSep')}</span>
              <span className="text-base-content/40 text-xs">{t('end')}</span>
              <select value={endHour} onChange={(e) => setEndHour(Number(e.target.value))} className={selectPill}>
                {Array.from({ length: 24 }, (_, i) => (
                  <option key={i} value={i}>
                    {t('hourUnit', { value: String(i).padStart(2, '0') })}
                  </option>
                ))}
              </select>
              <select value={endMinutes} onChange={(e) => setEndMinutes(Number(e.target.value))} className={selectPill}>
                <option value={0}>{t('minuteUnit', { value: '00' })}</option>
                <option value={30}>{t('minuteUnit', { value: '30' })}</option>
              </select>
            </div>
          </div>

          {/* 보상휴가 */}
          <div className="flex items-start gap-4">
            <span className={fieldLabel}>{t('compLabel')}</span>
            <div className="flex items-center gap-2.5 pt-1">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={isDayOff}
                onChange={(e) => setIsDayOff(e.target.checked)}
              />
              <span className="text-base-content/70 text-sm">{t('compToggle')}</span>
            </div>
          </div>

          {/* Add button */}
          <button type="button" className="btn btn-outline w-full" onClick={handleAddWorkTime}>
            {t('addButton')}
          </button>
        </div>

        {/* Divider */}
        <hr className="border-white/5" />

        {/* List zone */}
        <div>
          <p className="px-6 pt-4 pb-2 text-sm font-semibold">
            <span className="text-base-content">{t('listTitle')}</span>{' '}
            <span className="text-primary">{t('listCount', { count: workTimes.length })}</span>
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-base-content/40 px-6 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colDate')}
                  </th>
                  <th className="text-base-content/40 px-4 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colTime')}
                  </th>
                  <th className="text-base-content/40 px-4 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colPurpose')}
                  </th>
                  <th className="text-base-content/40 px-4 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colWorker')}
                  </th>
                  <th className="text-base-content/40 px-4 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colComp')}
                  </th>
                  <th className="text-base-content/40 w-14 px-4 py-2 text-left text-[11px] font-semibold tracking-wider uppercase">
                    {t('colDelete')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {workTimes.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <HiOutlineDocumentText className="text-base-content/20 size-10" />
                        <p className="text-base-content/70 text-sm font-semibold">{t('emptyTitle')}</p>
                        <p className="text-base-content/40 text-sm">{t('emptyDescription')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  workTimes.map((wt, index) => (
                    <tr key={index} className="h-[52px] border-b border-white/5 last:border-b-0 hover:bg-white/5">
                      <td className="text-base-content px-6 text-sm">
                        <span className="font-semibold">{dayjs(wt.startDate).format('MM.DD')}</span>{' '}
                        <span className="text-base-content/50">{getDaysOfWeek(dayjs(wt.startDate).day())}</span>
                      </td>
                      <td className="text-base-content/70 px-4 text-sm">
                        {dayjs(wt.startDate).format('HH:mm')} – {dayjs(wt.endDate).format('HH:mm')}
                      </td>
                      <td className="text-base-content/70 px-4 text-sm">{wt.contents}</td>
                      <td className="text-base-content/70 px-4 text-sm">{wt.username}</td>
                      <td className="px-4">
                        {wt.isDayOff ? (
                          <span className="bg-primary/15 text-primary rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {t('compApplied')}
                          </span>
                        ) : (
                          <span className="text-base-content/30">—</span>
                        )}
                      </td>
                      <td className="px-4">
                        <button
                          type="button"
                          aria-label={t('deleteAria')}
                          className="text-base-content/50 hover:text-error flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-white/10"
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
        <div className="flex justify-end gap-3 border-t border-white/5 px-6 py-4">
          <button type="button" className="btn btn-ghost" onClick={() => router.push('/documents')}>
            {t('cancel')}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={workTimes.length === 0 || isLoading}
            onClick={handleCreateDocument}
          >
            {isLoading ? (
              <span className="flex items-center gap-1.5">
                <span className="loading loading-spinner loading-xs" />
                {t('submitting')}
              </span>
            ) : (
              t('submit')
            )}
          </button>
        </div>
      </div>

      <SelectUserModal show={showUser} onClose={() => setShowUser(false)} onSelect={handleSelectUser} />
    </>
  );
}
