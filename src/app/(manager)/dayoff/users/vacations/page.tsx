import DayOffManageContents from './_components/DayOffManageContents';

export default function DayoffManagePage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">임직원 휴가 사용 현황</h2>
      </div>

      {/* contents */}
      <div className="w-full">
        <DayOffManageContents />
      </div>
    </div>
  );
}
