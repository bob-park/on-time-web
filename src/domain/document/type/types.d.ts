/*
 * document
 */
type DocumentsType = 'VACATION' | 'OVERTIME_WORK';
type DocumentStatus = 'WAITING' | 'APPROVED' | 'REJECTED';

interface Document {
  id: number;
  type: DocumentsType;
  status: DocumentStatus;
  user: User;
  approvalHistories: ApprovalHistory[];
  createdDate: Date;
  createdBy?: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}

type SearchDocumentRequest = {
  type?: DocumentsType;
  status?: DocumentStatus;
} & SearchPageParams;

/*
 * vacation
 */
type VacationType = 'GENERAL' | 'COMPENSATORY' | 'OFFICIAL';
type VacationSubType = 'AM_HALF_DAY_OFF' | 'PM_HALF_DAY_OFF';

interface VacationDocument extends Document {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: Date;
  endDate: Date;
  usedDays: number;
  reason: string;
}

interface CreateVacationDocumentRequest {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: string;
  endDate: string;
  reason: string;
  compLeaveEntryIds?: number[];
}
