'use client';

import React, { useMemo } from 'react';
import companyMemberListColumns from './company-member-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import { useCompanyMembersQueries } from '../../hooks/company-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useRoleListQueries } from '@/modules/role/hooks/role-queries';
import type { Role, User } from '@repo/domains/entities';

export default function CompanyMemberDataTable({
  companyId,
}: {
  companyId: string;
}) {
  const membersQuery = useCompanyMembersQueries(companyId);
  const usersQuery = useUserListQueries();
  const rolesQuery = useRoleListQueries();

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of usersQuery.data || []) {
      map.set(u.id, u);
    }
    return map;
  }, [usersQuery.data]);

  const rolesMap = useMemo(() => {
    const map = new Map<string, Role>();
    for (const r of rolesQuery.data || []) {
      map.set(r.id, r);
    }
    return map;
  }, [rolesQuery.data]);

  const columns = useMemo(() => {
    return companyMemberListColumns({
      companyId,
      usersMap,
      rolesMap,
    });
  }, [companyId, usersMap, rolesMap]);

  const table = useMemo(() => {
    const data = membersQuery.isLoading ? [] : membersQuery.data || [];
    return { data, columns, isLoading: membersQuery.isLoading };
  }, [columns, membersQuery.data, membersQuery.isLoading]);

  return <DataTable {...table} />;
}
