import cx from 'classnames';

export default function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <span
      className={cx(
        'inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold transition-colors duration-200',
        {
          'bg-base-content/10 text-base-content/60': status === 'DRAFT' || status === 'CANCELLED',
          'bg-warning/15 text-warning': status === 'WAITING',
          'bg-primary/15 text-primary': status === 'APPROVED',
          'bg-error/15 text-error': status === 'REJECTED',
        },
      )}
    >
      {status === 'DRAFT' && <span>초안</span>}
      {status === 'WAITING' && <span>결재 진행중</span>}
      {status === 'APPROVED' && <span>결재 완료</span>}
      {status === 'REJECTED' && <span>결재 반려</span>}
      {status === 'CANCELLED' && <span>취소</span>}
    </span>
  );
}
