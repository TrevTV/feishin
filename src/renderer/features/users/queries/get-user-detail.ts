import { useQuery } from '@tanstack/react-query';
import { api } from '@/renderer/api';
import { queryKeys } from '@/renderer/api/query-keys';
import { UserDetailResponse } from '@/renderer/api/users.api';
import { QueryOptions } from '@/renderer/lib/react-query';

export const useUserDetail = (
  q: { userId: string },
  options?: QueryOptions<UserDetailResponse>
) => {
  const query = useQuery({
    queryFn: () => api.users.getUserDetail({ userId: q.userId }),
    queryKey: queryKeys.users.detail(q.userId),
    ...options,
  });

  return query;
};
