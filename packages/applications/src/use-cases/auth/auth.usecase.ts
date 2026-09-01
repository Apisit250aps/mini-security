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
} from '../../lib/error';

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
    };
  }
}

export class SignUpEmailUseCase implements ISignUpEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly accountRepository: IAccountRepository,
    private readonly sessionRepository: ISessionRepository,
    private readonly passwordHasher?: (password: string) => Promise<string>,
  ) {}

  async execute(context: ISignUpEmailContext): Promise<IAuthResponse> {
    const email = context.email.toLowerCase().trim();
    const existing = await this.userRepository.findByEmail(email);
    if (existing) {
      throw new ValidationError('Email already registered');
    }

    const user = await this.userRepository.create({
      name: context.name,
      email,
      isAdmin: false,
      isActive: true,
    });

    const hashedPassword = this.passwordHasher
      ? await this.passwordHasher(context.password)
      : context.password;

    await this.accountRepository.create({
      userId: user.id,
      accountId: user.id,
      providerId: 'credential',
      password: hashedPassword,
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
    const existingAccount = await this.accountRepository.findByProvider(
      context.providerId,
      context.accountId,
    );

    let user = existingAccount
      ? await this.userRepository.findById(existingAccount.userId)
      : null;

    if (!user) {
      const email = context.email.toLowerCase().trim();
      user = await this.userRepository.findByEmail(email);

      if (!user) {
        user = await this.userRepository.create({
          name: context.name,
          email,
          image: context.image,
          isAdmin: false,
          isActive: true,
        });
      }

      if (!existingAccount) {
        await this.accountRepository.create({
          userId: user.id,
          accountId: context.accountId,
          providerId: context.providerId,
        });
      }
    }

    const session = await this.sessionRepository.create({
      userId: user.id,
      token: crypto.randomUUID(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return {
      user,
      session,
    };
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

    if (new Date() > new Date(session.expiresAt)) {
      await this.sessionRepository.deleteByToken(context.token);
      return null;
    }

    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    return {
      user,
      session,
    };
  }
}

export class SignOutUseCase implements ISignOutUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(context: ISignOutContext): Promise<void> {
    const session = await this.sessionRepository.findByToken(context.token);
    if (!session) {
      throw new NotFoundError('Session not found');
    }
    await this.sessionRepository.deleteByToken(context.token);
  }
}
