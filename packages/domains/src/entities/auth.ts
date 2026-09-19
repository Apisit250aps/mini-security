import type {
  AccountEntity,
  JwksEntity,
  SessionEntity,
  VerificationEntity,
} from '#schema/auth';

export class Session implements SessionEntity {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string | null;
  userAgent?: string | null;
  activeCompanyId?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: SessionEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.token = data.token;
    this.expiresAt = data.expiresAt;
    this.ipAddress = data.ipAddress;
    this.userAgent = data.userAgent;
    this.activeCompanyId = data.activeCompanyId;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Account implements AccountEntity {
  id: string;
  userId: string;
  accountId: string;
  providerId: string;
  issuer?: string | null;
  accessToken?: string | null;
  refreshToken?: string | null;
  idToken?: string | null;
  accessTokenExpiresAt?: Date | null;
  refreshTokenExpiresAt?: Date | null;
  scope?: string | null;
  password?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: AccountEntity) {
    this.id = data.id;
    this.userId = data.userId;
    this.accountId = data.accountId;
    this.providerId = data.providerId;
    this.issuer = data.issuer;
    this.accessToken = data.accessToken;
    this.refreshToken = data.refreshToken;
    this.idToken = data.idToken;
    this.accessTokenExpiresAt = data.accessTokenExpiresAt;
    this.refreshTokenExpiresAt = data.refreshTokenExpiresAt;
    this.scope = data.scope;
    this.password = data.password;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Verification implements VerificationEntity {
  id: string;
  identifier: string;
  value: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: VerificationEntity) {
    this.id = data.id;
    this.identifier = data.identifier;
    this.value = data.value;
    this.expiresAt = data.expiresAt;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class Jwks implements JwksEntity {
  id: string;
  publicKey: string;
  privateKey: string;
  expiresAt?: Date | null;
  alg?: string | null;
  crv?: string | null;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: JwksEntity) {
    this.id = data.id;
    this.publicKey = data.publicKey;
    this.privateKey = data.privateKey;
    this.expiresAt = data.expiresAt;
    this.alg = data.alg;
    this.crv = data.crv;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
