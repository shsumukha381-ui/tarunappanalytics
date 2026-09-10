import { exchangeCodeForTokens } from './oauthPKCE';
import type { StoredTokens } from './secureStorage';

export interface OAuthCallbackResult {
  provider: 'youtube' | 'instagram';
  tokens: StoredTokens;
  profile: any;
}

export class OAuthCallbackServer {
  /**
   * Kick off the OAuth flow by redirecting the current window to Google/Meta.
   * After auth, Google will redirect back to `<origin>/oauth/callback?provider=youtube&code=...&state=...`
   * where OAuthCallbackPage.tsx picks up the params and completes the flow.
   */
  public static startOAuthFlow(
    _provider: 'youtube' | 'instagram',
    authUrl: string
  ): void {
    // Navigate the current window to the authorization URL.
    // Google will redirect back to http://localhost:5173/oauth/callback after consent.
    window.location.href = authUrl;
  }

  /**
   * Called by OAuthCallbackPage after the redirect lands back in the app.
   * Reads `code` and `state` from URL search params, exchanges for tokens.
   */
  public static async handleCallback(
    provider: 'youtube' | 'instagram',
    code: string,
    state: string
  ): Promise<OAuthCallbackResult> {
    const tokens = await exchangeCodeForTokens(provider, code, state);
    // If we have a valid access token, try to fetch the real profile information.
    // For YouTube we can request the channel details via the YouTube Data API.
    // For other providers (e.g., Instagram) we keep the simulated fallback.
    let profile: any = getSimulatedProfile(provider);
    if (tokens && tokens.accessToken && provider === 'youtube') {
      try {
        const { fetchChannelInfo } = await import('../services/youtubeAPI');
        const realProfile = await fetchChannelInfo(tokens.accessToken);
        if (realProfile) profile = realProfile;
      } catch (e) {
        console.warn('Failed to fetch real YouTube profile:', e);
      }
    } else if (tokens && tokens.accessToken && provider === 'instagram') {
      try {
        const { fetchChannelInfo } = await import('../services/instagramAPI');
        const realProfile = await fetchChannelInfo(tokens.accessToken);
        if (realProfile) profile = realProfile;
      } catch (e) {
        console.warn('Failed to fetch real Instagram profile:', e);
      }
    }

    return { provider, tokens, profile };
  }
}

const getSimulatedProfile = (provider: 'youtube' | 'instagram') => {
  if (provider === 'youtube') {
    return {
      id: 'UC_TechVisionHQ_001',
      name: 'TechVision HQ',
      handle: '@TechVisionHQ',
      avatarUrl:
        'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      subscribers: '482.5K',
      totalVideos: 142,
      platform: 'youtube',
    };
  }
  return {
    id: 'ig_TechVisionHQ_001',
    name: 'TechVision HQ Official',
    handle: '@TechVisionHQ_Ig',
    avatarUrl:
      'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=150&auto=format&fit=crop&q=80',
    subscribers: '89.3K',
    totalReels: 84,
    platform: 'instagram',
  };
};
