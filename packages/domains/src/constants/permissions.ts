/**
 * @backward-compat
 * This file is a compatibility bridge. New code should import directly from:
 *   - '@repo/domains/constants' (re-exports all)
 *   - './security' (ISecurityContext, WithSecurityContext)
 *   - './permissions/index' (PermissionAction, PERMISSIONS, ALL_PERMISSIONS)
 */
export type { ISecurityContext, WithSecurityContext } from './security';
export type { PermissionAction } from './permissions/index';

