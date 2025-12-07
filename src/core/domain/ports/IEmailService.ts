export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface IEmailService {
  send(payload: EmailPayload): Promise<void>;
  sendVerificationEmail(
    email: string,
    token: string,
    redirectUrl: string
  ): Promise<void>;
  sendPasswordResetEmail(
    email: string,
    token: string,
    redirectUrl: string
  ): Promise<void>;
}
