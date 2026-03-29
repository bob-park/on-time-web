import Link from 'next/link';

import DayOffRequestContent from './_components/DayOffRequestContents';
import UserLeaveEntryContents from './_components/UserLeaveEntryContents';

export default function DayOffRequestsPage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* breadcrumb + header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">
            휴가 신청 <span className="text-lg font-normal text-gray-400"></span>
          </h2>
        </div>
        <Link
          href="/dayoff/used"
          className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors duration-150 hover:bg-gray-50"
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
