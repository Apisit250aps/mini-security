'use client';

import React from 'react';
import UserForm, { type UserFormValues } from './user-form';
import { useOverlay } from '@repo/ui/hooks';
import { toast } from '@repo/ui/components/sonner';
import { useSession } from '@/modules/auth/hooks/session-provider';

export default function UserCreateForm({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) {
  const ui = useOverlay();
  const session = useSession();

  const handleSubmit = async (data: UserFormValues) => {
    const res = await session.signUp.email({
      name: data.name,
      email: data.email,
      password: data.password!,
    });
    if (res.data) {
      toast.success('User created successfully');
      ui.hideAll();
      onSuccess?.();
      return;
    }
    if (res.error) {
      toast.error(res.error.message || 'Failed to create user');
    }
    ui.hideAll();
  };

  return <UserForm onSubmit={handleSubmit} isLoading={false} />;
}
