import DocumentListContents from './_components/DocumentListContents';

export default async function DocumentListPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, type, status } = await searchParams;

  const params: SearchDocumentRequest = {
    page: parseInt(page || '0', 0),
    size: 10,
    type: type as DocumentsType,
    status: status as DocumentStatus,
  };

  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">결재 신청 목록</h2>
      </div>

      {/* content */}
      <div className="size-full min-w-[600px]">
        <DocumentListContents params={params} />
      </div>
    </div>
  );
}
