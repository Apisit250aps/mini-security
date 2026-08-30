'use client';

import React from 'react';

import UserForm, { UserFormValues } from './user-form';
import { useUserCreate } from '../../hooks/user-mutations';
import { useOverlay } from '@repo/ui/hooks';
import { useSession } from '@/modules/auth/hooks/session-provider';

export default function UserCreateForm() {
  const ui = useOverlay();
  const createMutation = useUserCreate();
  const session = useSession();
  const handleSubmit = async (data: UserFormValues) => {
    await session.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password!,
      callbackURL: window.location.origin,
    });
    ui.hideAll();
  };

  return (
    <UserForm onSubmit={handleSubmit} isLoading={createMutation.isPending} />
  );
}
