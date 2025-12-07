export interface VerifyEmailDTO {
  token: string;
}

export interface ResendVerificationDTO {
  email: string;
}

export interface GoogleAuthCallbackDTO {
  code: string;
}

export interface RequestPasswordResetDTO {
  email: string;
}

export interface ResetPasswordDTO {
  token: string;
  newPassword: string;
}
