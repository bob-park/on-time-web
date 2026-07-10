import cx from 'classnames';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  caption?: string;
  highlight?: boolean;
  children?: React.ReactNode;
}

export default function StatCard({ label, value, unit, caption, highlight, children }: StatCardProps) {
  return (
    <div className={cx('bg-base-300 rounded-lg p-5', highlight && 'ring-primary ring-1 ring-inset')}>
      <div className="text-base-content/60 text-xs font-semibold tracking-widest uppercase">{label}</div>
      <div className={cx('mt-2 text-[32px] font-bold tracking-tight', highlight && 'text-primary')}>
        {value}
        {unit && <span className="text-base-content/60 ml-1 text-sm font-normal">{unit}</span>}
      </div>
      {caption && <div className="text-base-content/60 mt-1.5 text-xs">{caption}</div>}
      {children}
    </div>
  );
}
