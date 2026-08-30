import { userServicesGetUser, userServicesGetUsers } from '@repo/client';
import { useQuery } from '@tanstack/react-query';

function useUserListQueries() {
  const query = useQuery({
    queryKey: ['GET', 'USER'],
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
    queryKey: ['GET', 'USER', userId],
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
