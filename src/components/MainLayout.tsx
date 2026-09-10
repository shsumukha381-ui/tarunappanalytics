import React, { useState } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Globe,
  Sparkles,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Radio,
  UserCheck,
  UserPlus,
  Zap,
} from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from './icons/PlatformIcons';
import type { Platform, DateRange, NavigationTab, ChannelProfile } from '../types/analytics';
import { useAuth } from '../context/AuthContext';

interface MainLayoutProps {
  children: React.ReactNode;
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  selectedDateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  selectedChannel: ChannelProfile;
  onChannelChange: (channel: ChannelProfile) => void;
  onOpenSettingsModal?: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  selectedPlatform,
  onPlatformChange,
  selectedDateRange,
  onDateRangeChange,
}) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const {
    connectedChannels,
    activeChannel,
    switchChannel,
    youtubeConnected,
    instagramConnected,
  } = useAuth();

  const handleRefresh = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 800);
  };

  const navItems = [
    { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
    { id: 'retention', label: 'Audience Retention', icon: BarChart3, badge: 'Live' },
    { id: 'diversity', label: 'Audience Diversity', icon: Globe },
    { id: 'ai-topics', label: 'AI Topic Engine', icon: Sparkles, highlight: true },
    { id: 'settings', label: 'Platform Connections', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-creator-bg text-creator-text flex flex-col font-sans antialiased selection:bg-ai-cyan/30">
      <div className="flex flex-1 relative">
        {/* Left Persistent Sidebar */}
        <aside
          className={`glass-panel border-r border-creator-border flex flex-col justify-between transition-all duration-300 z-30 sticky top-0 h-screen ${
            isSidebarCollapsed ? 'w-20' : 'w-64'
          }`}
        >
          <div>
            <div className="p-5 flex items-center justify-between border-b border-creator-border/60">
              {!isSidebarCollapsed && (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-ai-cyan via-ai-indigo to-ai-purple flex items-center justify-center shadow-glow-cyan">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className="font-extrabold text-base tracking-tight text-white flex items-center gap-1">
                      ANTIGRAVITY <span className="text-[10px] bg-ai-cyan/20 text-ai-cyan px-1.5 py-0.5 rounded border border-ai-cyan/30">v2.4</span>
                    </h1>
                    <p className="text-[11px] text-creator-muted">Creator Intelligence Studio</p>
                  </div>
                </div>
              )}

              {isSidebarCollapsed && (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-ai-cyan to-ai-indigo flex items-center justify-center mx-auto shadow-glow-cyan">
                  <Zap className="w-5 h-5 text-white" />
                </div>
              )}

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 rounded-lg bg-creator-card border border-creator-border text-creator-muted hover:text-white transition hidden md:block"
                title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              >
                {isSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            </div>

            <nav className="p-3 space-y-1.5 mt-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id as NavigationTab)}
                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-medium text-sm transition group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-ai-cyan/20 to-ai-indigo/10 border border-ai-cyan/40 text-white font-bold shadow-glow-cyan'
                        : 'text-creator-muted hover:bg-creator-hover hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 shrink-0 transition-transform ${
                        isActive ? 'text-ai-cyan scale-110' : 'group-hover:scale-110 group-hover:text-white'
                      }`}
                    />

                    {!isSidebarCollapsed && (
                      <span className="truncate">{item.label}</span>
                    )}

                    {!isSidebarCollapsed && item.badge && (
                      <span className="ml-auto text-[10px] font-extrabold uppercase bg-yt-red/20 text-yt-red border border-yt-red/40 px-1.5 py-0.5 rounded">
                        {item.badge}
                      </span>
                    )}

                    {!isSidebarCollapsed && item.highlight && (
                      <span className="ml-auto flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ai-cyan opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-ai-cyan"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-3 border-t border-creator-border/60 space-y-2">
            {!isSidebarCollapsed ? (
              <div className="bg-creator-card p-3 rounded-xl border border-creator-border">
                <div className="flex items-center gap-2.5">
                  <img
                    src={activeChannel.avatarUrl}
                    alt={activeChannel.name}
                    className="w-8 h-8 rounded-full border border-ai-cyan shrink-0 object-cover"
                  />
                  <div className="overflow-hidden flex-1">
                    <div className="text-xs font-bold text-white truncate flex items-center gap-1">
                      {activeChannel.name}
                      <UserCheck className="w-3 h-3 text-ai-cyan shrink-0" />
                    </div>
                    <div className="text-[11px] text-creator-muted truncate">{activeChannel.handle}</div>
                  </div>
                </div>

                <button
                  onClick={() => onTabChange('settings')}
                  className="w-full mt-2.5 py-1.5 px-2 bg-creator-hover hover:bg-slate-800 text-[11px] text-ai-cyan font-semibold rounded-lg border border-ai-cyan/20 flex items-center justify-center gap-1.5 transition"
                >
                  <Radio className="w-3 h-3 animate-pulse text-emerald-400" />
                  {youtubeConnected || instagramConnected ? 'OAuth Active' : 'Connect Account'}
                </button>
              </div>
            ) : (
              <button
                onClick={() => onTabChange('settings')}
                className="w-10 h-10 rounded-xl bg-creator-card border border-creator-border flex items-center justify-center mx-auto text-ai-cyan hover:border-ai-cyan transition"
                title="Manage Connections"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}
          </div>
        </aside>

        {/* Main Body */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <header className="sticky top-0 z-20 glass-panel border-b border-creator-border px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Dynamic Connected Account Switcher Dropdown */}
              <div className="relative">
                <select
                  value={activeChannel.id}
                  onChange={(e) => switchChannel(e.target.value)}
                  className="appearance-none bg-creator-card border border-ai-cyan/50 text-white text-xs font-extrabold py-2 px-3 pr-8 rounded-xl focus:outline-none focus:border-ai-cyan transition cursor-pointer shadow-glow-cyan"
                >
                  {connectedChannels.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      {ch.isFriendAccount ? `👥 ${ch.name}` : `★ ${ch.name}`} ({ch.handle})
                    </option>
                  ))}
                </select>
                <ChevronRight className="w-3.5 h-3.5 text-ai-cyan absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>

              {/* Add Friend Account Quick Action */}
              <button
                onClick={() => onTabChange('settings')}
                className="px-3 py-1.5 bg-creator-card hover:bg-creator-hover border border-creator-border text-ai-cyan text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                title="Connect a Friend's Google Account"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Add Account
              </button>

              <div className="bg-creator-card p-1 rounded-xl border border-creator-border flex items-center gap-1">
                <button
                  onClick={() => onPlatformChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedPlatform === 'all'
                      ? 'bg-ai-cyan text-slate-950 font-bold'
                      : 'text-creator-muted hover:text-white'
                  }`}
                >
                  All Platforms
                </button>
                <button
                  onClick={() => onPlatformChange('youtube')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    selectedPlatform === 'youtube'
                      ? 'bg-yt-red text-white font-bold'
                      : 'text-creator-muted hover:text-white'
                  }`}
                >
                  <YoutubeIcon className="w-3.5 h-3.5" />
                  YouTube
                </button>
                <button
                  onClick={() => onPlatformChange('instagram')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                    selectedPlatform === 'instagram'
                      ? 'bg-gradient-to-r from-ig-pink to-ig-purple text-white font-bold'
                      : 'text-creator-muted hover:text-white'
                  }`}
                >
                  <InstagramIcon className="w-3.5 h-3.5" />
                  Instagram
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-creator-card p-1 rounded-xl border border-creator-border flex items-center gap-1">
                {(['7d', '28d', '90d', '365d'] as DateRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => onDateRangeChange(range)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedDateRange === range
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-creator-muted hover:text-white'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRefresh}
                className="p-2 rounded-xl bg-creator-card border border-creator-border text-creator-muted hover:text-white transition hover:border-slate-500"
                title="Sync Realtime Analytics"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-ai-cyan' : ''}`} />
              </button>
            </div>
          </header>

          <div className="p-6 max-w-7xl w-full mx-auto space-y-8 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
};
