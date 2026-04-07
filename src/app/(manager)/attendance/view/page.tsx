import AllEmployeesGrid from '@/app/(manager)/attendance/view/_components/AllEmployeesGrid';
import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

export default function AttendanceViewPage() {
  return (
    <div className="flex h-full w-full flex-col gap-2 max-w-screen-lg">
      <WorkingTimeProvider>
        <div className="flex w-full flex-none items-end justify-between">
          <div className="w-full">
            <p className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Attendance</p>
            <h2 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-900">임직원 근무 현황</h2>
          </div>
          <WorkingTimeView />
        </div>

        <div className="min-h-0 flex-1">
          <AllEmployeesGrid />
        </div>
      </WorkingTimeProvider>
    </div>
  );
}
