'use client';

import cx from 'classnames';

interface ApprovalLine {
  contents: string;
  status: DocumentStatus;
  reason?: string;
}

interface ApprovalLinesProps {
  lines: ApprovalLine[];
}

function parseLineIcon(status: DocumentStatus) {
  switch (status) {
    case 'WAITING':
      return '';
    case 'APPROVED':
      return '✓';
    case 'REJECTED':
      return '✕';
    default:
      return '';
  }
}

export default function ApprovalLines({ lines }: ApprovalLinesProps) {
  return (
    <ul className="steps w-full">
      {lines.map((line, index) => (
        <li
          key={`approval-lines-item-${index}`}
          className={cx('step', {
            'step-neutral': line.status === 'APPROVED',
            'step-error': line.status === 'REJECTED',
          })}
          data-content={parseLineIcon(line.status)}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <span>{line.contents}</span>
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
