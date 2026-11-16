interface PasswordResetTemplateParams {
  resetUrl: string;
  expirationMinutes: number;
}

const passwordResetTemplate = ({
  resetUrl,
  expirationMinutes
}: PasswordResetTemplateParams) => ({
  subject: 'Password reset request',

  text: `
    You requested a password reset.

    Visit the following link to reset your password:

    ${resetUrl}

    This link expires in ${expirationMinutes} minutes.

    If you did not request this, you can ignore this email.
  `,

  html: `
    <div>
      <h2>Password reset</h2>

      <p>
        You requested a password reset.
      </p>

      <p>
        Click the link below to choose a new password:
      </p>

      <a href="${resetUrl}">Reset password</a>

      <p>
        This link expires in ${expirationMinutes} minutes.
      </p>

      <p>
        If you did not request this, you can ignore this email.
      </p>
    </div>
  `
});

export default passwordResetTemplate;