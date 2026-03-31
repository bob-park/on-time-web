import AllEmployeesGrid from '@/app/(manager)/attendance/view/_components/AllEmployeesGrid';
import WorkingTimeProvider from '@/domain/attendance/components/WorkingTimeProvider';
import WorkingTimeView from '@/domain/attendance/components/WorkingTimeView';

export default function AttendanceViewPage() {
  return (
    <div className="flex size-full flex-col items-start justify-start gap-2 max-w-screen-lg">
      <WorkingTimeProvider>
        <div className="flex w-full items-end justify-between">
          <h2 className="mt-1 w-full text-2xl font-bold text-gray-900">임직원 근무 현황</h2>
          <WorkingTimeView />
        </div>

        <AllEmployeesGrid />
      </WorkingTimeProvider>
    </div>
  );
}
