'use client';

import cx from 'classnames';

interface ApprovalLine {
  id: number;
  contents: string;
  status: DocumentStatus | 'NOT_YET';
  reason?: string;
}

interface ApprovalLinesProps {
  lines: ApprovalLine[];
  currentId?: number;
}

function ApprovalLineIcon({ status }: { status: DocumentStatus | 'NOT_YET' }) {
  switch (status) {
    case 'WAITING':
      return <span className="loading loading-ring loading-md"></span>;
    case 'APPROVED':
      return '✓';
    case 'REJECTED':
      return '✕';
    default:
      return '';
  }
}

export default function ApprovalLines({ lines, currentId }: ApprovalLinesProps) {
  return (
    <ul className="steps w-full">
      {lines.map((line, index) => (
        <li
          key={`approval-lines-item-${index}`}
          className={cx('step', {
            'step-primary': line.status === 'APPROVED',
            'step-error': line.status === 'REJECTED',
          })}
        >
          <span className="step-icon">
            <ApprovalLineIcon status={line.status} />
          </span>
          <div className="flex flex-col items-center justify-center gap-2">
            <p className="">{line.contents}</p>
            {currentId && currentId === line.id && <div className="badge badge-soft badge-secondary w-20">현재</div>}
            {line.status === 'REJECTED' && (
              <div className="">
                <span className="text-red-400">{line.reason}</span>
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
