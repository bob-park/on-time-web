import { useQuery } from '@tanstack/react-query';

export function useGetCurrentUser() {
  const { data, isLoading } = useQuery<User>({
    queryKey: ['user', 'me'],
  });

  return { currentUser: data, isLoading };
}
