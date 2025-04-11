import DayOffHistoryContents from './_components/DayOffHistoryContents';

export default function DayOffHistoryPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">휴가 내역</h2>
      </div>

      {/* contents */}
      <div className="flex max-w-[900px] flex-col items-center justify-center gap-3">
        <div className="w-full">
          <DayOffHistoryContents />
        </div>
      </div>
    </div>
  );
}
