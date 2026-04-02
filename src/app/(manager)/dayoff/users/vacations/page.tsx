import DayOffManageContents from './_components/DayOffManageContents';

export default function DayoffManagePage() {
  return (
    <div className="flex size-full flex-col gap-3">
      <div className="w-full max-w-[1500px]">
        <DayOffManageContents />
      </div>
    </div>
  );
}
