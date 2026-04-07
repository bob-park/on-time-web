import Link from 'next/link';

import DayOffHistoryContents from './_components/DayOffHistoryContents';

export default function DayOffHistoryPage() {
  return (
    <div className="flex size-full flex-col gap-4">
      {/* 브레드크럼 + 헤더 */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">History</p>
          <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">휴가 내역</h2>
        </div>
        <Link
          href="/dayoff/requests"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:bg-slate-800 hover:shadow-md active:scale-[0.98]"
        >
          + 휴가 신청
        </Link>
      </div>

      {/* 컨텐츠 */}
      <DayOffHistoryContents />
    </div>
  );
}
