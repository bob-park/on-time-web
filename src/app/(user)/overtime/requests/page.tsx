import OvertimeRequestContents from './_components/OvertimeRequestContents';

export default function OvertimeRequestsPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">휴일 근무 보고서 신청</h2>
      </div>

      {/* content */}
      <div className="flex max-w-[800px] flex-col items-center justify-center gap-3">
        <div className="w-full">
          <OvertimeRequestContents />
        </div>
      </div>
    </div>
  );
}
