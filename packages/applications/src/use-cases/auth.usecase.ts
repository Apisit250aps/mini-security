import type {
  IAuthResponse,
  ISignInEmailContext,
  ISignInEmailUseCase,
  ISignOutContext,
  ISignOutUseCase,
  ISignUpEmailContext,
  ISignUpEmailUseCase,
  ISocialLoginContext,
  ISocialLoginUseCase,
  IValidateSessionContext,
  IValidateSessionUseCase,
} from '@repo/domains/applications/auth';
import type {
  IAccountRepository,
  ISessionRepository,
} from '@repo/domains/repositories/auth';
import type { IUserRepository } from '@repo/domains/repositories/user';
import {
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from '../lib/error';

export class SignInEmailUseCase implements ISignInEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(context: ISignInEmailContext): Promise<IAuthResponse> {
    if (!context.email || !context.password) {
      throw new ValidationError('Email and password are required');
    }

    const user = await this.userRepository.findByEmail(context.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const accounts = await this.accountRepository.findByUserId(user.id);
    const credentialAccount = accounts.find(
      (acc) => acc.providerId === 'credential',
    );
    if (!credentialAccount) {
      throw new UnauthorizedError(
        'No password authentication set for this account',
      );
    }

    // Sessions are generated/persisted
    const session = await this.sessionRepository.create({
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      user,
      session,
      account: credentialAccount,
      token: session.token,
    };
  }
}

export class SignUpEmailUseCase implements ISignUpEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(context: ISignUpEmailContext): Promise<IAuthResponse> {
    if (!context.email || !context.password || !context.name) {
      throw new ValidationError('Name, email and password are required');
    }

    const existing = await this.userRepository.findByEmail(context.email);
    if (existing) {
      throw new ValidationError('Email is already registered');
    }

    const user = await this.userRepository.create({
      name: context.name,
      email: context.email,
      isAdmin: false,
      isActive: true,
    });

    const account = await this.accountRepository.create({
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: context.password,
    });

    const session = await this.sessionRepository.create({
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      user,
      session,
      account,
      token: session.token,
    };
  }
}

export class SocialLoginUseCase implements ISocialLoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(context: ISocialLoginContext): Promise<IAuthResponse> {
    let user = await this.userRepository.findByEmail(context.email);

    if (!user) {
      user = await this.userRepository.create({
        name: context.name,
        email: context.email,
        image: context.image,
        isAdmin: false,
        isActive: true,
      });
    }

    let account = await this.accountRepository.findByUserIdAndProvider(
      user.id,
      context.providerId,
    );

    if (!account) {
      account = await this.accountRepository.create({
        userId: user.id,
        accountId: context.accountId,
        providerId: context.providerId,
        accessToken: context.accessToken,
        refreshToken: context.refreshToken,
        idToken: context.idToken,
        scope: context.scope,
      });
    }

    const session = await this.sessionRepository.create({
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    });

    return {
      user,
      session,
      account,
      token: session.token,
    };
  }
}

export class SignOutUseCase implements ISignOutUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(context: ISignOutContext): Promise<void> {
    await this.sessionRepository.deleteByToken(context.token);
  }
}

export class ValidateSessionUseCase implements IValidateSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    context: IValidateSessionContext,
  ): Promise<IAuthResponse | null> {
    const session = await this.sessionRepository.findByToken(context.token);
    if (!session) return null;

    if (new Date() > session.expiresAt) {
      await this.sessionRepository.deleteByToken(context.token);
      return null;
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user) {
      throw new NotFoundError('User associated with session not found');
    }

    return {
      user,
      session,
      token: session.token,
    };
  }
}
