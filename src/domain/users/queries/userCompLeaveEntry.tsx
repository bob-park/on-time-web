import { useQuery } from '@tanstack/react-query';

import { getUserCompLeaveEntries } from '@/domain/users/apis/userCompLeaveEntry';
import { UserCompLeaveEntry } from '@/domain/users/apis/users.dto';

export function useUserCompLeaveEntries() {
  const { data, isLoading } = useQuery<UserCompLeaveEntry[]>({
    queryKey: ['user', 'comp', 'leave', 'entries'],
    queryFn: () => getUserCompLeaveEntries(),
  });

  return { compLeaveEntries: data || [], isLoading };
}
