import DayOffDetailContents from './_components/DayOffDetailContents';

export default async function DayOffDetailPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;

  return (
    <div className="animate-fade-up w-full">
      <DayOffDetailContents id={id} />
    </div>
  );
}
