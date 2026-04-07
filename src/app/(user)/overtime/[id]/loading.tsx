export default function OvertimeDetailLoading() {
  return (
    <div className="flex size-full flex-col items-center gap-2">
      <div className="w-full">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
      </div>
      <div className="mt-5 flex w-full max-w-[1200px] flex-col items-center gap-4">
        <div className="h-32 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-48 w-full animate-pulse rounded-2xl bg-slate-200" />
        <div className="h-[600px] w-[1000px] animate-pulse rounded-2xl bg-slate-200" />
      </div>
    </div>
  );
}
