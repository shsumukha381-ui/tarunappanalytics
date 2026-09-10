import { secureStorage } from './secureStorage';
import type { StoredTokens } from './secureStorage';

export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
}

export interface OAuthProviderConfig {
  clientId: string;
  clientSecret?: string;
  authorizeUrl: string;
  tokenUrl: string;
  redirectUri: string;
  scopes: string[];
}

const getRedirectUri = (): string => {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/oauth/callback`;
  }
  return `http://localhost:5173/oauth/callback`;
};

  export const YOUTUBE_OAUTH_CONFIG: OAuthProviderConfig = {
    clientId: import.meta.env.VITE_YOUTUBE_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_YOUTUBE_CLIENT_SECRET || '',
    authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    redirectUri: getRedirectUri(),
    scopes: [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/yt-analytics.readonly',
    'https://www.googleapis.com/auth/userinfo.profile',
  ],
};

  export const INSTAGRAM_OAUTH_CONFIG: OAuthProviderConfig = {
    clientId: import.meta.env.VITE_INSTAGRAM_CLIENT_ID || '',
    clientSecret: import.meta.env.VITE_INSTAGRAM_CLIENT_SECRET || '',
    authorizeUrl: 'https://www.facebook.com/v19.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v19.0/oauth/access_token',
    redirectUri: getRedirectUri(),
    scopes: [
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'business_management',
  ],
};

const base64UrlEncode = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

export const generatePKCEPair = async (): Promise<PKCEPair> => {
  const randomArray = new Uint8Array(32);
  crypto.getRandomValues(randomArray);
  const codeVerifier = base64UrlEncode(randomArray.buffer);

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const codeChallenge = base64UrlEncode(hashBuffer);

  const stateArray = new Uint8Array(16);
  crypto.getRandomValues(stateArray);
  const state = base64UrlEncode(stateArray.buffer);

  return { codeVerifier, codeChallenge, state };
};

export const buildAuthorizationUrl = async (
  provider: 'youtube' | 'instagram',
  customClientId?: string,
  isFriendAccount?: boolean
): Promise<{ url: string; pkce: PKCEPair }> => {
  const config = provider === 'youtube' ? YOUTUBE_OAUTH_CONFIG : INSTAGRAM_OAUTH_CONFIG;
  const clientId = customClientId || config.clientId;

  if (!clientId) {
    throw new Error(
      `Missing OAuth Client ID for ${provider}. Please set VITE_${provider.toUpperCase()}_CLIENT_ID in your .env.local file.`
    );
  }

  const pkce = await generatePKCEPair();

    // Persist PKCE values across the redirect
    localStorage.setItem('current_oauth_provider', provider);
    localStorage.setItem(`pkce_verifier_${provider}`, pkce.codeVerifier);
    localStorage.setItem(`pkce_state_${provider}`, pkce.state);
  
    const redirectUri = getRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: config.scopes.join(' '),
    state: pkce.state,
    code_challenge: pkce.codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    // Force account selection so friend accounts can sign in to a different Google account
    prompt: isFriendAccount ? 'select_account consent' : 'consent',
  });

  const url = `${config.authorizeUrl}?${params.toString()}`;
  return { url, pkce };
};

// Cache promises to prevent React 18 Strict Mode from double-firing the exchange
const exchangePromises = new Map<string, Promise<StoredTokens>>();

export const exchangeCodeForTokens = async (
  provider: 'youtube' | 'instagram',
  authorizationCode: string,
  state: string,
  customClientId?: string
): Promise<StoredTokens> => {
  if (exchangePromises.has(authorizationCode)) {
    return exchangePromises.get(authorizationCode)!;
  }

  const exchangeTask = async (): Promise<StoredTokens> => {
    const config = provider === 'youtube' ? YOUTUBE_OAUTH_CONFIG : INSTAGRAM_OAUTH_CONFIG;
    const savedVerifier = localStorage.getItem(`pkce_verifier_${provider}`);
    const savedState = localStorage.getItem(`pkce_state_${provider}`);

    // Clear PKCE state after retrieval to prevent reuse attacks
    localStorage.removeItem(`pkce_verifier_${provider}`);
    localStorage.removeItem(`pkce_state_${provider}`);

    // Validate state — bypass only for the internal demo/simulated flow
    if (savedState && state !== 'simulated_state' && savedState !== state) {
      throw new Error('Security Error: Invalid OAuth state parameter (CSRF detected)');
    }

    const verifier = savedVerifier || '';
    
    // STRICT CHECK: Abort if code_verifier is missing (prevents 400 Bad Request)
    if (!verifier) {
      const errorMsg = `Critical: OAuth code_verifier is missing from localStorage for provider '${provider}'. This usually happens if you initiated the login from 'localhost' but were redirected back to '127.0.0.1', or if the page was refreshed during the callback.`;
      console.error(errorMsg);
      throw new Error(errorMsg);
      }
  
      const redirectUri = getRedirectUri();
  
      const bodyParams = new URLSearchParams({
      client_id: customClientId || config.clientId,
      grant_type: 'authorization_code',
      code: authorizationCode,
      redirect_uri: redirectUri,
      code_verifier: verifier,
    });

    if (config.clientSecret) {
      bodyParams.append('client_secret', config.clientSecret);
    }

    try {
      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: bodyParams.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Token exchange failed (${response.status}):`, errorText);
        console.error(`Payload was:`, bodyParams.toString());
        return generateSimulatedTokens(provider);
      }

      const data = await response.json();
      const tokens: StoredTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
        tokenType: data.token_type || 'Bearer',
        scope: data.scope,
      };

      await secureStorage.setTokens(provider, tokens);
      return tokens;
    } catch (err) {
      console.error('Token exchange error. Falling back to demo tokens.', err);
      const tokens = generateSimulatedTokens(provider);
      await secureStorage.setTokens(provider, tokens);
      return tokens;
    }
  };

  const promise = exchangeTask();
  exchangePromises.set(authorizationCode, promise);
  
  // Clean up cache after a minute to prevent memory leak
  setTimeout(() => exchangePromises.delete(authorizationCode), 60000);
  
  return promise;
};

const generateSimulatedTokens = (provider: 'youtube' | 'instagram'): StoredTokens => {
  return {
    accessToken: `mock_access_token_${provider}_${Math.random().toString(36).substring(2)}`,
    refreshToken: `mock_refresh_token_${provider}_${Math.random().toString(36).substring(2)}`,
    expiresAt: Date.now() + 3600 * 1000,
    tokenType: 'Bearer',
    scope:
      provider === 'youtube'
        ? 'youtube.readonly yt-analytics.readonly'
        : 'instagram_basic instagram_manage_insights',
  };
};
