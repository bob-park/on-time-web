export default function OvertimeDetailLoading() {
  return (
    <div className="w-full">
      <div className="bg-base-300 my-2 mb-5 h-12 w-64 animate-pulse rounded-lg" />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_360px] xl:items-start">
        <div className="overflow-x-auto">
          <div className="bg-base-300 aspect-[1/1.414] w-[1000px] animate-pulse rounded-lg" />
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-base-300 h-52 w-full animate-pulse rounded-lg" />
          <div className="bg-base-300 h-28 w-full animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
