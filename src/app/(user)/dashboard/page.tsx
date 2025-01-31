import WorkingRecordContents from './_componets/WorkingRecordContents';
import WorkingTimeProvider from './_componets/WorkingTimeProvider';
import WorkingTimeView from './_componets/WorkingTimeView';

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
          <div className="flex w-full max-w-[860px] flex-col items-center justify-center gap-1">
            <WorkingTimeView />
            <div className="w-full">
              <WorkingRecordContents />
            </div>
          </div>
        </WorkingTimeProvider>
      </div>
    </div>
  );
}
