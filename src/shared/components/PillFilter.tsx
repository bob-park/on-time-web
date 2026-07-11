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
    ? 'bg-primary text-primary-content flex h-8 items-center rounded-full px-4 text-sm font-bold transition-[colors,transform] duration-100 cursor-pointer active:scale-95'
    : 'bg-base-300 text-base-content flex h-8 items-center rounded-full px-4 text-sm font-normal hover:bg-base-content/10 transition-[colors,transform] duration-100 cursor-pointer active:scale-95';

export default function PillFilter<T>({ label, options, value, onChange, ariaLabel }: PillFilterProps<T>) {
  return (
    <div role="group" aria-label={ariaLabel} className="flex flex-wrap items-center gap-2">
      <span className="text-base-content/60 w-[72px] flex-none text-xs font-semibold tracking-wider uppercase">
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
