'use client';

import { useEffect, useRef, useState } from 'react';

import { HiOutlineDocumentText } from 'react-icons/hi';

import { useRouter } from 'next/navigation';

import { useCreateOverTimeWorkDocument } from '@/domain/document/queries/overtime';
import { User } from '@/domain/users/apis/users.dto';
import Badge from '@/shared/components/Badge';
import Card from '@/shared/components/Card';
import FormSection from '@/shared/components/FormSection';
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

const pillControl =
  'bg-base-100 border-base-300 text-base-content flex h-11 cursor-pointer items-center gap-2.5 rounded-[10px] border px-5 text-sm transition-colors duration-150 hover:bg-base-200';

const pillInput =
  'bg-base-100 border-base-300 text-base-content placeholder:text-3 h-11 rounded-[10px] border px-5 text-sm transition-colors duration-150 focus:border-primary focus:outline-none';

const selectPill =
  'bg-base-100 border-base-300 text-base-content h-11 rounded-[10px] border px-4 text-sm focus:outline-none';

const columnHead = 'text-3 px-4 py-2 text-left text-xs font-semibold';

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
    // 검증 순서는 섹션 순서(2 근무 시간 → 3 내용)를 따른다.
    if (!date) {
      push(t('toast.selectDate'), 'warning');
      return;
    }
    if (!contents) {
      push(t('toast.inputPurpose'), 'warning');
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

  // summary calculations
  const workerCount = new Set(workTimes.map((wt) => wt.username)).size;
  const totalHours = workTimes.reduce((sum, wt) => sum + dayjs(wt.endDate).diff(wt.startDate, 'minute') / 60, 0);

  return (
    <>
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px] lg:items-start">
        <Card>
          {/* 1 — 인원 */}
          <FormSection step={1} title={t('step1')} description={t('step1Desc')}>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                aria-pressed={isRegisteredUser === true}
                className={cx(
                  'h-9 cursor-pointer rounded-[10px] px-4 text-sm font-medium transition-colors duration-100',
                  isRegisteredUser === true
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-2 hover:bg-base-300',
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
                  'h-9 cursor-pointer rounded-[10px] px-4 text-sm font-medium transition-colors duration-100',
                  isRegisteredUser === false
                    ? 'bg-primary text-primary-content'
                    : 'bg-base-200 text-2 hover:bg-base-300',
                )}
                onClick={() => {
                  setIsRegisteredUser(false);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                {t('unregistered')}
              </button>
              <button
                type="button"
                aria-label={t('clearAria')}
                className="text-3 hover:text-base-content hover:bg-base-200 flex size-9 flex-none cursor-pointer items-center justify-center rounded-[10px] transition-colors duration-100"
                onClick={() => {
                  setIsRegisteredUser(undefined);
                  setUsername(undefined);
                  setUserUniqueId(undefined);
                }}
              >
                ×
              </button>
            </div>

            {isRegisteredUser !== undefined && (
              <div className="pt-3">
                {isRegisteredUser ? (
                  <button type="button" className={pillControl} onClick={() => setShowUser(true)}>
                    <span className="text-3">{t('selectPerson')} —</span>
                    <span className={cx(userUniqueId ? 'text-base-content' : 'text-3')}>
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
          </FormSection>

          {/* 2 — 근무 시간 */}
          <FormSection step={2} title={t('step2')} description={t('step2Desc')}>
            <div className="relative" ref={datePickerRef}>
              <button type="button" className={pillControl} onClick={() => setShowDatePicker((v) => !v)}>
                {date ? (
                  <span>
                    {dayjs(date).format('YYYY-MM-DD')} ({getDaysOfWeek(dayjs(date).day())})
                  </span>
                ) : (
                  <span className="text-3">{t('selectDate')}</span>
                )}
              </button>
              {showDatePicker && (
                <div className="bg-base-100 border-base-300 shadow-whisper absolute top-full left-0 z-50 mt-2 rounded-xl border p-2">
                  <DayPicker
                    className="rdp-theme"
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

            <div className="flex flex-wrap items-center gap-2 pt-3">
              <span className="text-3 text-xs">{t('start')}</span>
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
              <span className="text-3 text-sm">{t('timeSep')}</span>
              <span className="text-3 text-xs">{t('end')}</span>
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

            <label className="flex w-fit cursor-pointer items-center gap-2.5 pt-3.5">
              <input
                type="checkbox"
                className="toggle toggle-primary toggle-sm"
                checked={isDayOff}
                onChange={(e) => setIsDayOff(e.target.checked)}
              />
              <span className="text-2 text-sm">{t('compToggle')}</span>
            </label>
          </FormSection>

          {/* 3 — 내용 */}
          <FormSection step={3} title={t('step3')} description={t('step3Desc')}>
            <input
              type="text"
              className={cx(pillInput, 'w-full')}
              placeholder={t('purposePlaceholder')}
              value={contents || ''}
              onChange={(e) => setContents(e.target.value || undefined)}
            />
            <button type="button" className="btn btn-outline mt-3.5 w-full" onClick={handleAddWorkTime}>
              {t('addButton')}
            </button>
          </FormSection>

          {/* 추가된 근무 내역 */}
          <div>
            <p className="border-soft border-b px-[22px] py-3.5 text-sm font-semibold">
              <span className="text-base-content">{t('listTitle')}</span>{' '}
              <span className="text-primary">{t('listCount', { count: workTimes.length })}</span>
            </p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-soft border-b">
                    <th className={cx(columnHead, 'pl-[22px]')}>{t('colDate')}</th>
                    <th className={columnHead}>{t('colTime')}</th>
                    <th className={columnHead}>{t('colPurpose')}</th>
                    <th className={columnHead}>{t('colWorker')}</th>
                    <th className={columnHead}>{t('colComp')}</th>
                    <th className={cx(columnHead, 'w-14')}>{t('colDelete')}</th>
                  </tr>
                </thead>
                <tbody>
                  {workTimes.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <HiOutlineDocumentText className="text-3 size-10" />
                          <p className="text-2 text-sm font-semibold">{t('emptyTitle')}</p>
                          <p className="text-3 text-sm">{t('emptyDescription')}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    workTimes.map((wt, index) => (
                      <tr key={index} className="hover:bg-base-200 border-soft h-[52px] border-b last:border-b-0">
                        <td className="text-base-content pl-[22px] text-sm">
                          <span className="font-semibold">{dayjs(wt.startDate).format('MM.DD')}</span>{' '}
                          <span className="text-3">{getDaysOfWeek(dayjs(wt.startDate).day())}</span>
                        </td>
                        <td className="text-2 px-4 text-sm">
                          {dayjs(wt.startDate).format('HH:mm')} – {dayjs(wt.endDate).format('HH:mm')}
                        </td>
                        <td className="text-2 px-4 text-sm">{wt.contents}</td>
                        <td className="text-2 px-4 text-sm">{wt.username}</td>
                        <td className="px-4">
                          {wt.isDayOff ? (
                            <Badge variant="primary">{t('compApplied')}</Badge>
                          ) : (
                            <span className="text-3">{t('empty')}</span>
                          )}
                        </td>
                        <td className="px-4">
                          <button
                            type="button"
                            aria-label={t('deleteAria')}
                            className="text-3 hover:text-error hover:bg-base-200 flex size-7 cursor-pointer items-center justify-center rounded-[10px] transition-colors"
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
        </Card>

        {/* 신청 요약 */}
        <Card className="p-5 lg:sticky lg:top-0">
          <h3 className="text-[15px] font-semibold">{t('summaryTitle')}</h3>
          <div className="border-soft text-2 flex justify-between border-b py-2.5 text-sm">
            {t('summaryCountLabel')}
            <b className="text-base-content">{t('summaryCount', { count: workTimes.length })}</b>
          </div>
          <div className="border-soft text-2 flex justify-between border-b py-2.5 text-sm">
            {t('summaryWorkers')}
            <b className="text-base-content">{t('workerCount', { count: workerCount })}</b>
          </div>
          <div className="text-2 flex items-baseline justify-between pt-3.5 pb-1 text-sm">
            {t('summaryHours')}
            <b className="text-primary text-[22px] font-bold">{t('hours', { hours: totalHours.toFixed(1) })}</b>
          </div>
          <button
            type="button"
            className="btn btn-primary mt-3.5 w-full"
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
        </Card>
      </div>

      <SelectUserModal show={showUser} onClose={() => setShowUser(false)} onSelect={handleSelectUser} />
    </>
  );
}
