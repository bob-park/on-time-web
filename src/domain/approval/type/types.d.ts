interface ApprovalLine {
  id: number;
  documentType: DocumentsType;
  children?: ApprovalLine[];
  userUniqueId: string;
  contents: string;
  status?: DocumentStatus;
  createdDate: Date;
  lastModifiedDate?: Date;
}

interface ApprovalHistory {
  id?: number;
  document: Document;
  approvalLine: ApprovalLine;
  status?: DocumentStatus;
  reason?: string;
  createdDate?: Date;
  createdBy?: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

type SearchDocumentApprovalHistoryRequest = {
  userUniqueId?: string;
  status?: DocumentStatus;
  type?: DocumentsType;
  createdDateFrom?: string;
  createdDateTo?: string;
} & SearchPageParams;
