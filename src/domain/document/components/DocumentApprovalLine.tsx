'use client';

export default function DocumentApprovalLine() {
  return (
    <div className="mt-3 flex h-[120px] flex-row items-center justify-end border border-black font-semibold">
      {/* 신청 */}
      <div className="flex h-full flex-col items-center justify-center gap-3 border-r px-2">
        <div>신</div>
        <div>청</div>
      </div>

      {/* 담당 */}
      <div className="flex h-full w-28 flex-col border-r">
        <div className="border-b py-1 text-center">담당</div>
        <div className="h-[90px]"></div>
      </div>

      {/* 부서장 */}
      <div className="flex h-full w-28 flex-col border-r">
        <div className="border-b py-1 text-center">부서장</div>
        <div className="h-[90px]"></div>
      </div>

      <div className="flex h-full flex-col items-center justify-center gap-3 border-r px-2">
        <div>승</div>
        <div>인</div>
      </div>

      {/* 대표이사 */}
      <div className="flex h-full w-28 flex-col">
        <div className="border-b py-1 text-center">대표이사</div>
        <div className="h-[90px]"></div>
      </div>
    </div>
  );
}
