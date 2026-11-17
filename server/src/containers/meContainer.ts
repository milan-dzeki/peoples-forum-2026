import UsersController from '@/controllers/usersController';
import AuthMiddlewares from '@/middlewares/auth';
import MeRouter from '@/routes/meRouter';
import PasswordService from '@/services/auth/passwordService';
import SessionService from '@/services/auth/sessionService';
import TokenService from '@/services/auth/tokenService';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';
import ErrorsService from '@/services/errorsService';
import UsersService from '@/services/usersService';
import FileValidatorService from '@/services/validators/fileValidatorService';
import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
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

const usersController = new UsersController(usersService);

const authMiddlewares = new AuthMiddlewares({
  usersService,
  tokenService
});

const meRouter = new MeRouter({
  usersController,
  authMiddlewares
});

export { meRouter };