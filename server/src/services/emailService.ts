import nodemailer, { type Transporter } from 'nodemailer';
import emailConfig from '@/dataConfigs/emailConfig';

class EmailService {
  private readonly transporter: Transporter;

  constructor () {
    this.transporter = nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.password
      }
    });
  }

  async send ({
    to,
    subject,
    text,
    html
  }: {
    to: string;
    subject: string;
    text: string;
    html: string;
  }): Promise<void> {
    await this.transporter.sendMail({
      from: emailConfig.from,
      to,
      subject,
      text,
      html
    });
  }
}

export default EmailService;