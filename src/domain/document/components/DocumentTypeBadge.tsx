import cx from 'classnames';

export default function DocumentsTypeBadge({ type }: { type: DocumentsType }) {
  return (
    <div
      className={cx('badge w-32', {
        'badge-neutral': type === 'VACATION',
        'badge-primary': type === 'OVERTIME_WORK',
      })}
    >
      {type === 'VACATION' && <span>휴가계</span>}
      {type === 'OVERTIME_WORK' && <span>휴일 근무 보고서</span>}
    </div>
  );
}
