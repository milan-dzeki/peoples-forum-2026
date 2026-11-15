import { Router } from 'express';
import formidable from 'express-formidable';
import AuthController from '@/controllers/authController';

class AuthRouter {
  public readonly router = Router();

  constructor(private readonly authController: AuthController) {
    this.initRoutes();
  }

  private initRoutes(): void {
    this.router.post('/signup', formidable(), this.authController.signup);
    this.router.post('/login', this.authController.login);
    this.router.get('/is-logged-in', this.authController.isLoggedIn);
    this.router.post('/refresh', this.authController.refresh);
    this.router.post('/logout', this.authController.logout);
  }
}

export default AuthRouter;