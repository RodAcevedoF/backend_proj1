export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  provider: 'google';
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface IOAuthProvider {
  getAuthUrl(redirectUrl: string, state?: string): string;
  handleCallback(code: string): Promise<{ user: OAuthUser; tokens: OAuthTokens }>;
  verifyToken(accessToken: string): Promise<OAuthUser | null>;
  refreshTokens(refreshToken: string): Promise<OAuthTokens>;
}
