'use client';

import cx from 'classnames';

interface SegmentOption<T> {
  label: string;
  value: T;
}

interface SegmentProps<T> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export default function Segment<T>({ options, value, onChange, ariaLabel }: SegmentProps<T>) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="bg-base-100 border-base-300 inline-flex rounded-[10px] border p-[3px]"
    >
      {options.map((opt) => (
        <button
          key={opt.label}
          type="button"
          aria-pressed={value === opt.value}
          className={cx(
            'cursor-pointer rounded-lg px-3 py-1.5 text-[13px] transition-colors',
            value === opt.value
              ? 'bg-primary-subtle text-primary font-semibold'
              : 'text-2 hover:text-base-content font-medium',
          )}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
