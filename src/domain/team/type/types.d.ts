interface TeamUser {
  userUniqueId: string;
  isLeader: boolean;
}

interface Team {
  id: number;
  name: string;
  description?: string;
  teamUsers?: TeamUser[];
  createdDate: Date;
  createdBy: string;
  lastModifiedDate?: Date;
  lastModifiedBy?: string;
}
