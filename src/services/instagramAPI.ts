// src/services/instagramAPI.ts

import type {
  ChannelProfile,
  VideoRetentionItem,
  KPIMetric,
  GeographicRegion,
  DemographicData,
  DateRange,
} from '../types/analytics';
// import { getDateRangeBounds } from './dateUtils';

// ---------------------------------------------------------------------------
// Core fetch helper
// ---------------------------------------------------------------------------

const fetchJson = async (url: string, accessToken: string) => {
  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    });
    if (!res.ok) {
      console.warn(`Instagram API request failed (${res.status}): ${url}`);
      return null;
    }
    return await res.json();
  } catch (e) {
    console.warn('Network error fetching Instagram API:', e);
    return null;
  }
};

const IG_BASE = 'https://graph.instagram.com/v19.0';
// For business accounts, normally you'd use graph.facebook.com/{ig_user_id}
// For basic display API, graph.instagram.com/me
// We assume an Instagram Graph API (Business/Creator) accessed via graph.facebook.com or directly if supported.
// Given the scopes requested (instagram_basic, instagram_manage_insights), this is likely the new Instagram Graph API.

// ---------------------------------------------------------------------------
// Channel profile
// ---------------------------------------------------------------------------

export const fetchChannelInfo = async (accessToken: string): Promise<ChannelProfile | null> => {
  // Assuming me/ endpoint returns basic profile info
  const url = `${IG_BASE}/me?fields=id,username,name,profile_picture_url,followers_count`;
  const data = await fetchJson(url, accessToken);
  if (!data || !data.id) return null;
  
  return {
    id: data.id,
    name: data.name || data.username,
    handle: `@${data.username}`,
    avatarUrl: data.profile_picture_url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(data.username || 'IG') + '&background=ec4899&color=fff',
    subscribers: formatCompact(Number(data.followers_count) || 0),
    platform: 'instagram',
    verified: true, // Mocked
  };
};

// ---------------------------------------------------------------------------
// Recent videos (Reels/Media)
// ---------------------------------------------------------------------------

export const fetchRecentVideos = async (
  accessToken: string,
  maxResults = 10,
): Promise<VideoRetentionItem[]> => {
  const url = `${IG_BASE}/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count&limit=${maxResults}`;
  const data = await fetchJson(url, accessToken);
  
  if (!data || !data.data) return [];

  return data.data.map((v: any) => {
    return {
      id: v.id,
      channelId: '', // Would need to fetch user id if required
      title: v.caption ? (v.caption.length > 50 ? v.caption.substring(0, 50) + '...' : v.caption) : 'Instagram Post',
      platform: 'instagram' as const,
      durationSeconds: 15, // Mocked for IG
      durationFormatted: '0:15',
      views: Number(v.like_count) * 10 || 0, // Mocking views from likes if views_count isn't directly available without insights
      impressions: 0,
      ctrPercentage: 0,
      avgWatchTime: '—',
      avgRetentionPercentage: 0,
      thumbnail: v.thumbnail_url || v.media_url || '',
      publishedDate: v.timestamp || '',
      keyMoments: [],
      dataPoints: generatePlaceholderRetention(15),
    } satisfies VideoRetentionItem;
  });
};

// ---------------------------------------------------------------------------
// KPI metrics
// ---------------------------------------------------------------------------

export const fetchKPIMetrics = async (
  _accessToken: string,
  dateRange: DateRange,
): Promise<KPIMetric[]> => {
  // Insights API calls are complex for Instagram; mocking values based on channel stats or generic endpoints for now,
  // or implementing basic insight fetching if endpoints align.
  // Real implementation requires fetching metrics like impressions, reach, profile_views.
  
  const views = Math.floor(Math.random() * 50000) + 10000;
  const prevViews = Math.floor(views * (0.8 + Math.random() * 0.4));
  
  const reach = Math.floor(views * 1.5);
  const prevReach = Math.floor(reach * (0.8 + Math.random() * 0.4));
  
  const followersGained = Math.floor(Math.random() * 500);
  const prevFollowersGained = Math.floor(followersGained * (0.8 + Math.random() * 0.4));

  const pct = (cur: number, pre: number) => (pre === 0 ? (cur > 0 ? 100 : 0) : Math.round(((cur - pre) / pre) * 1000) / 10);
  const timePeriod = `vs prev ${dateRange}`;

  return [
    {
      id: 'kpi_views',
      label: 'Total Views/Plays',
      value: formatCompact(views),
      numericValue: views,
      changePercent: pct(views, prevViews),
      isPositive: views >= prevViews,
      timePeriod,
      sparkline: [],
      platform: 'instagram',
    },
    {
      id: 'kpi_reach',
      label: 'Accounts Reached',
      value: formatCompact(reach),
      numericValue: reach,
      changePercent: pct(reach, prevReach),
      isPositive: reach >= prevReach,
      timePeriod,
      sparkline: [],
      platform: 'instagram',
    },
    {
      id: 'kpi_net_growth',
      label: 'Followers Gained',
      value: `+${formatCompact(followersGained)}`,
      numericValue: followersGained,
      changePercent: pct(followersGained, prevFollowersGained),
      isPositive: followersGained >= prevFollowersGained,
      timePeriod,
      sparkline: [],
      platform: 'instagram',
    }
  ];
};

// ---------------------------------------------------------------------------
// Geographic data
// ---------------------------------------------------------------------------

export const fetchGeographicData = async (
  _accessToken: string,
  _dateRange: DateRange,
): Promise<GeographicRegion[]> => {
  // Real implementation: GET /me/insights?metric=audience_country&period=lifetime
  // Mocking for now as lifetime metrics on IG require specific node edges.
  return [
    { countryCode: 'US', countryName: 'United States', flagEmoji: '🇺🇸', views: 45000, watchTimeHours: 0, avgWatchTime: '', percentageShare: 45, rpmEst: 0 },
    { countryCode: 'IN', countryName: 'India', flagEmoji: '🇮🇳', views: 30000, watchTimeHours: 0, avgWatchTime: '', percentageShare: 30, rpmEst: 0 },
    { countryCode: 'UK', countryName: 'United Kingdom', flagEmoji: '🇬🇧', views: 15000, watchTimeHours: 0, avgWatchTime: '', percentageShare: 15, rpmEst: 0 },
  ];
};

// ---------------------------------------------------------------------------
// Demographic data
// ---------------------------------------------------------------------------

export const fetchDemographicData = async (
  _accessToken: string,
  _dateRange: DateRange,
): Promise<DemographicData> => {
  // Real implementation: GET /me/insights?metric=audience_gender_age&period=lifetime
  return {
    ageGroups: [
      { age: '18-24', percentage: 40 },
      { age: '25-34', percentage: 35 },
      { age: '35-44', percentage: 15 },
    ],
    genderSplit: [
      { gender: 'Female', percentage: 60, color: '#ec4899' },
      { gender: 'Male', percentage: 38, color: '#3b82f6' },
      { gender: 'Other', percentage: 2, color: '#a855f7' },
    ],
    trafficSources: [
      { source: 'Explore', percentage: 50, views: 5000, change: '—' },
      { source: 'Home', percentage: 30, views: 3000, change: '—' },
      { source: 'Profile', percentage: 20, views: 2000, change: '—' },
    ],
    peakTimezones: [],
  };
};

// ---------------------------------------------------------------------------
// Average retention
// ---------------------------------------------------------------------------

export const fetchAverageRetention = async (
  _accessToken: string,
  _videoId: string,
): Promise<number | null> => {
  // Reels retention is limited in the graph API, mocking for now.
  return Math.random() * 40 + 30; // 30-70%
};

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

const formatCompact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
};

const formatDuration = (totalSeconds: number): string => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

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
