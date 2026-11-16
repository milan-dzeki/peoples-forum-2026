import UsersController from '@/controllers/usersController';
import AuthMiddlewares from '@/middlewares/auth';
import UsersRouter from '@/routes/usersRouter';
import TokenService from '@/services/auth/tokenService';
import ErrorsService from '@/services/errorsService';
import UsersService from '@/services/usersService';
import FileValidatorService from '@/services/validators/fileValidatorService';
import StringRequestFieldValidatorService from '@/services/validators/stringRequestFieldValidatorService';
import UserFieldsValidatorService from '@/services/validators/userFieldsValidatorService';

const stringRequestFieldValidatorService = new StringRequestFieldValidatorService();
const fileValidatorService = new FileValidatorService();
const userFieldsValidatorService = new UserFieldsValidatorService({
  stringRequestFieldValidatorService,
  fileValidatorService
});
const errorsService = new ErrorsService();
const usersService = new UsersService({
  userFieldsValidatorService,
  errorsService
});
const tokenService = new TokenService();

const usersController = new UsersController(usersService);

const authMiddlewares = new AuthMiddlewares({
  usersService,
  tokenService
});

const usersRouter = new UsersRouter({
  usersController,
  authMiddlewares
});

export { usersRouter };