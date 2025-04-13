'use client';

import UserSignature from '@/domain/user/components/UserSignature';

interface DocumentApprovalLineProps {
  lines: ApprovalLine[];
}

export default function DocumentApprovalLine({ lines }: DocumentApprovalLineProps) {
  return (
    <div
      className="mt-3 flex h-[120px] flex-row items-center justify-end border font-semibold"
      style={{ borderColor: '#000' }}
    >
      {/* 신청 */}
      <div
        className="flex h-full flex-col items-center justify-center gap-3 border-r px-2"
        style={{ borderColor: '#000' }}
      >
        <div>신</div>
        <div>청</div>
      </div>

      {/* 담당 */}
      <div className="flex h-full w-28 flex-col border-r" style={{ borderColor: '#000' }}>
        <div className="border-b py-1 text-center" style={{ borderColor: '#000' }}>
          담당
        </div>
        <div className="h-[90px]">
          <UserSignature userUniqueId={lines[0].userUniqueId} />
        </div>
      </div>

      {/* 부서장 */}
      <div className="flex h-full w-28 flex-col border-r" style={{ borderColor: '#000' }}>
        <div className="border-b py-1 text-center" style={{ borderColor: '#000' }}>
          부서장
        </div>
        <div className="h-[90px]">
          {lines[1].status === 'APPROVED' && <UserSignature userUniqueId={lines[1].userUniqueId} />}
        </div>
      </div>

      <div
        className="flex h-full flex-col items-center justify-center gap-3 border-r px-2"
        style={{ borderColor: '#000' }}
      >
        <div>승</div>
        <div>인</div>
      </div>

      {/* 대표이사 */}
      <div className="flex h-full w-28 flex-col">
        <div className="border-b py-1 text-center" style={{ borderColor: '#000' }}>
          대표이사
        </div>
        <div className="h-[90px]"></div>
      </div>
    </div>
  );
}
