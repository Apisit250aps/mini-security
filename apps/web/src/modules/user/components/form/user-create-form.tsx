'use client';

import React from 'react';
import UserForm, { UserFormValues } from './user-form';
import { useUserCreate } from '../../hooks/user-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function UserCreateForm() {
  const ui = useOverlay();
  const createMutation = useUserCreate();

  const handleSubmit = async (data: UserFormValues) => {
    await createMutation.mutateAsync({
      name: data.name,
      email: data.email,
      password: data.password || undefined,
      isAdmin: data.isAdmin ?? false,
      isActive: data.isActive ?? true,
    });
    ui.hideAll();
  };

  return (
    <UserForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
  );
}
