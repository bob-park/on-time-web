interface Team {
  id: number;
  name: string;
  description?: string;
  users?: User[];
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
  isLeader?: boolean;
  teamUserDescription?: boolean;
}
