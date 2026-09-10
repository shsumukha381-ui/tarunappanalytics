import { useState, useEffect } from 'react';
import { Globe, Users, Flame, Search, PlayCircle, Compass, ExternalLink, DollarSign, Clock, Eye, Loader2 } from 'lucide-react';
import { MOCK_GEOGRAPHIC, MOCK_DEMOGRAPHICS } from '../services/mockData';
import { fetchGeographicData as fetchYouTubeGeo, fetchDemographicData as fetchYouTubeDemo } from '../services/youtubeAPI';
import { fetchGeographicData as fetchInstagramGeo, fetchDemographicData as fetchInstagramDemo } from '../services/instagramAPI';
import { useAuth } from '../context/AuthContext';
import type { GeographicRegion, DemographicData, Platform } from '../types/analytics';

interface AudienceDiversityProps {
  platform?: Platform;
}

export const AudienceDiversity: React.FC<AudienceDiversityProps> = ({ platform = 'all' }) => {
  const { isDemoMode, youtubeTokens, instagramTokens } = useAuth();
  const [geoData, setGeoData] = useState<GeographicRegion[] | null>(null);
  const [demoData, setDemoData] = useState<DemographicData | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  useEffect(() => {
    if (isDemoMode) {
      setGeoData(null);
      setDemoData(null);
      return;
    }

    if (platform === 'youtube' && !youtubeTokens?.accessToken) {
      setGeoData(null);
      setDemoData(null);
      return;
    }

    if (platform === 'instagram' && !instagramTokens?.accessToken) {
      setGeoData(null);
      setDemoData(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        let geo: GeographicRegion[] = [];
        let demo: DemographicData = { ageGroups: [], genderSplit: [], trafficSources: [], peakTimezones: [] };
        
        // For simplicity, we just use the first available platform's data or aggregate
        // In a real app we would combine the arrays. For now, prefer YouTube if 'all', else Instagram
        
        if ((platform === 'youtube' || platform === 'all') && youtubeTokens?.accessToken) {
          const [ytGeo, ytDemo] = await Promise.all([
            fetchYouTubeGeo(youtubeTokens.accessToken, '28d'),
            fetchYouTubeDemo(youtubeTokens.accessToken, '28d'),
          ]);
          geo = ytGeo;
          demo = ytDemo;
        } else if ((platform === 'instagram' || platform === 'all') && instagramTokens?.accessToken) {
          const [igGeo, igDemo] = await Promise.all([
            fetchInstagramGeo(instagramTokens.accessToken, '28d'),
            fetchInstagramDemo(instagramTokens.accessToken, '28d'),
          ]);
          geo = igGeo;
          demo = igDemo;
        }

        if (!cancelled) {
          if (geo.length > 0) setGeoData(geo);
          if (demo.ageGroups.length > 0 || demo.genderSplit.length > 0) setDemoData(demo);
          if (geo.length === 0 && demo.ageGroups.length === 0) setFetchError(true);
        }
      } catch {
        if (!cancelled) setFetchError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isDemoMode, youtubeTokens?.accessToken, instagramTokens?.accessToken, platform]);

  // Resolve data: live → mock fallback
  const geographic = geoData ?? MOCK_GEOGRAPHIC;
  const demographics = demoData ?? MOCK_DEMOGRAPHICS;
  const isLive = !isDemoMode && geoData !== null;

  const getTrafficIcon = (sourceName: string) => {
    if (sourceName.includes('Search')) return Search;
    if (sourceName.includes('Suggested')) return PlayCircle;
    if (sourceName.includes('Explore') || sourceName.includes('Instagram')) return Compass;
    return ExternalLink;
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="glass-panel p-6 rounded-2xl border border-creator-border animate-pulse">
          <div className="h-5 w-64 bg-creator-card rounded mb-2" />
          <div className="h-3 w-96 bg-creator-card rounded" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-creator-border animate-pulse space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-creator-card rounded-xl" />
            ))}
          </div>
          <div className="space-y-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="glass-panel p-5 rounded-2xl border border-creator-border animate-pulse">
                <div className="h-24 bg-creator-card rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-creator-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Audience Diversity &amp; Geographic Intelligence</h2>
          </div>
          <p className="text-sm text-creator-muted mt-1">
            Global view distribution, country-level watch times, age/gender split, and inbound traffic sources.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLive && (
            <div className="bg-creator-card px-3.5 py-2 rounded-xl border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live {platform === 'all' ? 'YouTube & Instagram' : platform === 'youtube' ? 'YouTube' : 'Instagram'} Analytics
            </div>
          )}
          {fetchError && (
            <div className="bg-creator-card px-3.5 py-2 rounded-xl border border-yellow-500/30 text-xs text-yellow-400 flex items-center gap-2">
              <Loader2 className="w-3 h-3" />
              API unavailable — showing demo data
            </div>
          )}
          <div className="bg-creator-card px-3.5 py-2 rounded-xl border border-creator-border text-xs text-slate-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Regions: <span className="font-bold text-white">{geographic.length} Countries</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Top Countries (2 Cols) + Demographics Sidebar (1 Col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Countries Ranked List & Visual Progress Bars */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-creator-border space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-ai-cyan" />
              Top Viewing Regions Ranked by Watch Time
            </h3>
            <span className="text-xs text-creator-muted">{isLive ? 'Live data' : 'Demo data'}</span>
          </div>

          <div className="space-y-3.5">
            {geographic.map((geo, idx) => (
              <div
                key={geo.countryCode}
                className="bg-creator-card/80 p-4 rounded-xl border border-creator-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-ai-cyan/50 hover:bg-creator-hover transition group"
              >
                {/* Rank & Flag + Country Name */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <span className="text-xs font-extrabold text-creator-muted w-5">#{idx + 1}</span>
                  <span className="text-2xl shrink-0">{geo.flagEmoji}</span>
                  <div>
                    <div className="text-sm font-bold text-white group-hover:text-ai-cyan transition flex items-center gap-1.5">
                      {geo.countryName}
                    </div>
                    <div className="text-xs text-creator-muted flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-slate-400" />
                        {geo.views.toLocaleString()} views
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-purple-400" />
                        {geo.avgWatchTime} avg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="flex-1 max-w-xs">
                  <div className="flex justify-between text-xs mb-1 font-medium">
                    <span className="text-creator-muted">{geo.watchTimeHours.toLocaleString()} watch hrs</span>
                    <span className="font-bold text-ai-cyan">{geo.percentageShare}% share</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-ai-cyan via-ai-indigo to-ai-purple rounded-full transition-all duration-700 group-hover:brightness-125"
                      style={{ width: `${geo.percentageShare * 2.4}%` }}
                    />
                  </div>
                </div>

                {/* Revenue RPM Estimate */}
                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-0.5">
                    <DollarSign className="w-3 h-3" />
                    {geo.rpmEst.toFixed(2)} RPM
                  </div>
                  <div className="text-[10px] text-creator-muted">Est. Country Yield</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics & Traffic Sources Sidebar */}
        <div className="space-y-6">
          {/* Age Distribution Breakdown */}
          <div className="glass-panel p-5 rounded-2xl border border-creator-border space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-400" />
                Audience Age Distribution
              </h3>
              <span className="text-[11px] text-creator-muted">
                {demographics.ageGroups.length > 0
                  ? `Core: ${demographics.ageGroups.sort((a, b) => b.percentage - a.percentage).slice(0, 2).map((g) => g.age).join(', ')}`
                  : '—'}
              </span>
            </div>

            <div className="space-y-3">
              {demographics.ageGroups.map((group) => (
                <div key={group.age} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-creator-muted">{group.age} years</span>
                    <span className="font-bold text-white">{group.percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${group.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Split Indicator */}
          <div className="glass-panel p-5 rounded-2xl border border-creator-border space-y-3">
            <h3 className="text-sm font-bold text-white">Gender Distribution Split</h3>
            
            {/* Multi-segmented Progress Bar */}
            <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex p-0.5 border border-slate-800">
              {demographics.genderSplit.map((g) => (
                <div
                  key={g.gender}
                  className="h-full first:rounded-l-full last:rounded-r-full transition-all"
                  style={{ width: `${g.percentage}%`, backgroundColor: g.color }}
                  title={`${g.gender}: ${g.percentage}%`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              {demographics.genderSplit.map((g) => (
                <div key={g.gender} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <span className="text-creator-muted">{g.gender}:</span>
                  <span className="font-bold text-white">{g.percentage}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Traffic Sources */}
          <div className="glass-panel p-5 rounded-2xl border border-creator-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-ai-cyan" />
              Inbound Traffic Sources
            </h3>

            <div className="space-y-3">
              {demographics.trafficSources.map((traffic) => {
                const Icon = getTrafficIcon(traffic.source);

                return (
                  <div
                    key={traffic.source}
                    className="p-3 bg-creator-card/70 rounded-xl border border-creator-border flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-800 text-ai-cyan">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-white">{traffic.source}</div>
                        <div className="text-[11px] text-creator-muted">{traffic.views.toLocaleString()} views</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-bold text-white">{traffic.percentage}%</div>
                      <div className="text-[10px] text-emerald-400 font-semibold">{traffic.change}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Publishing Window Tip Card */}
          <div className="glass-panel p-5 rounded-2xl border border-creator-border space-y-2 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4" /> Peak Publishing Window
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              Based on viewer timezone density in <strong>India (IST)</strong> &amp; <strong>US (EST)</strong>, your ideal publishing slot is <strong>16:00 - 18:00 EST (02:30 IST)</strong> for maximum algorithm momentum.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
