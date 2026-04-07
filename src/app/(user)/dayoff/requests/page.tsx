import Link from 'next/link';

import DayOffRequestContent from './_components/DayOffRequestContents';
import UserLeaveEntryContents from './_components/UserLeaveEntryContents';

export default function DayOffRequestsPage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* breadcrumb + header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Day Off</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">휴가 신청</h2>
        </div>
        <Link
          href="/dayoff/used"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-slate-50"
        >
          휴가 내역 보기
        </Link>
      </div>

      {/* balance cards */}
      <UserLeaveEntryContents />

      {/* request form */}
      <DayOffRequestContent />
    </div>
  );
}
