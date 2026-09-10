import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { MainLayout } from './components/MainLayout';
import { KPIGrid } from './components/KPIGrid';
import { RetentionGraph } from './components/RetentionGraph';
import { AudienceDiversity } from './components/AudienceDiversity';
import { TopicSuggester } from './components/TopicSuggester';
import { AccountSettings } from './components/AccountSettings';
import { OAuthCallbackPage } from './components/OAuthCallbackPage';
import type { NavigationTab, Platform, DateRange, ChannelProfile, VideoRetentionItem } from './types/analytics';
import { MOCK_VIDEOS } from './services/mockData';
import { Sparkles, BarChart2, Users } from 'lucide-react';

function DashboardContent() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>('28d');

  const { activeChannel, switchChannel, isDemoMode } = useAuth();

  const handleSelectVideoForAI = (_video: VideoRetentionItem) => {
    setActiveTab('ai-topics');
  };

  // In demo mode, use mock videos; in live mode the RetentionGraph component
  // fetches real videos internally via the API service.
  const channelVideos = isDemoMode
    ? MOCK_VIDEOS.filter((v) => v.channelId === activeChannel.id || !v.channelId)
    : [];

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      selectedPlatform={selectedPlatform}
      onPlatformChange={setSelectedPlatform}
      selectedDateRange={selectedDateRange}
      onDateRangeChange={setSelectedDateRange}
      selectedChannel={activeChannel}
      onChannelChange={(ch: ChannelProfile) => switchChannel(ch.id)}
    >
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="glass-panel p-6 rounded-2xl border border-creator-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-extrabold text-white tracking-tight">
                  Executive Analytics &amp; Content Intelligence
                </h1>
                {activeChannel.isFriendAccount && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Viewing Friend's Account
                  </span>
                )}
              </div>
              <p className="text-sm text-creator-muted">
                {isDemoMode ? 'Demo data' : 'Live data'} for <strong className="text-white">{activeChannel.name}</strong> ({activeChannel.handle}) across YouTube &amp; Instagram.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setActiveTab('retention')}
                className="px-4 py-2 bg-creator-card border border-creator-border hover:border-ai-cyan text-white text-xs font-bold rounded-xl transition flex items-center gap-2"
              >
                <BarChart2 className="w-4 h-4 text-ai-cyan" />
                View Retention Graph
              </button>
              <button
                onClick={() => setActiveTab('ai-topics')}
                className="px-4 py-2 bg-gradient-to-r from-ai-cyan to-ai-indigo text-white text-xs font-bold rounded-xl transition shadow-glow-cyan flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AI Topic Engine
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-bold text-creator-muted uppercase tracking-wider mb-4">
              Core Performance KPIs ({selectedDateRange})
            </h2>
            <KPIGrid platform={selectedPlatform} dateRange={selectedDateRange} />
          </div>

          <div>
            <h2 className="text-xs font-bold text-creator-muted uppercase tracking-wider mb-4">
              Audience Retention Analysis ({activeChannel.name})
            </h2>
            <RetentionGraph
              platform={selectedPlatform}
              videos={channelVideos.length > 0 ? channelVideos : MOCK_VIDEOS}
              onSelectVideoForAI={handleSelectVideoForAI}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AudienceDiversity platform={selectedPlatform} />
            <TopicSuggester />
          </div>
        </div>
      )}

      {activeTab === 'retention' && (
        <div className="animate-in fade-in duration-300">
          <RetentionGraph
            platform={selectedPlatform}
            videos={channelVideos.length > 0 ? channelVideos : MOCK_VIDEOS}
            onSelectVideoForAI={handleSelectVideoForAI}
          />
        </div>
      )}

      {activeTab === 'diversity' && (
        <div className="animate-in fade-in duration-300">
          <AudienceDiversity platform={selectedPlatform} />
        </div>
      )}

      {activeTab === 'ai-topics' && (
        <div className="animate-in fade-in duration-300">
          <TopicSuggester />
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="animate-in fade-in duration-300">
          <AccountSettings />
        </div>
      )}
    </MainLayout>
  );
}

export function App() {
  // Handle the OAuth callback route — Google redirects here after consent
  const path = window.location.pathname;
  if (path === '/oauth/callback') {
    return (
      <AuthProvider>
        <OAuthCallbackPage />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}

export default App;
