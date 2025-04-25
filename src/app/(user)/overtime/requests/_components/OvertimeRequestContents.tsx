'use client';

import { useState } from 'react';

import { FaCheck, FaFirstdraft } from 'react-icons/fa6';
import { HiMiniCheckCircle } from 'react-icons/hi2';
import { IoIosAddCircle } from 'react-icons/io';

import { useRouter } from 'next/navigation';

import { useCreateOverTimeWorkDocument } from '@/domain/document/query/overtime';

import useToast from '@/shared/hooks/useToast';

import { getDaysOfWeek } from '@/utils/parse';

import cx from 'classnames';
import dayjs from 'dayjs';

import SelectDatetimeModal from './SelectDatetimeModal';
import SelectUserModal from './SelectUserModal';

interface WorkTime {
  startDate: Date;
  endDate: Date;
  userUniqueId?: string;
  username: string;
  contents: string;
  isDayOff: boolean;
}

export default function OvertimeRequestContents() {
  // state
  const [workTimes, setWorkTimes] = useState<WorkTime[]>([]);

  const [showUser, setShowUser] = useState<boolean>(false);
  const [showDatetimePicker, setShowDatetimePicker] = useState<boolean>(false);

  const [isRegisteredUser, setIsRegisteredUser] = useState<boolean>();
  const [username, setUsername] = useState<string>();
  const [userUniqueId, setUserUniqueId] = useState<string>();
  const [isDayOff, setIsDayOff] = useState<boolean>(true);
  const [contents, setContents] = useState<string>();
  const [date, setDate] = useState<{ startDate: Date; endDate: Date }>();

  // hooks
  const { push } = useToast();
  const router = useRouter();

  // query
  const { createOverTimeWork, isLoading } = useCreateOverTimeWorkDocument(
    () => {
      push('휴일 근무 보고서 초안이 작성되었습니다.', 'info');
      router.push('/documents');
    },
    () => push('먼가 문제가 있는디?', 'error'),
  );

  // handle
  const handleAddWorkTime = () => {
    if (isRegisteredUser === undefined || !username || !contents || !date) {
      push('제대로 입력해야지? 혼나기 싫으면?', 'warning');
      return;
    }

    setWorkTimes((prev) => {
      const newWorkTimes = prev.slice();

      newWorkTimes.push({
        startDate: date.startDate,
        endDate: date.endDate,
        userUniqueId,
        username,
        contents,
        isDayOff,
      });

      return newWorkTimes;
    });

    setIsRegisteredUser(undefined);
    setUsername(undefined);
    setUserUniqueId(undefined);
    setContents(undefined);
    setDate(undefined);
    setIsDayOff(true);

    document.getElementById('reset_is_registered_user_btn')?.click();
  };

  const handleSelectUser = (user: User) => {
    setUserUniqueId(user.uniqueId);
    setUsername(user.username);
  };

  const handleCreateDocument = () => {
    if (workTimes.length === 0) {
      return;
    }

    createOverTimeWork({
      times: workTimes.map((workTime) => ({
        userUniqueId: workTime.userUniqueId,
        username: workTime.username,
        contents: workTime.contents,
        startDate: dayjs(workTime.startDate).format('YYYY-MM-DDTHH:mm:ss'),
        endDate: dayjs(workTime.endDate).format('YYYY-MM-DDTHH:mm:ss'),
        isDayOff: workTime.isDayOff,
      })),
    });
  };

  return (
    <>
      <div className="flex size-full flex-col items-center justify-center gap-10">
        {/* card */}
        {/* add form */}
        <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-3 p-3 shadow-sm">
          {/* body */}
          <div className="card-body w-full">
            <div className="flex flex-col gap-10">
              {/* select user  */}
              <div className="flex flex-row items-center gap-3">
                <span className="w-32 flex-none text-right text-base font-semibold">등록 여부 :</span>
                <div className="">
                  <form className="filter">
                    <input
                      className="btn btn-square"
                      id="reset_is_registered_user_btn"
                      type="reset"
                      value="×"
                      onClick={() => {
                        setIsRegisteredUser(undefined);
                        setUsername(undefined);
                        setUserUniqueId(undefined);
                      }}
                    />
                    <input
                      className={cx('btn', { 'btn-neutral': isRegisteredUser })}
                      type="radio"
                      name="vacationTypes"
                      aria-label="등록 직원"
                      onClick={() => setIsRegisteredUser(true)}
                    />
                    <input
                      className={cx('btn', { 'btn-neutral': isRegisteredUser !== undefined && !isRegisteredUser })}
                      type="radio"
                      name="vacationTypes"
                      aria-label="미등록 직원"
                      onClick={() => setIsRegisteredUser(false)}
                    />
                  </form>
                </div>
              </div>

              {/* select user */}
              <div
                className={cx('flex flex-row items-center gap-3', {
                  hidden: !isRegisteredUser,
                })}
              >
                <span className="w-32 flex-none text-right text-base font-semibold"> 인원 선택 :</span>
                <div className="">
                  <button className={cx('btn', { 'btn-neutral': !!userUniqueId })} onClick={() => setShowUser(true)}>
                    {userUniqueId ? (
                      <>
                        <FaCheck className="size-5" />
                        {username}
                      </>
                    ) : (
                      <>인원 선택</>
                    )}
                  </button>
                </div>
              </div>

              {/* input username */}
              {/* username */}
              <div
                className={cx('flex flex-row items-center gap-3', {
                  hidden: isRegisteredUser === undefined || isRegisteredUser,
                })}
              >
                <span className="w-32 flex-none text-right text-base font-semibold">인원 이름 :</span>
                <div className="">
                  <label className="input w-[380px]">
                    <input
                      type="text"
                      className="grow"
                      placeholder="성명"
                      value={username || ''}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <span className="badge badge-neutral badge-xs">필수</span>
                  </label>
                </div>
              </div>

              {/* contents */}
              <div className={cx('flex flex-row items-center gap-3', {})}>
                <span className="w-32 flex-none text-right text-base font-semibold">근무 목적 :</span>
                <div className="">
                  <label className="input w-[380px]">
                    <input
                      type="text"
                      className="grow"
                      placeholder="근무 목적"
                      value={contents || ''}
                      onChange={(e) => setContents(e.target.value)}
                    />
                    <span className="badge badge-neutral badge-xs">필수</span>
                  </label>
                </div>
              </div>

              {/* date range */}
              <div className={cx('flex w-full flex-row items-center gap-3', {})}>
                <span className="w-32 flex-none text-right text-base font-semibold">근무 시간 :</span>
                <div className="join w-[380px]">
                  <label className="input join-item w-full">
                    <div className="grow">
                      {date && (
                        <p>
                          <span>{dayjs(date.startDate).format('YYYY-MM-DD HH:mm')}</span>
                          <span> - </span>
                          <span>{dayjs(date.endDate).format('YYYY-MM-DD HH:mm')}</span>
                        </p>
                      )}
                    </div>
                  </label>

                  <button className="btn btn-neutral join-item w-24" onClick={() => setShowDatetimePicker(true)}>
                    변경
                  </button>
                </div>
              </div>

              {/* type */}
              <div className="flex flex-row items-center gap-3">
                <span className="w-32 flex-none text-right text-base font-semibold">보상휴가 여부:</span>
                <div className="">
                  <label className="toggle">
                    <input type="checkbox" checked={isDayOff} onChange={(e) => setIsDayOff(e.target.checked)} />
                    <svg
                      aria-label="disabled"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 6 6 18" />
                      <path d="m6 6 12 12" />
                    </svg>
                    <svg aria-label="enabled" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g strokeLinejoin="round" strokeLinecap="round" strokeWidth="4" fill="none" stroke="currentColor">
                        <path d="M20 6 9 17l-5-5"></path>
                      </g>
                    </svg>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* action button */}
          <div className="my-10 flex flex-row gap-4">
            <button type="button" className="btn w-36">
              취소
            </button>
            <div className="tooltip" data-tip="결과에 추가될꺼임">
              <button type="button" className="btn btn-neutral w-36" onClick={handleAddWorkTime}>
                <IoIosAddCircle className="size-6" />
                추가
              </button>
            </div>
          </div>
        </div>

        {/* list form */}
        <div className="card bg-base-100 m-3 flex size-full flex-col items-center justify-center gap-3 p-3 shadow-sm">
          {/* body */}
          <div className="card-body w-full">
            <div className="flex flex-col gap-10">
              <table className="table w-full">
                <thead>
                  <tr>
                    <th className="text-center font-bold">근무일</th>
                    <th className="text-center font-bold">근무시간</th>
                    <th className="font-boldr text-center">근무목적</th>
                    <th className="text-center font-bold">근무자</th>
                    <th className="text-center font-bold">보상휴가 여부</th>
                  </tr>
                </thead>
                <tbody>
                  {workTimes.map((workTime, index) => (
                    <tr key={`work-time-item-${index}`} className="hover:bg-base-200 cursor-pointer">
                      <td className="text-center">
                        <span>{dayjs(workTime.startDate).format('YYYY-MM-DD')}</span>
                        <span className="ms-1">
                          <span>(</span>
                          <span>{getDaysOfWeek(dayjs(workTime.startDate).day())}</span>
                          <span>)</span>
                        </span>
                      </td>
                      <td className="text-center">
                        <span>{dayjs(workTime.startDate).format('HH:mm')}</span>
                        <span> - </span>
                        <span>{dayjs(workTime.endDate).format('HH:mm')}</span>
                      </td>
                      <td className="">{workTime.contents}</td>
                      <td className="text-center">{workTime.username}</td>
                      <td className="text-center">
                        <div className="flex flex-row items-center justify-center gap-2">
                          {workTime.isDayOff && <HiMiniCheckCircle className="size-6 text-green-700" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* action button */}
          <div className="my-10 flex flex-row gap-4">
            <button type="button" className="btn w-36">
              취소
            </button>
            <div className="tooltip" data-tip="문서 초안이 생성됩니다.">
              <button
                type="button"
                className="btn btn-neutral w-36"
                disabled={workTimes.length === 0 || isLoading}
                onClick={handleCreateDocument}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner" />
                    초안 생성중
                  </>
                ) : (
                  <>
                    <FaFirstdraft className="size-6" />
                    초안 생성
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
      <SelectUserModal show={showUser} onClose={() => setShowUser(false)} onSelect={handleSelectUser} />
      <SelectDatetimeModal
        show={showDatetimePicker}
        onClose={() => setShowDatetimePicker(false)}
        onSelect={(date) => setDate(date)}
      />
    </>
  );
}
