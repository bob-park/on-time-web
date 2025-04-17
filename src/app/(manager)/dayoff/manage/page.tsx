import MonthPicker, { MonthPickerProvider } from '@/shared/components/date/MonthPicker';

export default function DayoffManagePage() {
  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">임직원 휴가 관리</h2>
      </div>

      {/* contents */}
      <div className="flex w-full min-w-[600px] flex-col items-center justify-center gap-3">
        <MonthPickerProvider>
          <div className="mt-5 w-full">
            <MonthPicker />
          </div>
        </MonthPickerProvider>
      </div>
    </div>
  );
}
