import { userServicesGetUser, userServicesGetUsers } from '@repo/client';
import { useQuery } from '@tanstack/react-query';
import { userKeys } from '@/shared/utils';

function useUserListQueries() {
  const query = useQuery({
    queryKey: userKeys.lists(),
    queryFn: async ({ signal }) => {
      const response = await userServicesGetUsers({ signal });
      if (response.data) return response.data.data;
      throw new Error('No data returned from userServicesGetUsers');
    },
  });
  return query;
}

function useUserDetailQueries(userId: string) {
  const query = useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: async ({ signal }) => {
      const response = await userServicesGetUser({
        signal,
        path: { id: userId },
      });
      if (response.data) return response.data.data;
      throw new Error('No data returned from userServicesGetUser');
    },
  });
  return query;
}

export { useUserListQueries, useUserDetailQueries };
