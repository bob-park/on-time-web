import DocumentApprovalContents from './_components/DocumentApprovalContents';

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, type, status } = await searchParams;

  const params: SearchDocumentApprovalHistoryRequest = {
    page: parseInt(page || '0', 0),
    size: 10,
    type: type as DocumentsType,
    status: status as DocumentStatus,
  };

  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div>
        <h2 className="text-2xl font-bold">결재 처리</h2>
        <p className="mt-1 text-[14px] text-slate-500">결재 요청 목록을 조회하고 처리합니다</p>
      </div>

      {/* content */}
      <div className="size-full min-w-[600px]">
        <DocumentApprovalContents params={params} />
      </div>
    </div>
  );
}
