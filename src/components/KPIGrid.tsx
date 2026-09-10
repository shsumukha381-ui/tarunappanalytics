import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Eye, Sparkles, MousePointerClick, Clock, UserPlus, Heart, Loader2 } from 'lucide-react';
import type { KPIMetric, Platform, DateRange } from '../types/analytics';
import { MOCK_KPIS } from '../services/mockData';
import { fetchKPIMetrics as fetchYouTubeMetrics } from '../services/youtubeAPI';
import { fetchKPIMetrics as fetchInstagramMetrics } from '../services/instagramAPI';
import { useAuth } from '../context/AuthContext';

interface KPIGridProps {
  platform: Platform;
  dateRange?: DateRange;
  metrics?: KPIMetric[];
}

export const KPIGrid: React.FC<KPIGridProps> = ({ platform, dateRange = '28d', metrics: metricsProp }) => {
  const { isDemoMode, youtubeTokens, instagramTokens } = useAuth();
  const [liveMetrics, setLiveMetrics] = useState<KPIMetric[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // When not in demo mode and we have a valid token, fetch real KPIs
  useEffect(() => {
    if (isDemoMode) {
      setLiveMetrics(null);
      return;
    }

    if (platform === 'youtube' && !youtubeTokens?.accessToken) {
      setLiveMetrics(null);
      return;
    }
    
    if (platform === 'instagram' && !instagramTokens?.accessToken) {
      setLiveMetrics(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        let data: KPIMetric[] = [];

        if ((platform === 'youtube' || platform === 'all') && youtubeTokens?.accessToken) {
          const ytData = await fetchYouTubeMetrics(youtubeTokens.accessToken, dateRange);
          data = [...data, ...ytData];
        }

        if ((platform === 'instagram' || platform === 'all') && instagramTokens?.accessToken) {
          const igData = await fetchInstagramMetrics(instagramTokens.accessToken, dateRange);
          data = [...data, ...igData];
        }

        if (!cancelled) {
          if (data.length > 0) {
            setLiveMetrics(data);
          } else {
            // API returned no data — fall back to mock
            setFetchError(true);
            setLiveMetrics(null);
          }
        }
      } catch {
        if (!cancelled) {
          setFetchError(true);
          setLiveMetrics(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    return () => {
      cancelled = true;
    };
  }, [isDemoMode, youtubeTokens?.accessToken, instagramTokens?.accessToken, dateRange, platform]);

  // Determine which metrics to render
  const metrics = metricsProp ?? liveMetrics ?? MOCK_KPIS;

  const filteredMetrics = metrics.filter(
    (m) => platform === 'all' || m.platform === 'all' || m.platform === platform
  );

  const getMetricIcon = (id: string) => {
    switch (id) {
      case 'kpi_views':
        return Eye;
      case 'kpi_impressions':
        return Sparkles;
      case 'kpi_ctr':
        return MousePointerClick;
      case 'kpi_awt':
        return Clock;
      case 'kpi_net_growth':
        return UserPlus;
      case 'kpi_watch_time':
        return Clock;
      case 'kpi_likes':
        return Heart;
      default:
        return Heart;
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="glass-panel p-5 rounded-2xl border border-creator-border animate-pulse"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="h-3 w-24 bg-creator-card rounded" />
              <div className="h-8 w-8 bg-creator-card rounded-xl" />
            </div>
            <div className="h-8 w-28 bg-creator-card rounded mb-2" />
            <div className="h-3 w-36 bg-creator-card rounded mt-4" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Data source badge */}
      {!isDemoMode && liveMetrics && (
        <div className="mb-3 flex items-center gap-2 text-xs text-emerald-400">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Live {platform === 'all' ? 'YouTube & Instagram' : platform === 'youtube' ? 'YouTube' : 'Instagram'} Analytics
        </div>
      )}
      {fetchError && (
        <div className="mb-3 flex items-center gap-2 text-xs text-yellow-400">
          <Loader2 className="w-3 h-3" />
          API unavailable — showing demo data
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMetrics.map((kpi) => {
          const Icon = getMetricIcon(kpi.id);
          const isUp = kpi.isPositive;

          return (
            <div
              key={kpi.id}
              className="glass-panel glass-panel-hover p-5 rounded-2xl border border-creator-border relative overflow-hidden group"
            >
              <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-ai-cyan/5 rounded-full blur-2xl group-hover:bg-ai-cyan/15 transition-all duration-300 pointer-events-none" />

              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold text-creator-muted uppercase tracking-wider">
                  {kpi.label}
                </span>
                <div className="p-2 rounded-xl bg-creator-card border border-creator-border text-ai-cyan group-hover:border-ai-cyan/40 transition">
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold text-white tracking-tight">{kpi.value}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-creator-border/50 text-xs">
                <div className="flex items-center gap-1.5 font-bold">
                  <span
                    className={`px-2 py-0.5 rounded-md flex items-center gap-1 ${
                      isUp
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-yt-red/15 text-yt-red border border-yt-red/30'
                    }`}
                  >
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {kpi.changePercent > 0 ? `+${kpi.changePercent}%` : `${kpi.changePercent}%`}
                  </span>
                  <span className="text-creator-muted font-normal">{kpi.timePeriod}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
