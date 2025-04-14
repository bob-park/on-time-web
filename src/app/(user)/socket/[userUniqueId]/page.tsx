import SocketContents from './_components/SocketContents';

const { WS_HOST } = process.env;

export default async function SocketPage({ params }: { params: Promise<{ userUniqueId: string }> }) {
  const { userUniqueId } = await params;

  return (
    <div className="">
      <SocketContents wsHost={WS_HOST || 'http://localhost/ws'} userUniqueId={userUniqueId} />
    </div>
  );
}
