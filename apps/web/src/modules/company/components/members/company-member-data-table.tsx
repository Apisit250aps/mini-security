'use client';

import React, { useMemo } from 'react';
import companyMemberListColumns from './company-member-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanyMembersQueries } from '../../hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useCompanyRolesQueries } from '@/modules/role/hooks/role-queries';
import type { User } from '@repo/domains/entities';

export default function CompanyMemberDataTable({
  companyId,
}: {
  companyId: string;
}) {
  const membersQuery = useCompanyMembersQueries(companyId);
  const usersQuery = useUserListQueries();
  const rolesQuery = useCompanyRolesQueries(companyId);

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of usersQuery.data || []) {
      map.set(u.id, u);
    }
    return map;
  }, [usersQuery.data]);

  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);

  const columns = useMemo(() => {
    return companyMemberListColumns({
      companyId,
      usersMap,
      roles,
    });
  }, [companyId, usersMap, roles]);

  const table = useMemo(() => {
    const data = membersQuery.isLoading ? [] : membersQuery.data || [];
    return { data, columns, isLoading: membersQuery.isLoading };
  }, [columns, membersQuery.data, membersQuery.isLoading]);

  return <DataTable {...table} />;
}
