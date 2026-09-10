export type Platform = 'all' | 'youtube' | 'instagram';
export type DateRange = '7d' | '28d' | '90d' | '365d';
export type NavigationTab = 'dashboard' | 'retention' | 'diversity' | 'ai-topics' | 'settings';

export interface ChannelProfile {
  id: string;
  name: string;
  handle: string;
  avatarUrl: string;
  platform: 'youtube' | 'instagram' | 'both';
  subscribers: string;
  verified: boolean;
  isFriendAccount?: boolean;
  ownerEmail?: string;
  connectedAt?: string;
}

export interface KeyMomentMarker {
  timeInSeconds: number;
  timestamp: string;
  type: 'intro' | 'drop' | 'spike' | 'cta';
  title: string;
  description: string;
  retentionChange: number;
}

export interface VideoRetentionItem {
  id: string;
  channelId: string;
  title: string;
  platform: 'youtube' | 'instagram';
  durationSeconds: number;
  durationFormatted: string;
  views: number;
  impressions: number;
  ctrPercentage: number;
  avgWatchTime: string;
  avgRetentionPercentage: number;
  thumbnail: string;
  publishedDate: string;
  keyMoments: KeyMomentMarker[];
  dataPoints: RetentionDataPoint[];
}

export interface RetentionDataPoint {
  timeInSeconds: number;
  timestamp: string;
  videoRetention: number;
  benchmarkRetention: number;
  keyMoment?: KeyMomentMarker;
}

export interface KPIMetric {
  id: string;
  label: string;
  value: string;
  numericValue: number;
  changePercent: number;
  isPositive: boolean;
  timePeriod: string;
  sparkline: number[];
  unit?: string;
  platform: Platform;
  channelId?: string;
}

export interface GeographicRegion {
  countryCode: string;
  countryName: string;
  flagEmoji: string;
  views: number;
  watchTimeHours: number;
  avgWatchTime: string;
  percentageShare: number;
  rpmEst: number;
}

export interface DemographicData {
  ageGroups: { age: string; percentage: number }[];
  genderSplit: { gender: 'Male' | 'Female' | 'Other'; percentage: number; color: string }[];
  trafficSources: { source: string; percentage: number; views: number; change: string }[];
  peakTimezones: { timeSlot: string; activityLevel: number }[];
}

export interface TopicRecommendation {
  id: string;
  channelId?: string;
  title: string;
  angle: string;
  hookScript: string;
  category: string;
  expectedScore: number;
  potentialReach: 'High' | 'Very High' | 'Viral Potential';
  targetAudienceDemographic: string;
  dataTrigger: string;
  suggestedDuration: string;
  targetPlatform: 'youtube_long' | 'youtube_shorts' | 'instagram_reels';
  outline: string[];
  savedToCalendar?: boolean;
}
