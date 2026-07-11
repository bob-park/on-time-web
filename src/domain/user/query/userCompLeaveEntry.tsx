import { useQuery } from '@tanstack/react-query';

import { getUserCompLeaveEntries } from '@/domain/user/api/userCompLeaveEntry';

export function useUserCompLeaveEntries() {
  const { data, isLoading } = useQuery<UserCompLeaveEntry[]>({
    queryKey: ['user', 'comp', 'leave', 'entries'],
    queryFn: () => getUserCompLeaveEntries(),
  });

  return { compLeaveEntries: data || [], isLoading };
}
