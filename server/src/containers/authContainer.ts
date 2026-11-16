import AuthRouter from '@/routes/authRouter';
import AuthController from '@/controllers/authController';

// Services
import SignupService from '@/services/auth/signupService';
import UsersService from '@/services/usersService';
import ErrorsService from '@/services/errorsService';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';

// Validators
import StringRequestFieldValidator from '@/services/validators/stringRequestFieldValidator';
import FileValidator from '@/services/validators/fileValidator';
import LoginService from '@/services/auth/loginService';
import TokenService from '@/services/auth/tokenService';
import SessionService from '@/services/auth/sessionService';
import RefreshTokenService from '@/services/auth/refreshTokenSrevice';
import LogoutService from '@/services/auth/logoutService';
import EmailService from '@/services/emailService';
import PasswordResetTokenService from '@/services/auth/passwordResetTokenService';
import ForgotPasswordService from '@/services/auth/forgotPasswordService';

const stringValidator = new StringRequestFieldValidator();
const fileValidator = new FileValidator();

const usersService = new UsersService();
const errorsService = new ErrorsService();
const cloudinaryManagementService = new CloudinaryManagementService();
const tokenService = new TokenService();
const sessionService = new SessionService();
const emailService = new EmailService();
const passwordResetTokenService = new PasswordResetTokenService();
const forgotPasswordService = new ForgotPasswordService({
  usersService,
  tokenService,
  passwordResetTokenService,
  emailService
});

const signupService = new SignupService({
  stringValidator,
  fileValidator,
  usersService,
  errorsService,
  cloudinaryManagementService,
  tokenService,
  sessionService
});

const loginService = new LoginService({ usersService, tokenService, sessionService });

const logoutService = new LogoutService({ tokenService, sessionService });

const refreshTokenService = new RefreshTokenService({ tokenService, sessionService, usersService });

const authController = new AuthController({ signupService, loginService, logoutService, refreshTokenService, forgotPasswordService });

const authRouter = new AuthRouter(authController);

export {
  authRouter,
  authController,
  signupService
};