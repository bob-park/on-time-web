import { ApprovalHistory, ApprovalLine } from '@/domain/approval/apis/approval.dto';
import { Document, DocumentsType } from '@/domain/document/apis/document.dto';
import { User } from '@/domain/users/apis/users.dto';
import { serverApi } from '@/shared/api/server';

function flatten(line: ApprovalLine): ApprovalLine[] {
  return [line, ...(line.children ?? []).flatMap(flatten)];
}

// 문서 소유자(또는 조회자) 의 팀 결재선 tree 를 평탄화하고, 기존 결재 이력을 결재선 순서대로 merge 한다.
export async function enrichDocument<T extends Document>(document: T, userUniqueId: string): Promise<T> {
  const user = await serverApi.get(`api/v1/users/${userUniqueId}/summary`).json<User>();

  const lines = await serverApi
    .get('api/v1/approval/lines', {
      searchParams: { teamId: user.groups[0].group.id, documentType: document.type },
    })
    .json<ApprovalLine[]>();

  const flat = lines.length > 0 ? flatten(lines[0]) : [];

  const approvalHistories = flat.map(
    (line) =>
      document.approvalHistories.find((history) => history.approvalLine.id === line.id) ??
      ({ approvalLine: line } as ApprovalHistory),
  );

  return { ...document, user, approvalHistories };
}

const DETAIL_PATH: Record<DocumentsType, string> = {
  VACATION: 'vacations',
  OVERTIME_WORK: 'overtimes',
};

// 결재 이력 + 문서 상세 + 결재선 merge (DocumentApprovalService.getById 포팅)
export async function getApprovalDetail(id: string | number): Promise<ApprovalHistory> {
  const approval = await serverApi.get(`api/v1/documents/approval/${id}`).json<ApprovalHistory>();

  const document = await serverApi
    .get(`api/v1/documents/${DETAIL_PATH[approval.document.type]}/${approval.document.id}`)
    .json<Document>();

  return { ...approval, document: await enrichDocument(document, document.userUniqueId!) };
}
