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
      <div>
        <h2 className="text-2xl font-bold">내 결재 문서</h2>
        <p className="mt-1 text-[14px] text-slate-500">결재 신청 내역을 조회하고 상태를 확인합니다</p>
      </div>

      {/* content */}
      <div className="size-full min-w-[600px]">
        <DocumentListContents params={params} />
      </div>
    </div>
  );
}
