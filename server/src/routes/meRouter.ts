import { Router } from 'express';
import formidable from 'express-formidable';
import UsersController from '@/controllers/usersController';
import AuthMiddlewares from '@/middlewares/auth';

interface Dependencies {
  usersController: UsersController;
  authMiddlewares: AuthMiddlewares;
}

class MeRouter {
  public readonly router = Router();

  constructor(private readonly dependencies: Dependencies) {
    this.initRoutes();
  }

  private initRoutes(): void {
    const { authMiddlewares, usersController } = this.dependencies;

    this.router.use(authMiddlewares.isAuth);

    this.router.patch('/names', usersController.updateNames);
    this.router.post('/profile-image', formidable(), usersController.updateProfileImage);
    this.router.patch('/profile-image', usersController.removeProfileImage);
    this.router.patch('/password', usersController.changePassword)
  }
}

export default MeRouter;