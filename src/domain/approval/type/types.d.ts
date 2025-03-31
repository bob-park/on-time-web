interface ApprovalLine {
  id: number;
  documentType: DocumentType;
  children?: ApprovalLine[];
  userUniqueId: string;
  contents: string;
  createdDate: Date;
  lastModifiedDate?: Date;
}

interface ApprovalHistory {
  id?: number;
  approvalLine: ApprovalLine;
  status?: DocumentStatus;
  reason?: string;
  createdDate?: Date;
  createdBy?: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}
