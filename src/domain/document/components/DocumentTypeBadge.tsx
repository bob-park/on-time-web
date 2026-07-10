import cx from 'classnames';

export default function DocumentsTypeBadge({ type }: { type: DocumentsType }) {
  return (
    <span
      className={cx('inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-semibold', {
        'bg-info/15 text-info': type === 'VACATION',
        'bg-warning/15 text-warning': type === 'OVERTIME_WORK',
      })}
    >
      {type === 'VACATION' && <span>휴가계</span>}
      {type === 'OVERTIME_WORK' && <span>휴일 근무 보고서</span>}
    </span>
  );
}
