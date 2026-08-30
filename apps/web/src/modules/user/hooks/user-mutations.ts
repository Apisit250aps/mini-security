import {
  userServicesCreateUser,
  userServicesDeleteUser,
  userServicesUpdateUser,
} from '@repo/client';
import type { CreateUser, UpdateUser } from '@repo/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useUserDelete() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await userServicesDeleteUser({ path: { id: userId } });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
  });
  return mutation;
}

function useUserUpdate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateUser;
    }) => {
      const res = await userServicesUpdateUser({
        path: { id: userId },
        body: data,
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
  });
  return mutation;
}

function useUserCreate() {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async (data: CreateUser) => {
      const res = await userServicesCreateUser({ body: data });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['GET', 'USER'] });
    },
  });
  return mutation;
}

export { useUserDelete, useUserUpdate, useUserCreate };
