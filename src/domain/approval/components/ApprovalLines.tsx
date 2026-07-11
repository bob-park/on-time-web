'use client';

import { Fragment } from 'react';

import cx from 'classnames';
import { useTranslations } from 'next-intl';

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

function ApprovalLineCircle({ status }: { status: DocumentStatus | 'NOT_YET' }) {
  switch (status) {
    case 'APPROVED':
      return (
        <span className="bg-primary text-primary-content flex size-11 items-center justify-center rounded-full text-base font-bold">
          ✓
        </span>
      );
    case 'WAITING':
      return (
        <span className="border-warning text-warning flex size-11 items-center justify-center rounded-full border-[3px]">
          <span className="loading loading-ring loading-sm text-warning" />
        </span>
      );
    case 'REJECTED':
      return (
        <span className="bg-error text-error-content flex size-11 items-center justify-center rounded-full text-base font-bold">
          ✕
        </span>
      );
    default:
      return <span className="flex size-11 items-center justify-center rounded-full border-2 border-white/15" />;
  }
}

export default function ApprovalLines({ lines, currentId }: ApprovalLinesProps) {
  const t = useTranslations('approval.detail');

  return (
    <div className="flex w-full items-start justify-between">
      {lines.map((line, index) => (
        <Fragment key={`approval-lines-item-${index}`}>
          {index > 0 && (
            <div
              className={cx('mt-[21px] h-0.5 flex-1 rounded-full', {
                'bg-primary': lines[index - 1].status === 'APPROVED',
                'bg-white/10': lines[index - 1].status !== 'APPROVED',
              })}
            />
          )}
          <div className="flex w-28 flex-none flex-col items-center gap-2 text-center">
            <ApprovalLineCircle status={line.status} />
            <div className="flex flex-col items-center gap-1">
              <p
                className={cx('text-sm', {
                  'font-semibold': line.status !== 'NOT_YET',
                  'text-warning': line.status === 'WAITING',
                  'text-base-content/50': line.status === 'NOT_YET',
                })}
              >
                {line.contents}
              </p>
              {currentId && currentId === line.id && (
                <span className="bg-warning/15 text-warning rounded-full px-2 py-0.5 text-xs font-semibold">
                  {t('stepCurrent')}
                </span>
              )}
              {line.status === 'REJECTED' && <span className="text-error text-xs">{line.reason}</span>}
            </div>
          </div>
        </Fragment>
      ))}
    </div>
  );
}
