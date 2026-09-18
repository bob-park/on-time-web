import OvertimeWorkDocumentContents from './_components/OvertimeWorkDocumentContents';

export default async function OvertimeWorkDocumentPage({ params }: { params: Promise<{ id: number }> }) {
  const id = (await params).id;

  return (
    <div className="animate-fade-up w-full">
      <OvertimeWorkDocumentContents id={id} />
    </div>
  );
}
