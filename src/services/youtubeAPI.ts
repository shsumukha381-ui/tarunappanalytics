// src/services/youtubeAPI.ts

import type {
  ChannelProfile,
  VideoRetentionItem,
  KPIMetric,
  GeographicRegion,
  DemographicData,
  DateRange,
} from '../types/analytics';
import { getDateRangeBounds } from './dateUtils';

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

/** Perform an authenticated GET request to a Google API. Returns parsed JSON or null. */
const fetchJson = async (url: string, accessToken: string) => {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`YouTube API request failed (${res.status}): ${url}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn('Network error fetching YouTube API:', e);
    return null;
  }
};

// ---------------------------------------------------------------------------
// Channel profile
// ---------------------------------------------------------------------------

/** Fetch the authenticated user's channel profile via YouTube Data API v3. */
export const fetchChannelInfo = async (accessToken: string): Promise<ChannelProfile | null> => {
  const url =
    'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true';
  const data = await fetchJson(url, accessToken);
  if (!data || !data.items || data.items.length === 0) return null;
  const ch = data.items[0];
  const snippet = ch.snippet;
  const stats = ch.statistics;
  return {
    id: ch.id,
    name: snippet.title,
    handle: snippet.customUrl ? (snippet.customUrl.startsWith('@') ? snippet.customUrl : `@${snippet.customUrl}`) : '',
    avatarUrl:
      snippet.thumbnails?.high?.url ||
      snippet.thumbnails?.default?.url ||
      'https://ui-avatars.com/api/?name=' + encodeURIComponent(snippet.title || 'YT') + '&background=06b6d4&color=fff',
    subscribers: formatCompact(Number(stats.subscriberCount) || 0),
    platform: 'youtube',
    verified: true,
  };
};

// ---------------------------------------------------------------------------
// Recent videos
// ---------------------------------------------------------------------------

/** Fetch recent videos for the authenticated channel. */
export const fetchRecentVideos = async (
  accessToken: string,
  maxResults = 10,
): Promise<VideoRetentionItem[]> => {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=id&forMine=true&type=video&order=date&maxResults=${maxResults}`;
  const searchData = await fetchJson(searchUrl, accessToken);
  if (!searchData || !searchData.items) return [];
  const videoIds = searchData.items
    .map((i: any) => i.id?.videoId)
    .filter(Boolean)
    .join(',');
  if (!videoIds) return [];

  const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoIds}`;
  const detailsData = await fetchJson(detailsUrl, accessToken);
  if (!detailsData || !detailsData.items) return [];

  return detailsData.items.map((v: any) => {
    const { snippet, statistics, contentDetails } = v;
    const durationSec = parseISO8601Duration(contentDetails?.duration);
    return {
      id: v.id,
      channelId: snippet.channelId || '',
      title: snippet.title,
      platform: 'youtube' as const,
      durationSeconds: durationSec,
      durationFormatted: formatDuration(durationSec),
      views: Number(statistics.viewCount) || 0,
      impressions: 0, // not available from Data API
      ctrPercentage: 0, // not available from Data API
      avgWatchTime: '—',
      avgRetentionPercentage: 0,
      thumbnail: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || '',
      publishedDate: snippet.publishedAt || '',
      keyMoments: [],
      dataPoints: generatePlaceholderRetention(durationSec),
    } satisfies VideoRetentionItem;
  });
};

// ---------------------------------------------------------------------------
// KPI metrics
// ---------------------------------------------------------------------------

/** Fetch KPI metrics and return fully populated KPIMetric[] for the UI. */
export const fetchKPIMetrics = async (
  accessToken: string,
  dateRange: DateRange,
): Promise<KPIMetric[]> => {
  const { startDate, endDate } = getDateRangeBounds(dateRange);

  // Current period
  const metrics = 'views,estimatedMinutesWatched,averageViewDuration,subscribersGained,subscribersLost,likes';
  const currentUrl = buildAnalyticsUrl(metrics, null, startDate, endDate);
  const current = await fetchJson(currentUrl, accessToken);
  if (!current || !current.rows || current.rows.length === 0) return [];
  const row = current.rows[0];

  const views       = Number(row[0]) || 0;
  const watchMins   = Number(row[1]) || 0;
  const avgViewDur  = Number(row[2]) || 0; // seconds
  const subsGained  = Number(row[3]) || 0;
  const subsLost    = Number(row[4]) || 0;
  const likes       = Number(row[5]) || 0;

  const netGrowth = subsGained - subsLost;

  // Previous period (same length, shifted back) for change%
  const dayCount = getDayCount(dateRange);
  const prevEnd = new Date(new Date(startDate).getTime() - 86400000);
  const prevStart = new Date(prevEnd.getTime() - dayCount * 86400000);
  const prevUrl = buildAnalyticsUrl(
    metrics,
    null,
    prevStart.toISOString().split('T')[0],
    prevEnd.toISOString().split('T')[0],
  );
  const prev = await fetchJson(prevUrl, accessToken);
  const pRow = prev?.rows?.[0];

  const prevViews      = pRow ? Number(pRow[0]) || 0 : 0;
  const prevWatchMins  = pRow ? Number(pRow[1]) || 0 : 0;
  const prevAvgDur     = pRow ? Number(pRow[2]) || 0 : 0;
  const prevSubsGained = pRow ? Number(pRow[3]) || 0 : 0;
  const prevSubsLost   = pRow ? Number(pRow[4]) || 0 : 0;
  const prevLikes      = pRow ? Number(pRow[5]) || 0 : 0;
  const prevNetGrowth  = prevSubsGained - prevSubsLost;

  const pct = (cur: number, pre: number) => (pre === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - pre) / pre) * 1000) / 10);
  const timePeriod = `vs prev ${dateRange}`;

  const result: KPIMetric[] = [
    {
      id: 'kpi_views',
      label: 'Total Views',
      value: formatCompact(views),
      numericValue: views,
      changePercent: pct(views, prevViews),
      isPositive: views >= prevViews,
      timePeriod,
      sparkline: [],
      platform: 'all',
    },
    {
      id: 'kpi_watch_time',
      label: 'Watch Time (hrs)',
      value: formatCompact(Math.round(watchMins / 60)),
      numericValue: Math.round(watchMins / 60),
      changePercent: pct(watchMins, prevWatchMins),
      isPositive: watchMins >= prevWatchMins,
      timePeriod,
      sparkline: [],
      platform: 'youtube',
    },
    {
      id: 'kpi_awt',
      label: 'Avg Watch Time',
      value: formatDuration(avgViewDur),
      numericValue: avgViewDur,
      changePercent: pct(avgViewDur, prevAvgDur),
      isPositive: avgViewDur >= prevAvgDur,
      timePeriod,
      sparkline: [],
      platform: 'youtube',
    },
    {
      id: 'kpi_net_growth',
      label: 'Audience Net Growth',
      value: netGrowth >= 0 ? `+${formatCompact(netGrowth)}` : `-${formatCompact(Math.abs(netGrowth))}`,
      numericValue: netGrowth,
      changePercent: pct(netGrowth, prevNetGrowth),
      isPositive: netGrowth >= prevNetGrowth,
      timePeriod,
      sparkline: [],
      platform: 'all',
    },
    {
      id: 'kpi_likes',
      label: 'Total Likes',
      value: formatCompact(likes),
      numericValue: likes,
      changePercent: pct(likes, prevLikes),
      isPositive: likes >= prevLikes,
      timePeriod,
      sparkline: [],
      platform: 'youtube',
    },
  ];

  return result;
};

// ---------------------------------------------------------------------------
// Geographic data
// ---------------------------------------------------------------------------

/** Fetch geographic breakdown. */
export const fetchGeographicData = async (
  accessToken: string,
  dateRange: DateRange,
): Promise<GeographicRegion[]> => {
  const { startDate, endDate } = getDateRangeBounds(dateRange);
  const url = buildAnalyticsUrl(
    'views,estimatedMinutesWatched,averageViewDuration',
    'country',
    startDate,
    endDate,
  );
  const data = await fetchJson(url, accessToken);
  if (!data || !data.rows) return [];

  const totalViews = data.rows.reduce((s: number, r: any) => s + Number(r[1]), 0);

  return data.rows
    .map((r: any) => ({
      countryCode: r[0],
      countryName: r[0], // YouTube API returns ISO country codes — components can map later
      flagEmoji: countryFlag(r[0]),
      views: Number(r[1]),
      watchTimeHours: Math.round(Number(r[2]) / 60),
      avgWatchTime: formatDuration(Number(r[3])),
      percentageShare: totalViews > 0 ? Math.round((Number(r[1]) / totalViews) * 1000) / 10 : 0,
      rpmEst: 0, // RPM not available from Analytics API
    }))
    .sort((a: GeographicRegion, b: GeographicRegion) => b.views - a.views)
    .slice(0, 10);
};

// ---------------------------------------------------------------------------
// Demographic data
// ---------------------------------------------------------------------------

/** Fetch demographic data (age and gender). */
export const fetchDemographicData = async (
  accessToken: string,
  dateRange: DateRange,
): Promise<DemographicData> => {
  const { startDate, endDate } = getDateRangeBounds(dateRange);

  // Age groups
  const ageUrl = buildAnalyticsUrl('viewerPercentage', 'ageGroup', startDate, endDate);
  const ageData = await fetchJson(ageUrl, accessToken);
  const ageGroups = ageData?.rows?.map((r: any) => ({
    age: String(r[0]),
    percentage: Number(r[1]),
  })) || [];

  // Gender split
  const genderUrl = buildAnalyticsUrl('viewerPercentage', 'gender', startDate, endDate);
  const genderData = await fetchJson(genderUrl, accessToken);
  const genderColors: Record<string, string> = { male: '#3b82f6', female: '#ec4899', user_specified: '#a855f7' };
  const genderSplit = genderData?.rows?.map((r: any) => ({
    gender: mapGenderLabel(String(r[0])),
    percentage: Number(r[1]),
    color: genderColors[String(r[0]).toLowerCase()] || '#a855f7',
  })) || [];

  // Traffic sources
  const trafficUrl = buildAnalyticsUrl(
    'views,estimatedMinutesWatched',
    'insightTrafficSourceType',
    startDate,
    endDate,
  );
  const trafficData = await fetchJson(trafficUrl, accessToken);
  const totalTrafficViews = trafficData?.rows?.reduce((s: number, r: any) => s + Number(r[1]), 0) || 1;
  const trafficSources = trafficData?.rows?.map((r: any) => ({
    source: String(r[0]),
    percentage: Math.round((Number(r[1]) / totalTrafficViews) * 1000) / 10,
    views: Number(r[1]),
    change: '—', // no comparison data in a single query
  })) || [];

  // Peak publishing — not available from the Analytics API
  const peakTimezones: { timeSlot: string; activityLevel: number }[] = [];

  return { ageGroups, genderSplit, trafficSources, peakTimezones };
};

// ---------------------------------------------------------------------------
// Average retention (per-video)
// ---------------------------------------------------------------------------

/** Fetch the average view percentage for a specific video. */
export const fetchAverageRetention = async (
  accessToken: string,
  videoId: string,
): Promise<number | null> => {
  const url =
    `https://youtubeanalytics.googleapis.com/v2/reports?ids=channel==MINE` +
    `&dimensions=video&filters=video==${videoId}` +
    `&metrics=averageViewPercentage` +
    `&startDate=2000-01-01&endDate=2100-12-31`;
  const data = await fetchJson(url, accessToken);
  if (!data || !data.rows || data.rows.length === 0) return null;
  // rows: [[videoId, averageViewPercentage]]
  return Number(data.rows[0][1]);
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/** Build a YouTube Analytics API v2 URL. */
const buildAnalyticsUrl = (
  metrics: string,
  dimensions: string | null,
  startDate: string,
  endDate: string,
): string => {
  const params = new URLSearchParams({
    ids: 'channel==MINE',
    startDate,
    endDate,
    metrics,
  });
  if (dimensions) params.set('dimensions', dimensions);
  return `https://youtubeanalytics.googleapis.com/v2/reports?${params.toString()}`;
};

/** Format a number compactly: 1842900 → "1.84M" */
const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

/** Format seconds → "M:SS" or "H:MM:SS" */
const formatDuration = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** Parse ISO 8601 duration strings (e.g., PT5M30S) into seconds. */
const parseISO8601Duration = (iso: string): number => {
  if (!iso) return 0;
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
};

/** Generate placeholder retention curve points (demo data for the chart). */
const generatePlaceholderRetention = (durationSec: number) => {
  const points = 61;
  const step = Math.max(1, Math.floor(durationSec / points));
  return Array.from({ length: points + 1 }, (_, i) => {
    const sec = i * step;
    return {
      timeInSeconds: sec,
      timestamp: formatDuration(sec),
      videoRetention: Math.max(0, 100 - sec * (80 / durationSec)),
      benchmarkRetention: Math.max(0, 100 - sec * (90 / durationSec)),
    };
  });
};

/** Map YouTube API gender values to display labels. */
const mapGenderLabel = (apiValue: string): 'Male' | 'Female' | 'Other' => {
  const lower = apiValue.toLowerCase();
  if (lower === 'male') return 'Male';
  if (lower === 'female') return 'Female';
  return 'Other';
};

/** Convert a two-letter country code to a flag emoji. */
const countryFlag = (code: string): string => {
  if (!code || code.length !== 2) return '🏳️';
  return String.fromCodePoint(
    ...[...code.toUpperCase()].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
};

/** Get the number of days for a DateRange value. */
const getDayCount = (range: DateRange): number => {
  switch (range) {
    case '7d': return 7;
    case '28d': return 28;
    case '90d': return 90;
    case '365d': return 365;
    default: return 28;
  }
};
