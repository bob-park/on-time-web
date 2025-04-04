import DocumentApprovalContents from './_components/DocumentApprovalContents';

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { page, type, status, createdDateFrom, createdDateTo } = await searchParams;

  const params: SearchDocumentApprovalHistoryRequest = {
    page: parseInt(page || '0', 0),
    size: 10,
    type: type as DocumentsType,
    status: status as DocumentStatus,
    createdDateFrom: createdDateFrom,
    createdDateTo: createdDateTo,
  };

  return (
    <div className="flex size-full flex-col gap-3">
      {/* title */}
      <div className="">
        <h2 className="text-2xl font-bold">결재 처리 대기 목록</h2>
      </div>

      {/* content */}
      <div className="size-full min-w-[600px]">
        <DocumentApprovalContents params={params} />
      </div>
    </div>
  );
}
