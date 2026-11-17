import AuthRouter from '@/routes/authRouter';
import AuthController from '@/controllers/authController';
import SignupService from '@/services/auth/signupService';
import LoginService from '@/services/auth/loginService';
import RefreshTokenService from '@/services/auth/refreshTokenSrevice';
import LogoutService from '@/services/auth/logoutService';
import EmailService from '@/services/emailService';
import PasswordResetTokenService from '@/services/auth/passwordResetTokenService';
import ForgotPasswordService from '@/services/auth/forgotPasswordService';
import ResetPasswordService from '@/services/auth/resetPasswordService';
import {
  stringRequestFieldValidatorService,
  cloudinaryManagementService,
  passwordService,
  sessionService,
  userFieldsValidatorService,
  errorsService,
  usersService,
  tokenService
} from '@/containers/sharedServicesContainer';

const emailService = new EmailService();

const passwordResetTokenService = new PasswordResetTokenService();
const forgotPasswordService = new ForgotPasswordService({
  usersService,
  tokenService,
  passwordResetTokenService,
  emailService
});

const signupService = new SignupService({
  usersService,
  errorsService,
  cloudinaryManagementService,
  tokenService,
  sessionService,
  passwordService,
  userFieldsValidatorService
});

const loginService = new LoginService({
  usersService,
  tokenService,
  sessionService,
  passwordService
});

const logoutService = new LogoutService({ tokenService, sessionService });

const refreshTokenService = new RefreshTokenService({ tokenService, sessionService, usersService });

const resetPasswordService = new ResetPasswordService({
  stringRequestFieldValidatorService,
  tokenService,
  passwordResetTokenService,
  usersService,
  passwordService,
  sessionService
});

const authController = new AuthController({
  signupService,
  loginService,
  logoutService,
  refreshTokenService,
  forgotPasswordService,
  resetPasswordService
});

const authRouter = new AuthRouter(authController);

export { authRouter };