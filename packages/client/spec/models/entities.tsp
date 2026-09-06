namespace Domain.Entity;

  model BaseEntity {
    id: string;
    createdAt: utcDateTime;
    updatedAt: utcDateTime;
  }

  enum RoleType {
    SUPER_ADMIN: "SUPER_ADMIN",
    OWNER: "OWNER",
    ADMIN: "ADMIN",
    MEMBER: "MEMBER",
    VIEWER: "VIEWER",
  }

  model Session {
    ...BaseEntity;

    userId: string;
    token: string;
    expiresAt: utcDateTime;
    ipAddress?: string | null;
    userAgent?: string | null;
    activeCompanyId?: string | null;
    permissions?: string | null;
  }

  model Account {
    ...BaseEntity;

    userId: string;
    accountId: string;
    providerId: string;
    issuer?: string | null;
    accessToken?: string | null;
    refreshToken?: string | null;
    idToken?: string | null;
    accessTokenExpiresAt?: utcDateTime | null;
    refreshTokenExpiresAt?: utcDateTime | null;
    scope?: string | null;
    password?: string | null;
  }

  model Verification {
    ...BaseEntity;

    identifier: string;
    value: string;
    expiresAt: utcDateTime;
  }

  model Jwks {
    ...BaseEntity;

    publicKey: string;
    privateKey: string;
    expiresAt?: utcDateTime | null;
    alg?: string | null;
    crv?: string | null;
  }

  model Company {
    ...BaseEntity;

    name: string;
    slug: string;
    logo?: string | null;
    isActive: boolean;
  }

  model CompanyBranch {
    ...BaseEntity;

    companyId: string;
    name: string;
    address?: string | null;
    isActive: boolean;
  }

  model CompanyMember {
    ...BaseEntity;

    companyBranchId: string;
    companyId: string;
    userId: string;
    roleId: string;
    isActive: boolean;
  }

  model Feature {
    ...BaseEntity;

    code: string;
    name: string;
    description?: string | null;
    category: string;
    isActive: boolean;
  }

  model CompanyFeature {
    ...BaseEntity;

    companyId: string;
    featureId: string;
    isEnabled: boolean;
    assignedBy?: string | null;
    expiresAt?: utcDateTime | null;
  }

  model RoleFeature {
    ...BaseEntity;

    companyId: string;
    roleId: string;
    featureId: string;
    isEnabled: boolean;
  }

  model Role {
    ...BaseEntity;

    companyId?: string | null;
    name: string;
    description?: string | null;
    roleType: RoleType;
    isSystemDefault: boolean;
  }

  model Permission {
    ...BaseEntity;

    featureId?: string | null;
    action: string;
    module: string;
    description?: string | null;
  }

  model RolePermission {
    ...BaseEntity;

    roleId: string;
    permissionId: string;
  }

  model User {
    ...BaseEntity;

    name: string;
    email: string;
    emailVerified: boolean;
    image?: string | null;
    isAdmin: boolean;
    isActive: boolean;
    lastLogin?: utcDateTime | null;
  }
