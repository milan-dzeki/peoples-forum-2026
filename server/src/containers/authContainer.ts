import AuthRouter from '@/routes/authRouter';
import AuthController from '@/controllers/authController';

// Services
import SignupService from '@/services/auth/signupService';
import UsersService from '@/services/usersService';
import ErrorsService from '@/services/errorsService';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';

// Validators
import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import FileValidatorService from '@/services/validators/fileValidatorService';
import LoginService from '@/services/auth/loginService';
import TokenService from '@/services/auth/tokenService';
import SessionService from '@/services/auth/sessionService';
import RefreshTokenService from '@/services/auth/refreshTokenSrevice';
import LogoutService from '@/services/auth/logoutService';
import EmailService from '@/services/emailService';
import PasswordResetTokenService from '@/services/auth/passwordResetTokenService';
import ForgotPasswordService from '@/services/auth/forgotPasswordService';
import ResetPasswordService from '@/services/auth/resetPasswordService';
import PasswordService from '@/services/auth/passwordService';
import UserFieldsValidatorService from '@/services/validators/userFieldsValidatorService';

const stringRequestFieldValidatorService = new StringRequestFieldValidatorService();
const fileValidatorService = new FileValidatorService();
const cloudinaryManagementService = new CloudinaryManagementService();
const passwordService = new PasswordService();
const sessionService = new SessionService();
const userFieldsValidatorService = new UserFieldsValidatorService({
  stringRequestFieldValidatorService,
  fileValidatorService,
  passwordService
});

const errorsService = new ErrorsService();
const usersService = new UsersService({
  userFieldsValidatorService,
  errorsService,
  cloudinaryManagementService,
  passwordService,
  sessionService
});
const tokenService = new TokenService();
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