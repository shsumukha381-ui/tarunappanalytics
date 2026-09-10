import type {
  VideoRetentionItem,
  ChannelProfile,
  KPIMetric,
  GeographicRegion,
  DemographicData,
  TopicRecommendation,
} from '../types/analytics';

export const MOCK_CHANNELS: ChannelProfile[] = [
  {
    id: 'ch_1',
    name: 'TechVision HQ',
    handle: '@TechVisionHQ',
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    platform: 'both',
    subscribers: '482.5K',
    verified: true,
    isFriendAccount: false,
    ownerEmail: 'creator@techvisionhq.io',
    connectedAt: 'Connected (Primary Account)',
  },
  {
    id: 'ch_2',
    name: 'Tarun Analytics (Friend)',
    handle: '@TarunAnalytics',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    platform: 'youtube',
    subscribers: '124.8K',
    verified: true,
    isFriendAccount: true,
    ownerEmail: 'tarun.friend@gmail.com',
    connectedAt: 'Connected via Friend OAuth Grant',
  },
  {
    id: 'ch_3',
    name: 'Alex Code Daily (Friend)',
    handle: '@AlexCodeDaily',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    platform: 'youtube',
    subscribers: '89.3K',
    verified: false,
    isFriendAccount: true,
    ownerEmail: 'alex.creator@gmail.com',
    connectedAt: 'Connected via Shared Invite Link',
  }
];

const generate10MinRetentionData = (dropOffset = 0) => {
  const points = [];
  const duration = 600;
  
  for (let s = 0; s <= duration; s += 10) {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    const timestamp = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    
    let benchmark = Math.max(35, 100 - (s / duration) * 55 - Math.sin(s / 50) * 3);
    let videoRet = 100;
    
    if (s <= 30) {
      videoRet = 100 - (s / 30) * 12;
    } else if (s < 90) {
      videoRet = 88 - ((s - 30) / 60) * 4;
    } else if (s === 90) {
      videoRet = 62 + dropOffset; 
    } else if (s > 90 && s <= 120) {
      videoRet = (62 + dropOffset) - ((s - 90) / 30) * 2;
    } else if (s > 120 && s < 250) {
      videoRet = 60 - ((s - 120) / 130) * 8;
    } else if (s >= 250 && s <= 280) {
      const spikeFactor = Math.sin(((s - 250) / 30) * Math.PI);
      videoRet = 52 + spikeFactor * 13;
    } else if (s > 280 && s < 525) {
      videoRet = 58 - ((s - 280) / 245) * 14;
    } else if (s >= 525) {
      videoRet = 44 - ((s - 525) / 75) * 16;
    }

    const vRetClamped = Math.min(100, Math.max(15, Math.round(videoRet * 10) / 10));
    const bRetClamped = Math.round(benchmark * 10) / 10;

    points.push({
      timeInSeconds: s,
      timestamp,
      videoRetention: vRetClamped,
      benchmarkRetention: bRetClamped,
    });
  }

  return points;
};

export const MOCK_VIDEOS: VideoRetentionItem[] = [
  {
    id: 'vid_10min_ai_saas',
    channelId: 'ch_1',
    title: 'Building a Production AI SaaS in 24 Hours (Full Architecture)',
    platform: 'youtube',
    durationSeconds: 600,
    durationFormatted: '10:00',
    views: 142800,
    impressions: 1680000,
    ctrPercentage: 8.5,
    avgWatchTime: '5:42',
    avgRetentionPercentage: 57.0,
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
    publishedDate: '3 days ago',
    keyMoments: [
      {
        timeInSeconds: 30,
        timestamp: '0:30',
        type: 'intro',
        title: 'Hook Retention',
        description: '88% of viewers completed the 30-second teaser. High curiosity score.',
        retentionChange: -12.0,
      },
      {
        timeInSeconds: 90,
        timestamp: '1:30',
        type: 'drop',
        title: 'Sharp Drop-off Point',
        description: '-22.0% sudden drop during theoretical slides. Recommendation: transition directly to code demo.',
        retentionChange: -22.0,
      },
      {
        timeInSeconds: 255,
        timestamp: '4:15',
        type: 'spike',
        title: 'Rewatch Spike (+13%)',
        description: 'Viewers rewound the OpenAI API rate-limiting & database schema visualizer.',
        retentionChange: +13.0,
      },
      {
        timeInSeconds: 525,
        timestamp: '8:45',
        type: 'cta',
        title: 'Outro Drop-off',
        description: 'Verbal conclusion trigger caused 16% skip rate before end card.',
        retentionChange: -16.0,
      }
    ],
    dataPoints: generate10MinRetentionData(0),
  },
  {
    id: 'vid_tarun_friend_01',
    channelId: 'ch_2',
    title: "[Friend's Video] System Design Teardown: How Netflix Handles 100M Streams",
    platform: 'youtube',
    durationSeconds: 600,
    durationFormatted: '10:00',
    views: 94200,
    impressions: 890000,
    ctrPercentage: 10.4,
    avgWatchTime: '6:18',
    avgRetentionPercentage: 63.0,
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    publishedDate: '5 days ago',
    keyMoments: [
      {
        timeInSeconds: 30,
        timestamp: '0:30',
        type: 'intro',
        title: 'High Curiosity Intro',
        description: '92% completed 30s hook.',
        retentionChange: -8.0,
      },
      {
        timeInSeconds: 90,
        timestamp: '1:30',
        type: 'spike',
        title: 'CDN Edge Caching Spike',
        description: 'Viewers looped the Redis caching architecture diagram.',
        retentionChange: +14.5,
      }
    ],
    dataPoints: generate10MinRetentionData(6),
  },
  {
    id: 'vid_reels_formula',
    channelId: 'ch_1',
    title: '10 Instagram Reels Virality Rules That Actually Work in 2026',
    platform: 'instagram',
    durationSeconds: 90,
    durationFormatted: '1:30',
    views: 89400,
    impressions: 420000,
    ctrPercentage: 11.2,
    avgWatchTime: '1:12',
    avgRetentionPercentage: 80.0,
    thumbnail: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&auto=format&fit=crop&q=80',
    publishedDate: '1 week ago',
    keyMoments: [
      {
        timeInSeconds: 5,
        timestamp: '0:05',
        type: 'intro',
        title: 'Text Overlay Hook',
        description: '95% retention through immediate problem statement overlay.',
        retentionChange: -5.0,
      },
      {
        timeInSeconds: 45,
        timestamp: '0:45',
        type: 'spike',
        title: 'Looping Transition',
        description: 'Seamless transition caused 24% of viewers to rewatch Rule #4.',
        retentionChange: +8.5,
      }
    ],
    dataPoints: [
      { timeInSeconds: 0, timestamp: '0:00', videoRetention: 100, benchmarkRetention: 100 },
      { timeInSeconds: 15, timestamp: '0:15', videoRetention: 92, benchmarkRetention: 85 },
      { timeInSeconds: 30, timestamp: '0:30', videoRetention: 86, benchmarkRetention: 72 },
      { timeInSeconds: 45, timestamp: '0:45', videoRetention: 94, benchmarkRetention: 64 },
      { timeInSeconds: 60, timestamp: '1:00', videoRetention: 81, benchmarkRetention: 55 },
      { timeInSeconds: 75, timestamp: '1:15', videoRetention: 76, benchmarkRetention: 48 },
      { timeInSeconds: 90, timestamp: '1:30', videoRetention: 70, benchmarkRetention: 40 },
    ]
  }
];

export const MOCK_KPIS: KPIMetric[] = [
  {
    id: 'kpi_views',
    label: 'Total Views',
    value: '1.84M',
    numericValue: 1842900,
    changePercent: 18.4,
    isPositive: true,
    timePeriod: 'vs last 28 days',
    sparkline: [120, 135, 128, 145, 160, 175, 184],
    platform: 'all',
  },
  {
    id: 'kpi_impressions',
    label: 'Total Impressions',
    value: '14.2M',
    numericValue: 14200000,
    changePercent: 12.1,
    isPositive: true,
    timePeriod: 'vs last 28 days',
    sparkline: [10, 11.2, 10.8, 12.5, 13.1, 13.8, 14.2],
    platform: 'all',
  },
  {
    id: 'kpi_ctr',
    label: 'Click-Through Rate (CTR)',
    value: '9.4%',
    numericValue: 9.4,
    changePercent: 1.8,
    isPositive: true,
    timePeriod: 'vs channel avg (7.6%)',
    sparkline: [7.2, 7.8, 8.1, 8.6, 9.0, 9.2, 9.4],
    unit: '%',
    platform: 'youtube',
  },
  {
    id: 'kpi_awt',
    label: 'Avg Watch Time (AWT)',
    value: '6:14',
    numericValue: 374,
    changePercent: -2.4,
    isPositive: false,
    timePeriod: 'vs last 28 days',
    sparkline: [390, 385, 380, 376, 370, 368, 374],
    platform: 'youtube',
  },
  {
    id: 'kpi_net_growth',
    label: 'Audience Net Growth',
    value: '+14,820',
    numericValue: 14820,
    changePercent: 24.6,
    isPositive: true,
    timePeriod: 'vs last 28 days',
    sparkline: [800, 950, 1100, 1250, 1400, 1600, 1800],
    platform: 'all',
  },
  {
    id: 'kpi_engagement',
    label: 'Avg Engagement Rate',
    value: '8.7%',
    numericValue: 8.7,
    changePercent: 3.2,
    isPositive: true,
    timePeriod: 'vs industry benchmark',
    sparkline: [6.5, 7.0, 7.4, 7.9, 8.2, 8.5, 8.7],
    unit: '%',
    platform: 'instagram',
  }
];

export const MOCK_GEOGRAPHIC: GeographicRegion[] = [
  { countryCode: 'IN', countryName: 'India', flagEmoji: '🇮🇳', views: 685000, watchTimeHours: 54200, avgWatchTime: '4:45', percentageShare: 37.2, rpmEst: 3.80 },
  { countryCode: 'US', countryName: 'United States', flagEmoji: '🇺🇸', views: 524000, watchTimeHours: 48900, avgWatchTime: '5:36', percentageShare: 28.4, rpmEst: 15.20 },
  { countryCode: 'GB', countryName: 'United Kingdom', flagEmoji: '🇬🇧', views: 198000, watchTimeHours: 18100, avgWatchTime: '5:29', percentageShare: 10.7, rpmEst: 13.40 },
  { countryCode: 'CA', countryName: 'Canada', flagEmoji: '🇨🇦', views: 142000, watchTimeHours: 13200, avgWatchTime: '5:34', percentageShare: 7.7, rpmEst: 13.90 },
  { countryCode: 'BR', countryName: 'Brazil', flagEmoji: '🇧🇷', views: 115000, watchTimeHours: 9800, avgWatchTime: '5:07', percentageShare: 6.2, rpmEst: 5.10 },
  { countryCode: 'DE', countryName: 'Germany', flagEmoji: '🇩🇪', views: 92000, watchTimeHours: 8100, avgWatchTime: '5:17', percentageShare: 5.0, rpmEst: 12.10 },
];

export const MOCK_DEMOGRAPHICS: DemographicData = {
  ageGroups: [
    { age: '13-17', percentage: 9 },
    { age: '18-24', percentage: 38 },
    { age: '25-34', percentage: 36 },
    { age: '35-44', percentage: 12 },
    { age: '45+', percentage: 5 },
  ],
  genderSplit: [
    { gender: 'Male', percentage: 67, color: '#3b82f6' },
    { gender: 'Female', percentage: 30, color: '#ec4899' },
    { gender: 'Other', percentage: 3, color: '#a855f7' },
  ],
  trafficSources: [
    { source: 'YouTube Search', percentage: 42.5, views: 783200, change: '+14.2%' },
    { source: 'Suggested Videos', percentage: 31.0, views: 571300, change: '+8.6%' },
    { source: 'Instagram Explore & Reels', percentage: 18.2, views: 335400, change: '+22.5%' },
    { source: 'External & Social Apps', percentage: 8.3, views: 153000, change: '+3.1%' },
  ],
  peakTimezones: [
    { timeSlot: '00:00 - 04:00', activityLevel: 25 },
    { timeSlot: '04:00 - 08:00', activityLevel: 15 },
    { timeSlot: '08:00 - 12:00', activityLevel: 45 },
    { timeSlot: '12:00 - 16:00', activityLevel: 85 },
    { timeSlot: '16:00 - 20:00', activityLevel: 98 },
    { timeSlot: '20:00 - 24:00', activityLevel: 62 },
  ]
};

export const MOCK_TOPICS: TopicRecommendation[] = [
  {
    id: 'topic_1',
    channelId: 'ch_1',
    title: 'Why 90% of AI Apps Fail in Production (And How We Avoided It)',
    angle: 'Architectural Teardown & Live Infrastructure Failure Case Study',
    hookScript: '"Stop building raw OpenAI wrappers! In the next 60 seconds, I\'m showing you why 9 out of 10 AI startups crash under high traffic—and the exact 3-tier architecture we used to handle 50,000 requests without breaking the bank."',
    category: 'Tech & Coding',
    expectedScore: 96,
    potentialReach: 'Viral Potential',
    targetAudienceDemographic: '18-34 Male & Tech Enthusiasts in India & United States',
    dataTrigger: '22.0% sharp drop-off at 1:30 on theoretical slides. Viewers demand real production code demos & API rate limiting architectures.',
    suggestedDuration: '12-14 mins',
    targetPlatform: 'youtube_long',
    outline: [
      '0:00-0:30 -> Hook: Show live load spike error on real app & raw bill cost',
      '0:30-3:00 -> Contrast naive API wrappers vs production queuing architecture',
      '3:00-7:00 -> Live code walkthrough of Redis rate-limiting & fallback LLM routes',
      '7:00-10:00 -> Cost breakdown: $4,200 OpenAI bill reduced to $380',
      '10:00-12:00 -> Free boilerplate GitHub repo download CTA'
    ],
    savedToCalendar: false,
  },
  {
    id: 'topic_2',
    channelId: 'ch_1',
    title: '5 Micro-Interactions That Increased Our YouTube CTR by 3.8%',
    angle: 'Visual Contrast Psychology & Thumbnail A/B Test Teardown',
    hookScript: '"We changed ONE subtle gradient on our thumbnail font and gained 40,000 extra clicks overnight. Here are 5 thumbnail micro-interactions you can copy in Figma in 60 seconds."',
    category: 'Design & UI/UX',
    expectedScore: 92,
    potentialReach: 'High',
    targetAudienceDemographic: '18-34 Creators & UI Designers in US, UK & India',
    dataTrigger: 'CTR benchmark spike to 9.4% whenever visual contrast heatmaps are shown.',
    suggestedDuration: '8-10 mins',
    targetPlatform: 'youtube_long',
    outline: [
      '0:00-1:00 -> A/B test results: 7.2% CTR vs 11.0% CTR thumbnail faceoff',
      '1:00-4:00 -> Rule 1: High saturation focal points & font tracking secrets',
      '4:00-7:00 -> Rule 2: Floating 3D mockups in Figma in 60 seconds',
      '7:00-9:00 -> Free thumbnail template pack link'
    ],
    savedToCalendar: true,
  },
  {
    id: 'topic_3',
    channelId: 'ch_2',
    title: "[Friend's Channel Strategy] Building a System Design YouTube Channel to 100K Subs",
    angle: 'Content Strategy Teardown',
    hookScript: '"How Tarun built a 100k subscriber channel by publishing 1 high-density system design breakdown per week."',
    category: 'Tech & Coding',
    expectedScore: 94,
    potentialReach: 'Very High',
    targetAudienceDemographic: '25-34 Senior Software Engineers & Tech Leads',
    dataTrigger: "High audience retention (63% average watch time) on Tarun's Netflix system design video.",
    suggestedDuration: '10-12 mins',
    targetPlatform: 'youtube_long',
    outline: [
      '0:00-0:30 -> Hook: Show channel subscriber growth chart',
      '0:30-3:00 -> Content framework & script research workflow',
      '3:00-8:00 -> Diagramming tools & animation presets',
      '8:00-10:00 -> Monolithic vs Microservices comparison'
    ],
    savedToCalendar: false,
  }
];
