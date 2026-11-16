import { Router } from 'express';
import formidable from 'express-formidable';
import UsersController from '@/controllers/usersController';
import AuthMiddlewares from '@/middlewares/auth';

interface Dependencies {
  usersController: UsersController;
  authMiddlewares: AuthMiddlewares
}

class UsersRouter {
  public readonly router = Router();

  constructor(private readonly dependencies: Dependencies) {
    this.initRoutes();
  }

  private initRoutes(): void {
    const { authMiddlewares, usersController } = this.dependencies;

    this.router.use(authMiddlewares.isAuth);

    this.router.patch('/me/names', usersController.updateNames);
    this.router.patch('/me/profile-image', formidable(), usersController.updateProfileImage);
  }
}

export default UsersRouter;