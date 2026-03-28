import Link from 'next/link';

import DayOffHistoryContents from './_components/DayOffHistoryContents';

export default function DayOffHistoryPage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* 브레드크럼 + 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">휴가 내역</h2>
        </div>
        <Link
          href="/dayoff/requests"
          className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors duration-150 hover:bg-slate-700"
        >
          + 휴가 신청
        </Link>
      </div>

      {/* 컨텐츠 */}
      <DayOffHistoryContents />
    </div>
  );
}
