import { useEffect, useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { OAuthCallbackServer } from '../services/oauthCallbackServer';
import { useAuth } from '../context/AuthContext';

/**
 * OAuthCallbackPage
 *
 * Google redirects here after the user approves/denies OAuth consent.
 * URL pattern: http://localhost:5173/oauth/callback?provider=youtube&code=AUTH_CODE&state=STATE
 *
 * This page reads the URL params, exchanges the code for tokens via the PKCE flow,
 * updates the auth context, then redirects the user back to the main dashboard.
 */
export const OAuthCallbackPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { addConnectedChannel } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');

      // Meta doesn't like query parameters in the redirect URI, so we rely on localStorage
      // which we populated right before redirecting to the provider.
      const storedProvider = localStorage.getItem('current_oauth_provider') as 'youtube' | 'instagram' | null;
      const provider = params.get('provider') as 'youtube' | 'instagram' | null || storedProvider;
      const error = params.get('error');

      if (error) {
        setStatus('error');
        setErrorMessage(`Authorization denied: ${error}`);
        return;
      }

      if (!provider || !code || !state) {
        setStatus('error');
        setErrorMessage('Missing required OAuth parameters (provider, code, or state).');
        return;
      }

      try {
        const result = await OAuthCallbackServer.handleCallback(provider, code, state);

        // Add the returned profile as a connected channel in global auth state
        if (result.profile) {
          addConnectedChannel({
            id: result.profile.id,
            name: result.profile.name,
            handle: result.profile.handle,
            avatarUrl: result.profile.avatarUrl,
            subscribers: result.profile.subscribers,
            platform: provider,
            verified: true,
            isFriendAccount: localStorage.getItem('oauth_is_friend_account') === '1',
            ownerEmail: result.profile.email || '',
            connectedAt: new Date().toISOString(),
          });
        }

        setStatus('success');

        // Redirect back to the main dashboard after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } catch (err: any) {
        setStatus('error');
        setErrorMessage(err.message || 'An unexpected error occurred during token exchange.');
      }
    };

    processCallback();
  }, [addConnectedChannel]);

  return (
    <div className="min-h-screen bg-creator-bg flex items-center justify-center font-sans">
      <div className="glass-panel border border-creator-border rounded-2xl p-10 max-w-md w-full text-center space-y-5 shadow-2xl">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 text-ai-cyan mx-auto animate-spin" />
            <h2 className="text-lg font-bold text-white">Completing Sign-In…</h2>
            <p className="text-sm text-creator-muted">
              Exchanging authorization code for secure tokens. Please wait.
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h2 className="text-lg font-bold text-white">Account Connected!</h2>
            <p className="text-sm text-creator-muted">
              Authentication successful. Redirecting you to your dashboard…
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <AlertCircle className="w-12 h-12 text-yt-red mx-auto" />
            <h2 className="text-lg font-bold text-white">Authentication Failed</h2>
            <p className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
              {errorMessage}
            </p>
            <button
              onClick={() => (window.location.href = '/')}
              className="w-full py-2.5 bg-creator-card border border-creator-border hover:bg-creator-hover text-white font-semibold text-sm rounded-xl transition"
            >
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};
