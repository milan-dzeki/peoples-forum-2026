const requiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
};

const emailConfig = {
  host: requiredEnv('SMTP_HOST'),
  port: Number(requiredEnv('SMTP_PORT')),
  secure: process.env.SMTP_SECURE === 'true',
  user: requiredEnv('SMTP_USER'),
  password: requiredEnv('SMTP_PASSWORD'),
  from: requiredEnv('EMAIL_FROM')
};

export default emailConfig;