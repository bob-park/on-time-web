import DayOffRequestContent from './_components/DayOffRequestContents';
import UserLeaveEntryContents from './_components/UserLeaveEntryContents';

export default function DayOffRequestsPage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">휴가 신청</h2>
      </div>

      {/* content */}
      <div className="flex max-w-[800px] flex-col items-center justify-center gap-3">
        <div className="w-full">
          <UserLeaveEntryContents />
        </div>
        <div className="w-full">
          <DayOffRequestContent />
        </div>
      </div>
    </div>
  );
}
