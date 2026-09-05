'use client';

import type { FieldValues } from 'react-hook-form';
import {
  QuerySelectField,
  type QuerySelectFieldProps,
} from '@/shared/components/form/query-select-field';
import { useCompanyMembersQueries } from '../../hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';

export function CompanyMemberSelectField<T extends FieldValues>({
  companyId,
  ...props
}: QuerySelectFieldProps<T> & { companyId: string }) {
  const members = useCompanyMembersQueries(companyId);
  const users = useUserListQueries();
  const usersById = new Map((users.data ?? []).map((user) => [user.id, user]));
  const options = (members.data ?? []).map((member) => {
    const user = usersById.get(member.userId);
    return {
      value: member.id,
      label: user ? `${user.name} (${user.email})` : `พนักงาน ID: ${member.id}`,
    };
  });
  return (
    <QuerySelectField
      {...props}
      options={options}
      query={{
        isLoading: members.isLoading || users.isLoading,
        isError: members.isError || users.isError,
      }}
    />
  );
}
