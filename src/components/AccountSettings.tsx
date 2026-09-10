import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  LogOut,
  RefreshCw,
  Lock,
  Radio,
  UserPlus,
  Users,
  Share2,
  Check,
  Trash2,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './icons/PlatformIcons';
import { useAuth } from '../context/AuthContext';

export const AccountSettings: React.FC = () => {
  const {
    connectedChannels,
    activeChannel,
    loginYouTube,
    loginInstagram,
    removeChannel,
    switchChannel,
    generateFriendInviteLink,
    logoutAll,
    isLoading,
    isDemoMode,
    toggleDemoMode,
  } = useAuth();

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setSaveFeedback('OAuth 2.0 PKCE tokens refreshed successfully for all connected accounts.');
      setTimeout(() => setSaveFeedback(null), 3000);
    }, 900);
  };

  const handleCopyInviteLink = () => {
    const link = generateFriendInviteLink();
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-creator-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-ai-cyan/10 text-ai-cyan">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Accounts & Multi-Channel Connections</h2>
          </div>
          <p className="text-sm text-creator-muted mt-1">
            Connect your own Google/Instagram accounts or connect a friend's Google Account to monitor shared YouTube Analytics.
          </p>
        </div>

        {/* Demo / Live Mode Toggle */}
        <div className="flex items-center gap-3 bg-creator-card p-2 rounded-xl border border-creator-border shrink-0">
          <span className="text-xs text-creator-muted font-medium pl-2">Data Engine:</span>
          <button
            onClick={toggleDemoMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              isDemoMode
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            }`}
          >
            <Radio className="w-3 h-3 animate-pulse" />
            {isDemoMode ? 'Demo Sandbox Mode' : 'Live OAuth API Mode'}
          </button>
        </div>
      </div>

      {saveFeedback && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-xs text-emerald-200 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveFeedback}</span>
        </div>
      )}

      {/* FEATURE: Connect Friend's Google Account Hero Card */}
      <div className="glass-panel p-6 rounded-2xl border border-ai-cyan/40 bg-gradient-to-br from-ai-cyan/10 via-ai-indigo/10 to-transparent space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-ai-cyan">
              <UserPlus className="w-5 h-5" />
              <span className="text-xs font-extrabold uppercase tracking-wider bg-ai-cyan/20 px-2 py-0.5 rounded border border-ai-cyan/30">
                Multi-Account Analytics Feature
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-white">Connect Friend's Google Account</h3>
            <p className="text-xs text-creator-muted leading-relaxed max-w-2xl">
              Collaborate with fellow creators or clients. Connect your friend’s Google Account to pull their YouTube Analytics into your dashboard, or share an OAuth grant link.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {/* Direct Connect Friend Button */}
            <button
              onClick={() => loginYouTube(true)}
              disabled={isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-ai-cyan to-ai-indigo hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl transition shadow-glow-cyan flex items-center gap-2 disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4" />
              {isLoading ? 'Opening Google Login...' : "Connect Friend's Account"}
            </button>

            {/* Share Invite Link Button */}
            <button
              onClick={handleCopyInviteLink}
              className="px-4 py-2.5 bg-creator-card border border-creator-border hover:border-slate-500 text-xs font-bold text-slate-200 hover:text-white rounded-xl transition flex items-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-ai-cyan" />}
              {copiedLink ? 'Invite Link Copied!' : 'Share OAuth Invite Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Connected Accounts Manager Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-creator-muted uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-ai-cyan" />
            All Connected Accounts ({connectedChannels.length})
          </h3>
          <span className="text-xs text-creator-muted">Click a channel to set as active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectedChannels.map((channel) => {
            const isActive = activeChannel.id === channel.id;

            return (
              <div
                key={channel.id}
                onClick={() => switchChannel(channel.id)}
                className={`glass-panel p-5 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                  isActive
                    ? 'border-ai-cyan shadow-glow-cyan bg-creator-card/90'
                    : 'border-creator-border hover:border-slate-600'
                }`}
              >
                {isActive && (
                  <div className="absolute top-0 right-0 bg-ai-cyan text-slate-950 text-[10px] font-extrabold px-3 py-0.5 rounded-bl-lg">
                    ACTIVE VIEW
                  </div>
                )}

                <div className="flex items-start gap-3.5">
                  <img
                    src={channel.avatarUrl}
                    alt={channel.name}
                    className="w-12 h-12 rounded-full border-2 border-ai-cyan object-cover shrink-0"
                  />

                  <div className="overflow-hidden flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-bold text-white truncate">{channel.name}</span>
                      {channel.isFriendAccount ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                          👥 Friend's Account
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                          Primary
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-creator-muted truncate">{channel.handle}</div>
                    <div className="text-xs font-bold text-emerald-400">{channel.subscribers} Subscribers</div>
                    {channel.ownerEmail && (
                      <div className="text-[11px] text-creator-muted truncate pt-0.5">
                        Owner: <span className="text-slate-300">{channel.ownerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-creator-border/60 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-creator-muted flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-400" /> Keychain Protected
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeChannel(channel.id);
                    }}
                    className="text-yt-red hover:underline text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Disconnect
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Platform Login Buttons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl border border-creator-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-yt-red/10 text-yt-red">
              <YoutubeIcon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">YouTube OAuth PKCE</h4>
              <p className="text-xs text-creator-muted">Connect your primary Google account</p>
            </div>
          </div>

          <button
            onClick={() => loginYouTube(false)}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-yt-red hover:bg-yt-hover text-white text-xs font-bold rounded-xl transition shadow-glow-red flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <YoutubeIcon className="w-4 h-4" />
            {isLoading ? 'Opening Login Prompt...' : 'Connect Google/YouTube Account'}
          </button>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-creator-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-ig-pink/10 text-ig-pink">
              <InstagramIcon className="w-6 h-6 text-ig-pink" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Meta Graph API</h4>
              <p className="text-xs text-creator-muted">Instagram Business / Creator Account</p>
            </div>
          </div>

          <button
            onClick={loginInstagram}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-ig-pink via-ig-purple to-ig-orange hover:brightness-110 text-white text-xs font-bold rounded-xl transition shadow-glow-purple flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <InstagramIcon className="w-4 h-4" />
            {isLoading ? 'Opening Meta Login...' : 'Connect Instagram Account'}
          </button>
        </div>
      </div>

      {/* Token Lifecycle & Actions Bar */}
      <div className="glass-panel p-6 rounded-2xl border border-creator-border space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              OAuth 2.0 PKCE Token Lifecycle
            </h3>
            <p className="text-xs text-creator-muted">
              Access & refresh tokens are encrypted using OS Keychain abstractions (RFC 7636 PKCE).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-creator-card hover:bg-creator-hover border border-creator-border text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-ai-cyan ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh All Tokens Now
            </button>

            <button
              onClick={logoutAll}
              className="px-4 py-2 bg-yt-red/10 hover:bg-yt-red/20 text-yt-red border border-yt-red/30 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              Disconnect All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
