import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  IOAuthProvider,
  OAuthUser,
  OAuthTokens,
} from '@/core/domain/ports/IOAuthProvider';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export class SupabaseOAuthProvider implements IOAuthProvider {
  private client: SupabaseClient;

  constructor(config: SupabaseConfig) {
    this.client = createClient(config.url, config.anonKey);
  }

  getAuthUrl(redirectUrl: string, state?: string): string {
    // Build the OAuth URL for Google
    const params = new URLSearchParams({
      provider: 'google',
      redirect_to: redirectUrl,
    });

    if (state) {
      params.set('state', state);
    }

    // Supabase OAuth URL format
    const supabaseUrl = (this.client as any).supabaseUrl;
    return `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;
  }

  async handleCallback(
    code: string
  ): Promise<{ user: OAuthUser; tokens: OAuthTokens }> {
    // Exchange code for session
    const { data, error } = await this.client.auth.exchangeCodeForSession(code);

    if (error || !data.session || !data.user) {
      throw new Error(error?.message || 'Failed to exchange code for session');
    }

    const { session, user } = data;

    return {
      user: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.full_name || user.user_metadata?.name,
        avatarUrl: user.user_metadata?.avatar_url,
        provider: 'google',
      },
      tokens: {
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
      },
    };
  }

  async verifyToken(accessToken: string): Promise<OAuthUser | null> {
    const {
      data: { user },
      error,
    } = await this.client.auth.getUser(accessToken);

    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.full_name || user.user_metadata?.name,
      avatarUrl: user.user_metadata?.avatar_url,
      provider: 'google',
    };
  }

  async refreshTokens(refreshToken: string): Promise<OAuthTokens> {
    const { data, error } = await this.client.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session) {
      throw new Error(error?.message || 'Failed to refresh tokens');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  }
}
