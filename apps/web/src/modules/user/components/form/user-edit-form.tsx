'use client';

import React from 'react';
import type { User } from '@repo/domains/entities';
import UserForm, { UserFormValues } from './user-form';
import { useUserUpdate } from '../../hooks/user-mutations';
import { useOverlay } from '@repo/ui/hooks';

export default function UserEditForm({ user }: { user: User }) {
  const ui = useOverlay();
  const updateMutation = useUserUpdate();

  const handleSubmit = async (data: UserFormValues) => {
    const payload: Record<string, unknown> = {
      name: data.name,
      email: data.email,
      isAdmin: data.isAdmin,
      isActive: data.isActive,
    };
    if (data.password) {
      payload.password = data.password;
    }

    await updateMutation.mutateAsync({
      userId: user.id,
      data: payload,
    });
    ui.hideAll();
  };

  return (
    <UserForm
      defaultValues={{
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isActive: user.isActive,
        password: '',
      }}
      onSubmit={handleSubmit}
      isLoading={updateMutation.isPending}
    />
  );
}
