'use client';

import { getDaysOfWeek } from '@/utils/parse';

import dayjs from 'dayjs';

import DocumentApprovalLine from './DocumentApprovalLine';

interface VacationDocumentProps {
  id: string;
  document: VacationDocument;
}

export default function VacationDocument({ id, document }: VacationDocumentProps) {
  return (
    <div id={id} className="relative flex size-full flex-col items-center gap-3">
      {/* 결재 정보 */}
      <div className="mt-16 mr-32 flex w-full flex-row items-center justify-end gap-2">
        <DocumentApprovalLine />
      </div>

      {/* title */}
      <div className="mt-[100px]">
        <span className="mr-[50px] text-5xl font-bold">휴</span>
        <span className="mr-[50px] text-5xl font-bold">가</span>
        <span className="mr-[50px] text-5xl font-bold">계</span>
      </div>

      {/* 성명 */}
      <div className="mt-28 flex w-full flex-row items-center gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[80px]">성</span>
            <span>명</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <span className="ml-16 text-2xl font-bold tracking-widest">{document.user.username}</span>
        </div>
      </div>

      {/* 부서 */}
      <div className="mt-6 flex w-full flex-row items-center gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[80px]">부</span>
            <span>서</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <span className="ml-16 text-2xl tracking-widest">{document.user.team.name}</span>
        </div>
      </div>

      {/* 직위 */}
      <div className="mt-6 flex w-full flex-row items-center gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[80px]">직</span>
            <span>위</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <span className="ml-16 text-2xl font-bold tracking-widest">{document.user.position.name}</span>
        </div>
      </div>

      {/* 휴가 기간 */}
      <div className="mt-6 flex w-full flex-row items-center gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[13px]">휴</span>
            <span className="mr-[13px]">가</span>
            <span className="mr-[13px]">기</span>
            <span>간</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <div className="ml-16 text-2xl font-semibold">
            <DateRange usedDays={document.usedDays} from={document.startDate} to={document.endDate} />
          </div>
        </div>
      </div>

      {/* 휴가 구분 */}
      <div className="mt-6 flex w-full flex-row items-start gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[13px]">휴</span>
            <span className="mr-[13px]">가</span>
            <span className="mr-[13px]">구</span>
            <span>분</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <VacationTypeItem type={document.vacationType} subType={document.vacationSubType} />
        </div>
        {document.vacationType === 'COMPENSATORY' && (
          <div className="w-full flex-1">
            <div className="mt-1 ml-10 pr-10">
              {document.usedCompLeaveEntries?.map((usedCompLeaveEntry) => (
                <div key={`used-comp-leave-entry-${usedCompLeaveEntry.id}`} className="text-lg">
                  <span>{dayjs(usedCompLeaveEntry.compLeaveEntry.effectiveDate).format('YYYY-MM-DD')}</span>
                  <span> - </span>
                  <span>{usedCompLeaveEntry.compLeaveEntry.contents}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 사유 */}
      <div className="mt-6 flex w-full flex-row items-center gap-3">
        <div className="w-72 flex-none text-right text-2xl">
          <span className="mr-5">
            <span className="mr-[80px]">사</span>
            <span>유</span>
          </span>
          <span>:</span>
        </div>
        <div className="">
          <span className="ml-16 text-2xl">{document.reason}</span>
        </div>
      </div>

      {/* 문구 */}
      <div className="mt-32 flex w-full flex-row items-center justify-center gap-3">
        <p className="text-2xl font-semibold">위와 같이 신청하오니 재가 바랍니다.</p>
      </div>

      {/* 신청자 정보 */}
      <div className="mt-32 mr-40 flex w-full flex-row items-center justify-end gap-3">
        <div className="w-72 flex-none text-right text-xl tracking-widest">
          <span>신청일</span>
          <span>:</span>
        </div>
        <p className="ml-10 text-xl tracking-widest">{dayjs(document.createdDate).format('YYYY 년 MM 월 DD 일')}</p>
      </div>

      <div className="mt-5 mr-40 flex w-full flex-row items-center justify-end gap-3">
        <div className="w-72 flex-none text-right text-xl tracking-widest">
          <span>신청자</span>
          <span>:</span>
        </div>
        <p className="ml-10 text-xl">
          <span className="text-2xl font-bold tracking-widest">{document.user.username}</span>
          <span className="ml-16">(인)</span>
        </p>
      </div>
    </div>
  );
}

interface DateRangeProps {
  usedDays: number;
  from: Date;
  to: Date;
}

function DateRange({ usedDays, from, to }: DateRangeProps) {
  if (usedDays > 1) {
    return (
      <div className="">
        <span>
          {dayjs(from).format('YYYY. MM. DD')}
          <span className="ml-1">({getDaysOfWeek(dayjs(from).day())})</span>
        </span>
        <span className="mx-3"> - </span>
        <span>
          {dayjs(to).format('YYYY. MM. DD')}
          <span className="ml-1">({getDaysOfWeek(dayjs(to).day())})</span>
        </span>

        <span className="ml-4 font-medium">({usedDays} 일)</span>
      </div>
    );
  }

  return (
    <div className="">
      {dayjs(from).format('YYYY. MM. DD')}
      <span className="ml-1">({getDaysOfWeek(dayjs(from).day())})</span>
    </div>
  );
}

interface VacationTypeItemProps {
  type: VacationType;
  subType?: VacationSubType;
}

function VacationTypeItem({ type, subType }: VacationTypeItemProps) {
  return (
    <div className="">
      {type === 'GENERAL' && !subType && <span className="ml-16 text-2xl font-bold tracking-widest">연차</span>}
      {type === 'GENERAL' && subType === 'AM_HALF_DAY_OFF' && (
        <span className="ml-16 text-2xl font-bold tracking-widest">오전반차</span>
      )}
      {type === 'GENERAL' && subType === 'PM_HALF_DAY_OFF' && (
        <span className="ml-16 text-2xl font-bold tracking-widest">오후반차</span>
      )}
      {type === 'OFFICIAL' && (
        <div className="ml-16">
          <span className="text-2xl font-bold tracking-widest">공가</span>
          {subType === 'AM_HALF_DAY_OFF' && <span className="ml-2 text-xl">(오전)</span>}
          {subType === 'PM_HALF_DAY_OFF' && <span className="ml-2 text-xl">(오후)</span>}
        </div>
      )}
      {type === 'COMPENSATORY' && (
        <div className="ml-16">
          <div className="">
            <span className="text-2xl font-bold tracking-widest">대체휴가</span>
            {subType === 'AM_HALF_DAY_OFF' && <span className="ml-2 text-xl">(오전)</span>}
            {subType === 'PM_HALF_DAY_OFF' && <span className="ml-2 text-xl">(오후)</span>}
          </div>

          {/* TODO 대체 휴가는 대체휴가 발생일 및 사유를 적어야됨 */}
        </div>
      )}
    </div>
  );
}
