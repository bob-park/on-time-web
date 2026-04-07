'use client';

interface PillFilterOption<T> {
  label: string;
  value: T;
}

interface PillFilterProps<T> {
  label: string;
  options: PillFilterOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

const pillClass = (active: boolean) =>
  active
    ? 'bg-slate-800 text-white rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-100 cursor-pointer'
    : 'bg-slate-100 text-slate-600 rounded-full px-3.5 py-1.5 text-sm font-medium hover:bg-slate-200 transition-colors duration-100 cursor-pointer';

export default function PillFilter<T>({ label, options, value, onChange, ariaLabel }: PillFilterProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap items-center gap-2">
      <span className="w-[72px] flex-none text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </span>
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          aria-pressed={value === opt.value}
          className={pillClass(value === opt.value)}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
