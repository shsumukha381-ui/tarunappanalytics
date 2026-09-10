import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { secureStorage } from '../services/secureStorage';
import type { StoredTokens } from '../services/secureStorage';
import type { ChannelProfile } from '../types/analytics';
import { buildAuthorizationUrl } from '../services/oauthPKCE';
import { OAuthCallbackServer } from '../services/oauthCallbackServer';

export interface ProfileData {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  subscribers: string;
  platform: 'youtube' | 'instagram';
  isFriendAccount?: boolean;
  ownerEmail?: string;
}

interface AuthContextType {
  youtubeConnected: boolean;
  instagramConnected: boolean;
  connectedChannels: ChannelProfile[];
  activeChannel: ChannelProfile;
  youtubeTokens: StoredTokens | null;
  instagramTokens: StoredTokens | null;
  isLoading: boolean;
  isDemoMode: boolean;
  loginYouTube: (isFriendAccount?: boolean) => Promise<void>;
  logoutYouTube: () => Promise<void>;
  loginInstagram: () => Promise<void>;
  logoutInstagram: () => Promise<void>;
  removeChannel: (channelId: string) => void;
  switchChannel: (channelId: string) => void;
  addConnectedChannel: (channel: ChannelProfile) => void;
  generateFriendInviteLink: () => string;
  logoutAll: () => Promise<void>;
  toggleDemoMode: () => void;
  /** Reload tokens from secure storage (e.g. after OAuth callback redirect). */
  reloadTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectedChannels, setConnectedChannels] = useState<ChannelProfile[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('');
  const [youtubeConnected, setYoutubeConnected] = useState<boolean>(false);
  const [instagramConnected, setInstagramConnected] = useState<boolean>(false);
  const [youtubeTokens, setYoutubeTokens] = useState<StoredTokens | null>(null);
  const [instagramTokens, setInstagramTokens] = useState<StoredTokens | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  const fallbackChannel: ChannelProfile = {
    id: 'no-account',
    name: 'No Account Connected',
    handle: 'Connect via Settings',
    avatarUrl: 'https://ui-avatars.com/api/?name=NA&background=1e293b&color=fff',
    subscribers: '0',
    platform: 'youtube',
    verified: false,
  };

  const activeChannel =
    connectedChannels.find((c) => c.id === activeChannelId) || connectedChannels[0] || fallbackChannel;

  /**
   * Load tokens from secure storage.
   * If a valid (non-expired) YouTube access token exists, auto-disable demo mode.
   */
  const reloadTokens = useCallback(async () => {
    try {
      const yt = await secureStorage.getTokens('youtube');
      const ig = await secureStorage.getTokens('instagram');

      if (yt) {
        setYoutubeTokens(yt);
        setYoutubeConnected(true);
        // Auto-detect: if the token hasn't expired, we can use the real API
        if (yt.expiresAt > Date.now()) {
          setIsDemoMode(false);
          // Fetch real channel profile so the header uses live data
          try {
            const { fetchChannelInfo } = await import('../services/youtubeAPI');
            const realChannel = await fetchChannelInfo(yt.accessToken);
            if (realChannel) {
              setConnectedChannels((prev) => {
                const filtered = prev.filter((c) => c.id !== realChannel.id);
                return [realChannel, ...filtered];
              });
              setActiveChannelId(realChannel.id);
            }
          } catch (err) {
            console.error('Failed to fetch real channel profile on startup:', err);
          }
        }
      }
      if (ig) {
        setInstagramTokens(ig);
        setInstagramConnected(true);
        if (ig.expiresAt > Date.now()) {
          setIsDemoMode(false);
          try {
            const { fetchChannelInfo } = await import('../services/instagramAPI');
            const realChannel = await fetchChannelInfo(ig.accessToken);
            if (realChannel) {
              setConnectedChannels((prev) => {
                const filtered = prev.filter((c) => c.id !== realChannel.id);
                return [realChannel, ...filtered];
              });
              setActiveChannelId((prev) => prev || realChannel.id);
            }
          } catch (err) {
            console.error('Failed to fetch real Instagram profile on startup:', err);
          }
        }
      }
    } catch (err) {
      console.error('Error loading stored keychain tokens:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load tokens once on mount
  useEffect(() => {
    reloadTokens();
  }, [reloadTokens]);

  /**
   * addConnectedChannel — called by OAuthCallbackPage after a successful token exchange.
   * Also reloads tokens so the dashboard can immediately use the real API.
   */
  const addConnectedChannel = useCallback(
    (channel: ChannelProfile) => {
      setConnectedChannels((prev) => {
        // Avoid duplicates by ID
        if (prev.find((c) => c.id === channel.id)) return prev;
        return [channel, ...prev];
      });
      setActiveChannelId(channel.id);
      setYoutubeConnected(true);
      // Reload tokens so youtubeTokens state is fresh and isDemoMode can flip
      reloadTokens();
    },
    [reloadTokens],
  );

  /**
   * loginYouTube — redirects the current window to the Google OAuth consent page.
   */
  const loginYouTube = async (isFriendAccount = false) => {
    setIsLoading(true);
    try {
      const { url } = await buildAuthorizationUrl('youtube', undefined, isFriendAccount);
      // Store whether this is a friend-account login so OAuthCallbackPage can tag it
      localStorage.setItem('oauth_is_friend_account', isFriendAccount ? '1' : '0');
      OAuthCallbackServer.startOAuthFlow('youtube', url);
      // Note: page navigates away here. setIsLoading(false) won't run until after redirect.
    } catch (err: any) {
      console.error('YouTube OAuth Error:', err);
      alert(`OAuth Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const logoutYouTube = async () => {
    await secureStorage.removeTokens('youtube');
    setYoutubeTokens(null);
    setYoutubeConnected(false);
    setIsDemoMode(true); // revert to demo when logged out
  };

  const loginInstagram = async () => {
    setIsLoading(true);
    try {
      const { url } = await buildAuthorizationUrl('instagram');
      OAuthCallbackServer.startOAuthFlow('instagram', url);
    } catch (err: any) {
      console.error('Instagram OAuth Error:', err);
      alert(`OAuth Error: ${err.message}`);
      setIsLoading(false);
    }
  };

  const logoutInstagram = async () => {
    await secureStorage.removeTokens('instagram');
    setInstagramTokens(null);
    setInstagramConnected(false);
  };

  const removeChannel = (channelId: string) => {
    setConnectedChannels((prev) => prev.filter((c) => c.id !== channelId));
    if (activeChannelId === channelId) {
      const remaining = connectedChannels.filter((c) => c.id !== channelId);
      if (remaining.length > 0) setActiveChannelId(remaining[0].id);
    }
  };

  const switchChannel = (channelId: string) => {
    setActiveChannelId(channelId);
  };

  const generateFriendInviteLink = (): string => {
    const inviteId = Math.random().toString(36).substring(2, 10);
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
    return `${origin}/oauth/callback?provider=youtube&invite_id=${inviteId}&scopes=youtube.readonly,yt-analytics.readonly`;
  };

  const logoutAll = async () => {
    await secureStorage.clearAll();
    setYoutubeTokens(null);
    setInstagramTokens(null);
    setYoutubeConnected(false);
    setInstagramConnected(false);
    setIsDemoMode(true);
  };

  const toggleDemoMode = () => {
    setIsDemoMode((prev) => !prev);
  };

  return (
    <AuthContext.Provider
      value={{
        youtubeConnected,
        instagramConnected,
        connectedChannels,
        activeChannel,
        youtubeTokens,
        instagramTokens,
        isLoading,
        isDemoMode,
        loginYouTube,
        logoutYouTube,
        loginInstagram,
        logoutInstagram,
        removeChannel,
        switchChannel,
        addConnectedChannel,
        generateFriendInviteLink,
        logoutAll,
        toggleDemoMode,
        reloadTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
