import type { ClientSession } from 'mongoose';
import type { UserSchemaType } from '@/models/users/userModel';
import type { ResetPasswordExecuteParams } from '@/types/services/auth/resetPasswordService';
import userModelValidationConfig from '@/dataConfigs/modelValidators/userModelValidationConfig';
import AppError from '@/utils/appError';
import StringRequestFieldValidatorService from '../validators/stringRequestFieldValidatorService';
import PasswordResetTokenService from './passwordResetTokenService';
import TokenService from '@/services/auth/tokenService';
import UsersService from '@/services/usersService';
import PasswordService from '@/services/auth/passwordService';
import SessionService from '@/services/auth/sessionService';
import withTransaction from '@/utils/withTansaction';

interface Dependencies {
  stringRequestFieldValidatorService: StringRequestFieldValidatorService;
  tokenService: TokenService;
  passwordResetTokenService: PasswordResetTokenService;
  usersService: UsersService;
  passwordService: PasswordService;
  sessionService: SessionService;
}

class ResetPasswordService {
  constructor (private readonly dependencies: Dependencies) {}

  private validateFields ({
    newPassword,
    newPasswordConfirm,
    token
  }: ResetPasswordExecuteParams): { validatedNewPassword: string; validatedToken: string } {
    const { password, passwordConfirm } = userModelValidationConfig;

    const { stringRequestFieldValidatorService } = this.dependencies;

    stringRequestFieldValidatorService.validate({
      field: newPassword,
      options: {
        minLength: password.minLength,
        maxLength: password.maxLength
      },
      fieldName: 'password',
      shouldThrowError: true
    });

    if (!newPasswordConfirm || typeof newPasswordConfirm !== 'string') {
      throw new AppError(400, 'Invalid password confirmation.');
    }

    if (newPassword !== newPasswordConfirm) {
      throw new AppError(400, passwordConfirm.passwordsNotSameErrorMgs);
    }

    if (!token || typeof token !== 'string') {
      throw new AppError(422, 'Reset password info is invalid. Try sending it again.');
    }

    return {
      validatedNewPassword: newPassword as string,
      validatedToken: token
    };
  }

  private async getValidatedDBData (token: string): Promise<{ user: UserSchemaType; tokenHash: string }> {
    const { tokenService, passwordResetTokenService, usersService } = this.dependencies;

    const tokenHash = tokenService.hashToken(token);
    const resetPasswordToken = await passwordResetTokenService.findValidToken(tokenHash);
    if (!resetPasswordToken) {
      throw new AppError(400, 'Invalid or expired password reset link. Please request a new one.');
    }

    const user = await usersService.getById(resetPasswordToken.user.toString());
    if (!user) {
      throw new AppError(404, 'Account not found.');
    }

    return { user, tokenHash };
  }

  private async cleanDBTokens ({
    userId,
    tokenHash,
    session
  }: {
    userId: string;
    tokenHash: string;
    session: ClientSession;
  }): Promise<void> {
    const {
      passwordResetTokenService,
      sessionService
    } = this.dependencies;

    await passwordResetTokenService.revoke(tokenHash, session);
    await sessionService.revokeForAllDevices(userId, session);
  }

  async execute (params: ResetPasswordExecuteParams): Promise<void> {
    const { validatedNewPassword, validatedToken } = this.validateFields(params);
    const { user, tokenHash } = await this.getValidatedDBData(validatedToken);

    const hashedPassword = await this.dependencies.passwordService.hashPassword(validatedNewPassword);

    await withTransaction(async (session) => {
      user.password = hashedPassword;
      await user.save({ session });

      await this.cleanDBTokens({
        userId: user._id.toString(),
        tokenHash,
        session
      });
    });
  }
}

export default ResetPasswordService;