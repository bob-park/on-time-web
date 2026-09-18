interface StatCardProps {
  label: string;
  value: React.ReactNode;
  unit?: string;
  caption?: React.ReactNode;
  ring?: number; // 0–100
  children?: React.ReactNode;
}

export default function StatCard({ label, value, unit, caption, ring, children }: StatCardProps) {
  return (
    <div className="bg-base-100 border-base-300 rounded-box shadow-whisper flex items-center gap-3.5 border px-[18px] py-4">
      <div className="min-w-0 flex-1">
        <div className="text-3 text-xs font-medium">{label}</div>
        <div className="mt-0.5 text-[26px] leading-tight font-bold tracking-[-0.5px]">
          {value}
          {unit && <span className="text-2 ml-1 text-[13px] font-medium">{unit}</span>}
        </div>
        {caption && <div className="text-2 mt-1.5 flex items-center gap-1.5 text-xs">{caption}</div>}
        {children}
      </div>
      {ring !== undefined && (
        <div
          className="flex size-14 flex-none items-center justify-center rounded-full"
          style={{
            background: `conic-gradient(var(--color-primary) 0 ${ring}%, var(--border-soft) ${ring}% 100%)`,
          }}
        >
          <span className="bg-base-100 flex size-[42px] items-center justify-center rounded-full text-xs font-bold">
            {ring}%
          </span>
        </div>
      )}
    </div>
  );
}
