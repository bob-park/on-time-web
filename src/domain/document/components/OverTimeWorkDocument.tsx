'use client';

import { useState } from 'react';

import { RiCheckboxBlankCircleLine } from 'react-icons/ri';

import DocumentApprovalLine from '@/domain/document/components/DocumentApprovalLine';

import cx from 'classnames';
import dayjs from 'dayjs';

const DEFAULT_WORK_TIME_ITEM_LENGTH = 12;

interface OverTimeWorkDocumentProps {
  id: string;
  document: OverTimeWorkDocument;
}

export default function OverTimeWorkDocument({ id, document }: OverTimeWorkDocumentProps) {
  const lines: ApprovalLine[] = [
    {
      id: document.id,
      documentType: 'VACATION',
      userUniqueId: document.user.uniqueId,
      contents: '담당',
      createdDate: new Date(),
    },
    ...document.approvalHistories.map((item) => ({
      ...item.approvalLine,
      status: item.status,
    })),
  ];

  return (
    <div id={id} className="relative flex size-full flex-col items-center gap-3">
      {/* 결재 정보 */}
      <div className="mt-16 mr-32 flex w-full flex-row items-center justify-end gap-2">
        <DocumentApprovalLine lines={lines} />
      </div>

      {/* title */}
      <div className="mt-[100px] underline underline-offset-8">
        <span className="text-5xl font-bold">휴일 근무 보고서</span>
      </div>

      {/* 작성일 */}
      <div className="mt-10 flex w-full flex-row items-center justify-end gap-3">
        <p className="text-xl font-semibold" style={{ marginRight: '15px' }}>
          <span className="">작 성 일 : </span>

          <span className="mr-2 ml-5">{dayjs(document.createdDate).format('YYYY 년')}</span>
          <span className="mx-1">{dayjs(document.createdDate).format('MM 월')}</span>
          <span className="mx-1">{dayjs(document.createdDate).format('DD 일')}</span>
        </p>
      </div>

      {/* contents */}
      <div className="mt-2 flex w-full flex-col items-center justify-center">
        {/* headers */}
        <div
          className="flex h-28 flex-row items-center justify-center border-x border-t border-b text-xl font-bold"
          style={{ borderColor: '#000', borderWidth: '2px' }}
        >
          <div
            className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
            style={{ borderColor: '#000' }}
          >
            <span>근무일</span>
          </div>
          <div
            className="flex h-full w-48 flex-none flex-col items-center justify-center border-r text-center"
            style={{ borderColor: '#000' }}
          >
            <p className="text-center">근무 시간</p>
            <p className="text-center text-sm font-normal">(비행 시간)</p>
          </div>
          <div
            className="flex h-full w-72 flex-none items-center justify-center border-r text-center"
            style={{ borderColor: '#000' }}
          >
            근무 목적
          </div>
          <div
            className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
            style={{ borderColor: '#000' }}
          >
            근무자
          </div>
          <div
            className="flex h-full w-40 flex-none flex-col items-center justify-center border-r text-center"
            style={{ borderColor: '#000' }}
          >
            <div
              className="flex size-full flex-col items-center justify-center border-b"
              style={{ borderColor: '#000' }}
            >
              <p className="text-center">휴가 대체</p>
              <p className="text-center text-sm font-normal">(8시간 이상)</p>
            </div>
            <div className="flex size-full flex-row items-center justify-center text-base">
              <div className="flex size-full items-center justify-center border-r" style={{ borderColor: '#000' }}>
                <span className="">휴가</span>
                <span className="text-sm font-normal">(유/무)</span>
              </div>
              <div className="flex size-full flex-col items-center justify-center">
                <p className="text-center">수당</p>
                <p className="text-center">적용 시간</p>
              </div>
            </div>
          </div>
          <div
            className="flex h-full w-24 flex-none items-center justify-center text-center"
            style={{ borderColor: '#000' }}
          >
            본인 확인
          </div>
        </div>

        {/* items */}
        {document.workTimes.map((item) => (
          <WorkTimeItem key={`work-time-${item.id}`} item={item} />
        ))}

        {/* empty items */}
        {new Array(DEFAULT_WORK_TIME_ITEM_LENGTH - document.workTimes.length).fill('0').map((_, index) => (
          <EmptyWorkTimeItem key={`empty-work-time-${index}`} />
        ))}
      </div>

      {document.status === 'DRAFT' && (
        <div className="left-[45%]] absolute top-[40%]">
          <div className="grid h-full w-full place-content-center opacity-50">
            <div className="-rotate-45 rounded-2xl border-8 border-solid border-sky-300 p-10 text-9xl font-black tracking-widest text-sky-300">
              초 안
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkTimeItem({ item }: { item: OverTimeWorkTime }) {
  // state
  const [hoverHour, setHoverHour] = useState<boolean>(false);

  return (
    <div
      className="text-x1 relative flex h-16 flex-row items-center justify-center border-x border-b text-xl"
      style={{ borderColor: '#000', borderRightWidth: '2px', borderLeftWidth: '2px', borderBottomWidth: '1px' }}
    >
      <div
        className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <span>{dayjs(item.startDate).format('MM 월 DD 일')}</span>
      </div>
      <div
        className="flex h-full w-48 flex-none flex-row items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <div
          className="flex h-full w-36 flex-none items-center justify-center border-r text-center"
          style={{ borderColor: '#000' }}
        >
          <span className="">{dayjs(item.startDate).format('HH:mm')}</span>
          <span className="" style={{ marginLeft: '5px', marginRight: '5px' }}>
            -
          </span>
          <span className="">{dayjs(item.endDate).format('HH:mm')}</span>
        </div>
        <div
          className="flex h-full flex-1 cursor-pointer items-center justify-center text-center"
          onMouseEnter={() => setHoverHour(true)}
          onMouseLeave={() => setHoverHour(false)}
        >
          <span className="">{item.appliedHours}</span>

          <div className={cx('absolute top-12', { hidden: !hoverHour })}>
            {item.reports.map((report) => (
              <div key={`work-time-item-${item.id}-report-${report.id}`} className="bg-base-200 rounded-2xl p-4">
                {report.report.split('\n').map((line, index) => (
                  <div
                    key={`work-time-item-${item.id}-report-${report.id}-index-${index}`}
                    className="text-start text-base"
                  >
                    {line}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex h-full w-72 flex-none items-center justify-center border-r" style={{ borderColor: '#000' }}>
        <p className="w-full" style={{ marginLeft: '24px' }}>
          {item.contents}
        </p>
      </div>
      <div
        className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <span className="font-bold">{item.username}</span>
      </div>
      <div
        className="flex h-full w-40 flex-none flex-row items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <div className="flex size-full items-center justify-center border-r" style={{ borderColor: '#000' }}>
          {item.isDayOff && <RiCheckboxBlankCircleLine className="siz-6" />}
        </div>
        <div className="flex size-full items-center justify-center">
          <span className="">{item.appliedExtraPaymentHours}</span>
        </div>
      </div>
      <div
        className="flex h-full w-24 flex-none items-center justify-center text-center"
        style={{ borderColor: '#000' }}
      ></div>
    </div>
  );
}

function EmptyWorkTimeItem() {
  return (
    <div
      className="text-x1 relative flex h-16 flex-row items-center justify-center border-x-2 border-b text-xl"
      style={{ borderColor: '#000', borderRightWidth: '2px', borderLeftWidth: '2px', borderBottomWidth: '1px' }}
    >
      <div
        className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      ></div>
      <div
        className="flex h-full w-48 flex-none flex-row items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <div
          className="flex h-full w-36 flex-none items-center justify-center border-r text-center"
          style={{ borderColor: '#000' }}
        ></div>
        <div className="flex h-full flex-1 cursor-pointer items-center justify-center text-center"></div>
      </div>
      <div
        className="flex h-full w-72 flex-none items-center justify-center border-r"
        style={{ borderColor: '#000' }}
      ></div>
      <div
        className="flex h-full w-28 flex-none items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      ></div>
      <div
        className="flex h-full w-40 flex-none flex-row items-center justify-center border-r text-center"
        style={{ borderColor: '#000' }}
      >
        <div className="flex size-full items-center justify-center border-r" style={{ borderColor: '#000' }}></div>
        <div className="flex size-full items-center justify-center"></div>
      </div>
      <div
        className="flex h-full w-24 flex-none items-center justify-center text-center"
        style={{ borderColor: '#000' }}
      ></div>
    </div>
  );
}
