export default function OvertimeDetailLoading() {
  return (
    <div className="flex size-full flex-col items-center gap-4">
      <div className="w-full max-w-[1200px]">
        <div className="bg-base-300 h-8 w-64 animate-pulse rounded-lg" />
      </div>
      <div className="flex w-full max-w-[1200px] flex-col items-center gap-4">
        <div className="bg-base-300 h-32 w-full animate-pulse rounded-lg" />
        <div className="bg-base-300 h-24 w-full animate-pulse rounded-lg" />
        <div className="bg-base-300 h-[600px] w-[1000px] animate-pulse rounded-lg" />
      </div>
    </div>
  );
}
