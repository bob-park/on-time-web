import cx from 'classnames';

export type BadgeVariant = 'ok' | 'wait' | 'no' | 'neutral' | 'primary';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const STYLES: Record<BadgeVariant, React.CSSProperties> = {
  ok: { background: 'var(--success-soft)', color: 'var(--success-text)' },
  wait: { background: 'var(--warning-soft)', color: 'var(--color-warning)' },
  no: { background: 'var(--error-soft)', color: 'var(--color-error)' },
  neutral: { background: 'var(--neutral-soft)', color: 'var(--text-2)' },
  primary: { background: 'var(--primary-subtle)', color: 'var(--color-primary)' },
};

export default function Badge({ variant, children, className }: BadgeProps) {
  return (
    <span
      className={cx('inline-flex items-center gap-1.5 rounded-md px-2 py-[3px] text-xs font-semibold', className)}
      style={STYLES[variant]}
    >
      {children}
    </span>
  );
}
