import {
  SignInEmailUseCase,
  SignOutUseCase,
  SignUpEmailUseCase,
  SocialLoginUseCase,
  ValidateSessionUseCase,
} from '@repo/applications';
import {
  accountRepository,
  sessionRepository,
  userRepository,
} from '../../repositories';

export const signInEmailUseCase = new SignInEmailUseCase(
  userRepository,
  accountRepository,
  sessionRepository,
);
export const signUpEmailUseCase = new SignUpEmailUseCase(
  userRepository,
  accountRepository,
  sessionRepository,
);
export const socialLoginUseCase = new SocialLoginUseCase(
  userRepository,
  accountRepository,
  sessionRepository,
);
export const signOutUseCase = new SignOutUseCase(sessionRepository);
export const validateSessionUseCase = new ValidateSessionUseCase(
  sessionRepository,
  userRepository,
);
