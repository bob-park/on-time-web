import { getUserCompLeaveEntries } from '@/domain/user/api/userCompLeaveEntry';

import { useQuery } from '@tanstack/react-query';

export function useUserCompLeaveEntries() {
  const { data, isLoading } = useQuery<UserCompLeaveEntry[]>({
    queryKey: ['user', 'comp', 'leave', 'entries'],
    queryFn: () => getUserCompLeaveEntries(),
  });

  return { compLeaveEntries: data || [], isLoading };
}
