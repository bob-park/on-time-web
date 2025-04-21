/*
 * document
 */
type DocumentsType = 'VACATION' | 'OVERTIME_WORK';
type DocumentStatus = 'DRAFT' | 'WAITING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

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

interface RejectDocumentRequest {
  reason: string;
}

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
  usedCompLeaveEntries?: UsedCompLeaveEntry[];
}

interface CreateVacationDocumentRequest {
  vacationType: VacationType;
  vacationSubType?: VacationSubType;
  startDate: string;
  endDate: string;
  reason: string;
  compLeaveEntries?: UsedCompLeaveEntryRequest[];
}

interface UsedCompLeaveEntryRequest {
  compLeaveEntryId: number;
  usedDays: number;
}

interface UsedCompLeaveEntry {
  id: number;
  compLeaveEntry: UserCompLeaveEntry;
  usedDays: number;
}

type SearchVacationDocumentRequest = {
  status?: DocumentStatus;
  vacationType?: VacationType;
  startDateFrom?: string;
  endDateTo?: string;
} & SearchPageParams;
