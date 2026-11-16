import passwordResetTemplate from '@/templates/passwordResetTemplate';
import UsersService from '@/services/usersService';
import TokenService from '@/services/auth/tokenService';
import PasswordResetTokenService from '@/services/auth/passwordResetTokenService';
import EmailService from '@/services/emailService';
import { isEmail } from 'validator';
import AppError from '@/utils/appError';
import withTransaction from '@/utils/withTansaction';

interface Dependencies {
  usersService: UsersService;
  tokenService: TokenService;
  passwordResetTokenService: PasswordResetTokenService;
  emailService: EmailService;
}

class ForgotPasswordService {
  private readonly expirationMinutes = 30;

  constructor(
    private readonly dependencies: Dependencies
  ) {}

  async execute(email: unknown): Promise<void> {
    const {
      usersService,
      tokenService,
      passwordResetTokenService,
      emailService
    } = this.dependencies;

    if (!email || typeof email !== 'string' || !isEmail(email)) {
      throw new AppError(422, 'Valid email format must be provided.');
    }

    const user = await usersService.getByEmail(email.toLowerCase());

    if (!user) {
      return;
    }

    const existingPasswordResetToken = await passwordResetTokenService.get(user._id.toString());

    if (
      existingPasswordResetToken &&
      Date.now() - existingPasswordResetToken.createdAt.getTime() < 60 * 1000
    ) {
      throw new AppError(403, 'Less than a minute seem to have passed before you requested password reset. Try again after minute expires');
    }

    const token = tokenService.generateRandomToken();
    const tokenHash = tokenService.hashToken(token);

    const expiresAt = new Date(
      Date.now() + this.expirationMinutes * 60 * 1000
    );

    await withTransaction(async (session) => {
      await passwordResetTokenService.revokeAllForUser(
        user._id.toString(),
        session
      );

      await passwordResetTokenService.create({
        user: user._id.toString(),
        tokenHash,
        expiresAt
      }, session);
    });

    const resetUrl =
      `${process.env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

    const emailContent = passwordResetTemplate({
      resetUrl,
      expirationMinutes: this.expirationMinutes
    });

    try {
      await emailService.send({
        to: user.email,
        ...emailContent
      });
    } catch (error) {
      await passwordResetTokenService.revoke(tokenHash);
      throw error;
    }
  }
}

export default ForgotPasswordService;