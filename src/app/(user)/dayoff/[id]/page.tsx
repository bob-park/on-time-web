import DayOffDetailContents from './_components/DayOffDetailContents';

export default async function DayOffDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;

  return (
    <div className="flex size-full flex-col items-center gap-2">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">휴가 신청 정보</h2>
      </div>

      {/* contents */}
      <div className="mt-5 w-full">
        <DayOffDetailContents id={id} />
      </div>
    </div>
  );
}
