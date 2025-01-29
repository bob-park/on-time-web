import WorkingTimeProvider from '@/app/(user)/dashboard/_componets/WorkingTimeProvider';
import WorkingTimeView from '@/app/(user)/dashboard/_componets/WorkingTimeView';

export default function DashboardPage() {
  return (
    <div className="flex size-full flex-col items-center justify-start gap-3">
      {/* title */}
      <div className="w-full">
        <h2 className="text-2xl font-bold">대시 보드</h2>
      </div>

      {/* contents */}
      <div className="mt-10 w-full">
        <WorkingTimeProvider>
          <WorkingTimeView />
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
