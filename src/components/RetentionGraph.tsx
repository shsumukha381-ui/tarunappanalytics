import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import {
  Clock,
  Eye,
  MousePointerClick,
  Sparkles,
  AlertTriangle,
  ChevronDown,
  BarChart2,
  Zap,
  Info,
} from 'lucide-react';
import type { VideoRetentionItem, KeyMomentMarker } from '../types/analytics';
import { MOCK_VIDEOS } from '../services/mockData';
import { fetchRecentVideos as fetchYouTubeRecentVideos, fetchAverageRetention as fetchYouTubeAverageRetention } from '../services/youtubeAPI';
import { fetchRecentVideos as fetchInstagramRecentVideos, fetchAverageRetention as fetchInstagramAverageRetention } from '../services/instagramAPI';
import { useAuth } from '../context/AuthContext';

interface RetentionGraphProps {
  platform?: 'all' | 'youtube' | 'instagram';
  videos?: VideoRetentionItem[];
  onSelectVideoForAI?: (video: VideoRetentionItem) => void;
}

export const RetentionGraph: React.FC<RetentionGraphProps> = ({
  platform = 'all',
  videos: videosProp = MOCK_VIDEOS,
  onSelectVideoForAI,
}) => {
  const { isDemoMode, youtubeTokens, instagramTokens } = useAuth();
  const [liveVideos, setLiveVideos] = useState<VideoRetentionItem[] | null>(null);
  const [avgRetentionMap, setAvgRetentionMap] = useState<Record<string, number>>({});

  // Fetch real video list when live mode is active
  useEffect(() => {
    if (isDemoMode) {
      setLiveVideos(null);
      return;
    }

    let cancelled = false;
    const load = async () => {
      try {
        let vids: VideoRetentionItem[] = [];
        
        if ((platform === 'all' || platform === 'youtube') && youtubeTokens?.accessToken) {
          const ytVids = await fetchYouTubeRecentVideos(youtubeTokens.accessToken, 10);
          vids = [...vids, ...ytVids];
        }

        if ((platform === 'all' || platform === 'instagram') && instagramTokens?.accessToken) {
          const igVids = await fetchInstagramRecentVideos(instagramTokens.accessToken, 10);
          vids = [...vids, ...igVids];
        }

        // Sort combined videos by date descending
        vids.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());

        if (!cancelled && vids.length > 0) {
          setLiveVideos(vids.slice(0, 10)); // keep top 10
        } else if (!cancelled && vids.length === 0) {
          // If no videos were fetched, fall back to null
          setLiveVideos(null);
        }
      } catch {
        // keep demo data on failure
      } finally {
        // loading complete
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isDemoMode, youtubeTokens?.accessToken, instagramTokens?.accessToken, platform]);

  // Resolve which video list to use
  const videos = liveVideos ?? videosProp;
  const isLive = !isDemoMode && liveVideos !== null;

  const [selectedVideoId, setSelectedVideoId] = useState<string>(videos[0]?.id || '');
  const [highlightedMoment, setHighlightedMoment] = useState<KeyMomentMarker | null>(null);
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);

  // Update selected video when video list changes
  useEffect(() => {
    if (videos.length > 0 && !videos.find((v) => v.id === selectedVideoId)) {
      setSelectedVideoId(videos[0].id);
    }
  }, [videos, selectedVideoId]);

  const currentVideo = videos.find((v) => v.id === selectedVideoId) || videos[0];

  // Fetch real average retention for the selected video (live mode only)
  useEffect(() => {
    if (!isLive || !currentVideo) return;
    if (avgRetentionMap[currentVideo.id] !== undefined) return; // already fetched

    let cancelled = false;
    const load = async () => {
      try {
        let pct: number | null = null;
        if (currentVideo.platform === 'youtube' && youtubeTokens?.accessToken) {
          pct = await fetchYouTubeAverageRetention(youtubeTokens.accessToken, currentVideo.id);
        } else if (currentVideo.platform === 'instagram' && instagramTokens?.accessToken) {
          pct = await fetchInstagramAverageRetention(instagramTokens.accessToken, currentVideo.id);
        }
        
        if (!cancelled && pct !== null) {
          setAvgRetentionMap((prev) => ({ ...prev, [currentVideo.id]: pct }));
        }
      } catch {
        // silently ignore
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isLive, youtubeTokens?.accessToken, instagramTokens?.accessToken, currentVideo?.id, currentVideo?.platform, avgRetentionMap]);

  // Use real avg retention if available, otherwise use the value from the video object
  const displayRetentionPct =
    avgRetentionMap[currentVideo?.id] ?? currentVideo?.avgRetentionPercentage ?? 0;

  const sharpDropMarker = currentVideo?.keyMoments?.find((m) => m.timestamp === '1:30' || m.type === 'drop');

  const handleMarkerClick = (moment: KeyMomentMarker) => {
    setHighlightedMoment(moment);
  };

  if (!currentVideo) return null;

  return (
    <div className="space-y-6">
      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 glass-panel p-5 rounded-2xl border border-creator-border">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-yt-red/10 text-yt-red">
              <BarChart2 className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">Audience Retention Intelligence</h2>
            {isLive && (
              <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Videos
              </span>
            )}
          </div>
          <p className="text-sm text-creator-muted mt-1">
            Timestamp-level viewer drop-off analytics &amp; rewatch patterns vs channel benchmark curve.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[280px]">
            <select
              value={selectedVideoId}
              onChange={(e) => {
                setSelectedVideoId(e.target.value);
                setHighlightedMoment(null);
              }}
              className="w-full appearance-none bg-creator-card border border-creator-border text-white text-sm font-medium py-2.5 px-4 pr-10 rounded-xl focus:outline-none focus:border-ai-cyan transition cursor-pointer"
            >
              {videos.map((vid) => (
                <option key={vid.id} value={vid.id}>
                  {vid.title} ({vid.durationFormatted})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-creator-muted absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => setShowBenchmark(!showBenchmark)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
              showBenchmark
                ? 'bg-ai-cyan/10 border-ai-cyan/40 text-ai-cyan'
                : 'bg-creator-card border-creator-border text-creator-muted hover:text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showBenchmark ? 'bg-ai-cyan animate-pulse' : 'bg-creator-muted'}`} />
            Channel Benchmark Overlay
          </button>
        </div>
      </div>

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-creator-border">
          <div className="flex items-center text-creator-muted text-xs gap-1.5 mb-1">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <span>Total Views</span>
          </div>
          <div className="text-xl font-bold text-white">{currentVideo.views.toLocaleString()}</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
            {currentVideo.impressions.toLocaleString()} Impressions
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-creator-border">
          <div className="flex items-center text-creator-muted text-xs gap-1.5 mb-1">
            <MousePointerClick className="w-3.5 h-3.5 text-amber-400" />
            <span>Click-Through Rate (CTR)</span>
          </div>
          <div className="text-xl font-bold text-white">{currentVideo.ctrPercentage}%</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">+1.8% above channel avg</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-creator-border">
          <div className="flex items-center text-creator-muted text-xs gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Average Watch Time</span>
          </div>
          <div className="text-xl font-bold text-white">{currentVideo.avgWatchTime}</div>
          <div className="text-[11px] text-creator-muted mt-0.5">
            of {currentVideo.durationFormatted} ({displayRetentionPct.toFixed(1)}% retention{isLive && avgRetentionMap[currentVideo.id] !== undefined ? ' — live' : ''})
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-creator-border">
          <div className="flex items-center text-creator-muted text-xs gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-yt-red" />
            <span>30-Second Hook Retention</span>
          </div>
          <div className="text-xl font-bold text-emerald-400">88.0%</div>
          <div className="text-[11px] text-emerald-400 font-medium mt-0.5">Strong Initial Curiosity</div>
        </div>
      </div>

      {/* Main Retention Chart Box */}
      <div className="glass-panel p-6 rounded-2xl border border-creator-border relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Viewer Retention Curve (% Remaining over Duration)
              {/* Demo Curve badge */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Info className="w-3 h-3" />
                Demo Curve
              </span>
            </h3>
            <p className="text-xs text-creator-muted">
              Hover over points to inspect retention dips, rewatch loops, and drop-off timestamp markers.
              <span className="text-amber-400/80 ml-1">(Per-second retention data is not available via YouTube's public API — this curve uses illustrative data.)</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1 bg-cyan-400 rounded-full" />
              <span className="text-white">This Video ({displayRetentionPct.toFixed(1)}% avg)</span>
            </div>
            {showBenchmark && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-slate-500 rounded-full border border-dashed border-slate-300" />
                <span className="text-creator-muted">Channel Benchmark</span>
              </div>
            )}
          </div>
        </div>

        {/* Sharp Drop-off Alert Highlight Box */}
        {sharpDropMarker && (
          <div className="mb-4 p-3.5 bg-red-950/40 border border-yt-red/40 rounded-xl flex items-start gap-3 text-xs text-red-200">
            <AlertTriangle className="w-5 h-5 text-yt-red shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-white uppercase tracking-wider text-[11px] bg-yt-red/20 px-2 py-0.5 rounded border border-yt-red/40 mr-2">
                Critical Drop-off Marker detected at {sharpDropMarker.timestamp}
              </span>
              <p className="mt-1 text-slate-300">
                Retention dropped sharply from <span className="font-bold text-white">84%</span> to{' '}
                <span className="font-bold text-white">62%</span> ({sharpDropMarker.retentionChange}% change).{' '}
                {sharpDropMarker.description}
              </p>
            </div>
          </div>
        )}

        <div className="h-[360px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={currentVideo.dataPoints}
              margin={{ top: 20, right: 30, left: -10, bottom: 10 }}
            >
              <defs>
                <linearGradient id="videoRetentionGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2638" vertical={false} />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickLine={false}
              />

              <Tooltip content={<CustomRetentionTooltip />} />

              {/* Channel Benchmark Area / Line */}
              {showBenchmark && (
                <Area
                  type="monotone"
                  dataKey="benchmarkRetention"
                  stroke="#64748b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  fill="transparent"
                  name="Channel Benchmark"
                />
              )}

              {/* Main Retention Area Line */}
              <Area
                type="monotone"
                dataKey="videoRetention"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#videoRetentionGrad)"
                name="Video Retention"
              />

              {/* Reference Line for 1:30 Drop-off */}
              <ReferenceLine
                x="1:30"
                stroke="#ff0000"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{
                  value: '⚠️ 1:30 Sharp Drop (-22%)',
                  position: 'top',
                  fill: '#ff4d4d',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />

              {/* Rewatch Spike Line at 4:15 */}
              <ReferenceLine
                x="4:15"
                stroke="#10b981"
                strokeWidth={1.5}
                strokeDasharray="3 3"
                label={{
                  value: '🚀 4:15 Rewatch Spike (+13%)',
                  position: 'top',
                  fill: '#34d399',
                  fontSize: 11,
                  fontWeight: 'bold',
                }}
              />

              <ReferenceDot
                x="1:30"
                y={62}
                r={6}
                fill="#ff0000"
                stroke="#ffffff"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key Moments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-creator-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Detected Timestamp Key Moments
            </h3>
            <span className="text-xs text-creator-muted">Click a moment to inspect</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentVideo.keyMoments.map((moment, idx) => {
              const isDrop = moment.type === 'drop';
              const isSpike = moment.type === 'spike';

              return (
                <div
                  key={idx}
                  onClick={() => handleMarkerClick(moment)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer ${
                    highlightedMoment?.timestamp === moment.timestamp
                      ? 'bg-creator-hover border-ai-cyan shadow-glow-cyan'
                      : 'bg-creator-card/70 border-creator-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[11px] font-bold rounded ${
                          isDrop
                            ? 'bg-yt-red/20 text-yt-red border border-yt-red/30'
                            : isSpike
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {moment.timestamp}
                      </span>
                      <span className="text-xs font-semibold text-white">{moment.title}</span>
                    </div>

                    <span
                      className={`text-xs font-bold ${
                        moment.retentionChange > 0 ? 'text-emerald-400' : 'text-yt-red'
                      }`}
                    >
                      {moment.retentionChange > 0 ? `+${moment.retentionChange}%` : `${moment.retentionChange}%`}
                    </span>
                  </div>

                  <p className="text-xs text-creator-muted line-clamp-2">{moment.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-creator-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-ai-cyan mb-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">AI Content Recommendation</h3>
            </div>
            <p className="text-xs text-creator-muted leading-relaxed">
              Based on the <span className="text-yt-red font-semibold">1:30 drop-off pattern</span>, our engine predicts a{' '}
              <span className="text-emerald-400 font-semibold">+34% retention lift</span> by replacing slides with live terminal executions in your next video.
            </p>
          </div>

          <div className="mt-4 pt-4 border-t border-creator-border space-y-2">
            {onSelectVideoForAI && (
              <button
                onClick={() => onSelectVideoForAI(currentVideo)}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-ai-cyan to-ai-indigo hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-glow-cyan flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Topic Suggestions for this Video
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomRetentionTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const videoRet = data.videoRetention;
    const benchRet = data.benchmarkRetention;
    const diff = Math.round((videoRet - benchRet) * 10) / 10;

    return (
      <div className="bg-creator-card border border-creator-border p-3.5 rounded-xl shadow-card-dark text-xs space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-creator-border pb-1.5 font-bold text-white">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-ai-cyan" />
            Timestamp: {label}
          </span>
          <span className="text-creator-muted">({data.timeInSeconds}s)</span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-creator-muted">Video Retention:</span>
            <span className="font-bold text-cyan-400">{videoRet}%</span>
          </div>

          {benchRet !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-creator-muted">Benchmark Avg:</span>
              <span className="font-semibold text-slate-400">{benchRet}%</span>
            </div>
          )}

          {benchRet !== undefined && (
            <div className="flex items-center justify-between pt-1 border-t border-creator-border/50">
              <span className="text-creator-muted">Delta vs Benchmark:</span>
              <span className={`font-bold ${diff >= 0 ? 'text-emerald-400' : 'text-yt-red'}`}>
                {diff >= 0 ? `+${diff}%` : `${diff}%`}
              </span>
            </div>
          )}
        </div>

        {label === '1:30' && (
          <div className="mt-2 pt-2 border-t border-yt-red/40 bg-yt-red/10 p-2 rounded text-[11px] text-red-200">
            ⚠️ <strong>Sharp Drop-Off:</strong> Theory slide caused 22% skip.
          </div>
        )}

        {label === '4:15' && (
          <div className="mt-2 pt-2 border-t border-emerald-500/40 bg-emerald-500/10 p-2 rounded text-[11px] text-emerald-200">
            🚀 <strong>Rewatch Spike:</strong> API Code snippet looped.
          </div>
        )}
      </div>
    );
  }
  return null;
};
