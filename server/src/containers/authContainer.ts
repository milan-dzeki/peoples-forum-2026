// src/container/authContainer.ts

// Controllers
import AuthController from '@/controllers/authController';

// Routers
import AuthRouter from '@/routes/authRouter';

// Services
import SignupService from '@/services/auth/signupService';
import UsersService from '@/services/usersService';
import ErrorsService from '@/services/errorsService';
import CloudinaryManagementService from '@/services/cloudinaryManagementService';

// Validators
import StringRequestFieldValidator from '@/services/validators/stringRequestFieldValidator';
import FileValidator from '@/services/validators/fileValidator';

const stringValidator = new StringRequestFieldValidator();
const fileValidator = new FileValidator();

const usersService = new UsersService();
const errorsService = new ErrorsService();
const cloudinaryService = new CloudinaryManagementService();

const signupService = new SignupService(
  stringValidator,
  fileValidator,
  usersService,
  errorsService,
  cloudinaryService
);

const authController = new AuthController(signupService);

const authRouter = new AuthRouter(authController);

export {
  authRouter,
  authController,
  signupService
};