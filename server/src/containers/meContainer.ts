import UsersController from '@/controllers/usersController';
import AuthMiddlewares from '@/middlewares/auth';
import MeRouter from '@/routes/meRouter';
import {
  usersService,
  tokenService
} from '@/containers/sharedServicesContainer';

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