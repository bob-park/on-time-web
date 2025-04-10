'use client';

import { useState } from 'react';

import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';

import { useVacationDocuments } from '@/domain/document/query/vacation';

import { getDaysOfWeek } from '@/utils/parse';

import dayjs from 'dayjs';

const DEFAULT_SEARCH_PARAMS: SearchVacationDocumentRequest = {
  startDateFrom: `${dayjs().year()}-01-01`,
  startDateTo: `${dayjs().year()}-12-31`,
  status: 'APPROVED',
  page: 0,
  size: 100,
};

export default function DayOffHistoryContents() {
  // statue
  const [selectedYear, setSelectedYear] = useState<number>(dayjs().year());

  // query
  const { vacationDocuments } = useVacationDocuments({
    ...DEFAULT_SEARCH_PARAMS,
    startDateFrom: `${selectedYear}-01-01`,
    startDateTo: `${selectedYear}-12-31`,
  });

  return (
    <div className="flex size-full flex-col items-center justify-center gap-10">
      {/* select year */}
      <div className="">
        <div className="flex flex-row items-center justify-center gap-5">
          {/* prev */}
          <button className="btn btn-neutral" onClick={() => setSelectedYear(selectedYear - 1)}>
            <IoIosArrowBack className="size-6" />
          </button>
          {/* current */}
          <div className="">
            <p className="text-lg font-semibold">{selectedYear} 년</p>
          </div>
          {/* next */}
          <button className="btn btn-neutral" onClick={() => setSelectedYear(selectedYear + 1)}>
            <IoIosArrowForward className="size-6" />
          </button>
        </div>
      </div>

      {/* total used vacation */}
      <div className="w-full">
        <div className="flex w-full flex-row items-center gap-4">
          <div className="w-24 flex-none text-right">총 사용 개수 :</div>
          <div className="text-lg">
            <span>총</span>
            <span className="mx-2 font-bold">
              {vacationDocuments.length > 0
                ? vacationDocuments.map((item) => item.usedDays).reduce((total, current) => (total += current))
                : 0}
            </span>
            <span>개</span>
          </div>
        </div>
      </div>

      {/* used vacations */}
      <div className="w-full">
        <div className="flex flex-col items-center justify-center gap-2">
          {/* headers */}
          <div className="flex h-12 flex-row items-center justify-center gap-2 border-b border-gray-300 text-center font-semibold">
            <div className="w-24 flex-none">index</div>
            <div className="w-24 flex-none">종류</div>
            <div className="w-24 flex-none">구분</div>
            <div className="w-36 flex-none">사용일</div>
            <div className="w-24 flex-none">사용일수</div>
            <div className="w-96 flex-none">비고</div>
          </div>

          {/* contents */}
          {vacationDocuments
            .sort((o1, o2) => (dayjs(o1.startDate).isAfter(o2.startDate) ? 1 : -1))
            .map((vacationDocument, index) => (
              <div
                key={`vacation-document-item-${vacationDocument.id}`}
                className="hover:bg-base-300 flex min-h-16 flex-row items-center justify-center gap-2 rounded-xl text-center transition-all duration-150"
              >
                <div className="w-24 flex-none">{index + 1}</div>
                <div className="w-24 flex-none">
                  <VacationTypeBadge type={vacationDocument.vacationType} />
                </div>
                <div className="w-24 flex-none">
                  <VacationSubTypeBadge subType={vacationDocument.vacationSubType} />
                </div>
                <div className="w-36 flex-none">
                  {dayjs(vacationDocument.startDate).isSame(vacationDocument.endDate) ? (
                    <div className="">
                      {`${dayjs(vacationDocument.startDate).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(vacationDocument.startDate).day())})`}
                    </div>
                  ) : (
                    <div className="text-left">
                      <div>{`${dayjs(vacationDocument.startDate).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(vacationDocument.startDate).day())})`}</div>
                      <div>{`- ${dayjs(vacationDocument.endDate).format('YYYY-MM-DD')} (${getDaysOfWeek(dayjs(vacationDocument.endDate).day())})`}</div>
                    </div>
                  )}
                </div>
                <div className="w-24 flex-none">{vacationDocument.usedDays}</div>
                <div className="w-96 flex-none">
                  {vacationDocument.usedCompLeaveEntries?.map((item) => (
                    <div key={`vacation-document-used-comp-leave-entry-${item.id}`} className="my-2 text-start">
                      <span>{dayjs(item.compLeaveEntry.effectiveDate).format('YYYY-MM-DD')}</span>
                      <span className="mx-1">-</span>
                      <span>{item.compLeaveEntry.contents}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function VacationTypeBadge({ type }: { type: VacationType }) {
  switch (type) {
    case 'COMPENSATORY': {
      return <div className="badge badge-secondary">보상휴가</div>;
    }
    case 'OFFICIAL': {
      return <div className="badge badge-neutral">공가</div>;
    }
    default: {
      return <div className="badge badge-primary">연차</div>;
    }
  }
}

function VacationSubTypeBadge({ subType }: { subType?: VacationSubType }) {
  switch (subType) {
    case 'AM_HALF_DAY_OFF': {
      return <div className="badge badge-secondary">오전반차</div>;
    }
    case 'PM_HALF_DAY_OFF': {
      return <div className="badge badge-neutral">오후반차</div>;
    }
    default: {
      return <div></div>;
    }
  }
}
