import AttendanceRecordContents from './_components/AttendanceRecordContents';

export default async function AttendanceRecordPage({ params }: { params: Promise<{ checkId: string }> }) {
  const checkId = (await params).checkId;

  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">근태 처리</h2>
      </div>

      {/* content */}
      <div className="">
        <AttendanceRecordContents checkId={checkId} />
      </div>
    </div>
  );
}
