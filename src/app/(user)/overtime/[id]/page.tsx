import OvertimeWorkDocumentContents from './_components/OvertimeWorkDocumentContents';

export default async function OvertimeWorkDocumentPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;

  return (
    <div className="flex size-full flex-col items-center gap-2">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">휴일 근무 보고서 신청 정보</h2>
      </div>

      {/* contents */}
      <div className="mt-5 max-w-[1200px]">
        <OvertimeWorkDocumentContents id={id} />
      </div>
    </div>
  );
}
