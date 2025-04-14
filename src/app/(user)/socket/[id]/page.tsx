import SocketContents from './_components/SocketContents';

export default async function SocketPage({ params }: { params: Promise<{ id: number }> }) {
  const { id } = await params;

  return (
    <div className="">
      <SocketContents id={id} />
    </div>
  );
}
