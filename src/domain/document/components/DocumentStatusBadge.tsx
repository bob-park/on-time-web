import cx from 'classnames';

export default function DocumentStatusBadge({ status }: { status: DocumentStatus }) {
  return (
    <div
      className={cx('badge badge-soft w-28', {
        'badge-neutral animate-pulse': status === 'WAITING',
        'badge-primary': status === 'APPROVED',
        'badge-secondary': status === 'REJECTED',
      })}
    >
      {status === 'WAITING' && <span>결재 진행중</span>}
      {status === 'APPROVED' && <span>결재 완료</span>}
      {status === 'REJECTED' && <span>결재 반려</span>}
    </div>
  );
}
