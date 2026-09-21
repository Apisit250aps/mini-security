'use client';

import React, { useMemo } from 'react';
import organizationMemberListColumns from './organization-member-data-columns';
import { DataTable } from '@repo/ui/components/shared/table/data-table';
import {
  useSitesQueries,
  useOrganizationMembersQueries,
} from '../../hooks/organization-queries';
import { useUserListQueries } from '@/modules/user/hooks/user-queries';
import { useGetOrganizationRoles } from '@/modules/role/hooks/role-queries';
import type { User } from '@repo/client';

export default function OrganizationMemberDataTable({
  organizationId,
}: {
  organizationId?: string;
}) {
  const orgId = organizationId || '';
  const membersQuery = useOrganizationMembersQueries(orgId);
  const sitesQuery = useSitesQueries(orgId);
  const usersQuery = useUserListQueries();
  const rolesQuery = useGetOrganizationRoles(orgId);

  const usersMap = useMemo(() => {
    const map = new Map<string, User>();
    for (const u of usersQuery.data || []) {
      map.set(u.id, u);
    }
    return map;
  }, [usersQuery.data]);

  const roles = useMemo(() => rolesQuery.data || [], [rolesQuery.data]);
  const sites = useMemo(() => sitesQuery.data || [], [sitesQuery.data]);

  const columns = useMemo(() => {
    return organizationMemberListColumns({
      organizationId: orgId,
      usersMap,
      roles,
      sites,
    });
  }, [orgId, usersMap, roles, sites]);

  const isLoading =
    membersQuery.isLoading ||
    sitesQuery.isLoading ||
    usersQuery.isLoading ||
    rolesQuery.isLoading;

  const table = useMemo(() => {
    const data = membersQuery.isLoading ? [] : membersQuery.data || [];
    return { data, columns, isLoading };
  }, [columns, membersQuery.data, membersQuery.isLoading, isLoading]);

  return <DataTable {...table} />;
}
