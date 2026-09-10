import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Key, RefreshCw } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './icons/PlatformIcons';

interface PlatformAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformAuthModal: React.FC<PlatformAuthModalProps> = ({ isOpen, onClose }) => {
  const [ytConnected, setYtConnected] = useState<boolean>(true);
  const [igConnected, setIgConnected] = useState<boolean>(true);
  const [ytApiKey, setYtApiKey] = useState<string>('AIzaSyD-YT-DataV3-Analytics-Active-Key');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleRefreshToken = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-creator-card border border-creator-border rounded-2xl max-w-lg w-full p-6 shadow-card-dark space-y-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-lg text-creator-muted hover:text-white hover:bg-creator-hover transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-ai-cyan/10 text-ai-cyan">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-bold text-white tracking-tight">Platform Connections & Auth</h2>
          </div>
          <p className="text-xs text-creator-muted mt-1">
            Manage OAuth 2.0 integrations for YouTube Data API v3 and Instagram Business Graph API.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-creator-border bg-creator-bg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <YoutubeIcon className="w-6 h-6 text-yt-red" />
              <div>
                <div className="text-sm font-bold text-white">YouTube Data API v3</div>
                <div className="text-[11px] text-creator-muted">Channel: @TechVisionHQ</div>
              </div>
            </div>

            <button
              onClick={() => setYtConnected(!ytConnected)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                ytConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-yt-red text-white'
              }`}
            >
              {ytConnected ? 'Connected (Active)' : 'Connect OAuth'}
            </button>
          </div>

          {ytConnected && (
            <div className="pt-2 border-t border-creator-border/60 flex items-center justify-between text-xs text-creator-muted">
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="w-3.5 h-3.5" /> Token auto-refreshed (Expires in 58m)
              </span>
              <button
                onClick={handleRefreshToken}
                className="text-ai-cyan hover:underline flex items-center gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} /> Refresh
              </button>
            </div>
          )}
        </div>

        <div className="p-4 rounded-xl border border-creator-border bg-creator-bg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <InstagramIcon className="w-6 h-6 text-ig-pink" />
              <div>
                <div className="text-sm font-bold text-white">Meta Graph API (Instagram Business)</div>
                <div className="text-[11px] text-creator-muted">Account: @TechVisionHQ_Ig</div>
              </div>
            </div>

            <button
              onClick={() => setIgConnected(!igConnected)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                igConnected
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-gradient-to-r from-ig-pink to-ig-purple text-white'
              }`}
            >
              {igConnected ? 'Connected (Active)' : 'Connect Meta'}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-creator-muted flex items-center gap-1.5">
            <Key className="w-3.5 h-3.5 text-ai-cyan" />
            Custom Developer API Credentials
          </label>
          <input
            type="password"
            value={ytApiKey}
            onChange={(e) => setYtApiKey(e.target.value)}
            className="w-full bg-creator-bg border border-creator-border text-white text-xs font-mono py-2.5 px-3 rounded-xl focus:outline-none focus:border-ai-cyan"
          />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-ai-cyan hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-glow-cyan"
        >
          Save & Close Settings
        </button>
      </div>
    </div>
  );
};
