import AttendanceRecordGpsContents from './_components/AttendanceRecordGpsContents';

export default function AttendanceRecordGpsPage() {
  return (
    <div className="flex size-full flex-col items-center justify-start gap-3">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">근태 처리 (GPS)</h2>
      </div>

      {/* contents */}
      <div className="mt-10 size-full">
        <AttendanceRecordGpsContents />
      </div>
    </div>
  );
}
