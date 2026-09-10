import React, { useState } from 'react';
import {
  Sparkles,
  Zap,
  Copy,
  CalendarCheck,
  CalendarPlus,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Users,
  TrendingUp,
  RefreshCw,
  Video,
  Film,
  Smartphone,
  Layers,
  Search,
} from 'lucide-react';
import type { TopicRecommendation } from '../types/analytics';
import { MOCK_TOPICS } from '../services/mockData';

export const TopicSuggester: React.FC = () => {
  const [targetPlatform, setTargetPlatform] = useState<'all' | 'youtube_long' | 'youtube_shorts' | 'instagram_reels'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [topics, setTopics] = useState<TopicRecommendation[]>(MOCK_TOPICS);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(topics[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All Categories',
    'Tech & Coding',
    'AI & SaaS',
    'Design & UI/UX',
    'Social Media & Growth',
  ];

  const handleGenerateIdeas = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const generatedIdeas: TopicRecommendation[] = [
        {
          id: `gen_topic_${Date.now()}_1`,
          title: 'Building a Full-Stack Micro-SaaS in 48 Hours with React 19 & Tailwind v4',
          angle: 'Speed Build Challenge & Clean Architecture Walkthrough',
          hookScript: '"Most SaaS tutorials waste 2 hours on setup. In this video, we build a real paying app in 48 hours—here is the exact template stack."',
          category: 'Tech & Coding',
          expectedScore: 97,
          potentialReach: 'Viral Potential',
          targetAudienceDemographic: '18-34 Developers & Tech Founders in India, US & UK',
          dataTrigger: 'Viewer demand spike (+18.4% views) for production code builds without unnecessary slide deck theory.',
          suggestedDuration: '14-16 mins',
          targetPlatform: 'youtube_long',
          outline: [
            '0:00-0:30 -> Hook: Show stripe payment notification live on working app',
            '0:30-4:00 -> Architecture diagram: Vite + Supabase + Tailwind v4',
            '4:00-10:00 -> Live coding authentication & database tables',
            '10:00-14:00 -> Deploying to Vercel & setup automated webhooks',
            '14:00-16:00 -> Free boilerplate GitHub repository CTA'
          ],
          savedToCalendar: false,
        },
        {
          id: `gen_topic_${Date.now()}_2`,
          title: '3 UI Design Mistakes Ruining Your Web App Retention Rate',
          angle: 'UI/UX Visual Audit & Figma Fixes',
          hookScript: '"If your users leave within 10 seconds, you are likely making this critical color contrast error on your CTA buttons. Let\'s fix it in 60 seconds."',
          category: 'Design & UI/UX',
          expectedScore: 93,
          potentialReach: 'High',
          targetAudienceDemographic: '18-34 Designers & Frontend Engineers in US & India',
          dataTrigger: 'Retaining 94% viewer completion whenever UI teardowns & heatmaps are displayed.',
          suggestedDuration: '60-90 secs',
          targetPlatform: 'youtube_shorts',
          outline: [
            'Hook: Stop using grey text on dark backgrounds',
            'Mistake 1: Low contrast buttons killing conversion',
            'Mistake 2: Missing hover focus state indicators',
            'Fix: Simple Tailwind CSS glassmorphism token recipe'
          ],
          savedToCalendar: false,
        }
      ];

      setTopics([...generatedIdeas, ...topics]);
      setExpandedTopicId(generatedIdeas[0].id);
      setIsGenerating(false);
    }, 1200);
  };

  const handleToggleSaveCalendar = (id: string) => {
    setTopics((prev) =>
      prev.map((t) => (t.id === id ? { ...t, savedToCalendar: !t.savedToCalendar } : t))
    );
  };

  const handleCopyOutline = (topic: TopicRecommendation) => {
    const textToCopy = `TITLE: ${topic.title}\nHOOK: ${topic.hookScript}\nANGLE: ${topic.angle}\n\nSTRUCTURE OUTLINE:\n${topic.outline.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredTopics = topics.filter((t) => {
    const matchesPlatform = targetPlatform === 'all' || t.targetPlatform === targetPlatform;
    const matchesCategory = selectedCategory === 'All Categories' || t.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.angle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPlatform && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-creator-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-ai-cyan/10 text-ai-cyan">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">AI Content Intelligence & Topic Engine</h2>
          </div>
          <p className="text-sm text-creator-muted mt-1">
            Predictive video concept generator based on viewer drop-offs, rewatch spikes, and audience demographic demand.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-creator-card px-3.5 py-2 rounded-xl border border-creator-border text-xs text-slate-300 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Engine Model: <span className="font-bold text-ai-cyan">Antigravity LLM v2.4</span>
          </div>
          <div className="bg-amber-500/10 px-3 py-2 rounded-xl border border-amber-500/30 text-[11px] text-amber-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-amber-400" />
            AI-generated suggestions based on your analytics patterns
          </div>
        </div>
      </div>

      {/* Control Panel: Platform, Category & Generate Action */}
      <div className="glass-panel p-5 rounded-2xl border border-creator-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Dropdowns Group */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Platform Selector */}
          <div className="relative min-w-[180px]">
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as any)}
              className="w-full appearance-none bg-creator-card border border-creator-border text-white text-xs font-bold py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:border-ai-cyan transition cursor-pointer"
            >
              <option value="all">All Formats & Platforms</option>
              <option value="youtube_long">YouTube Long-Form</option>
              <option value="youtube_shorts">YouTube Shorts</option>
              <option value="instagram_reels">Instagram Reels</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-creator-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Category Dropdown */}
          <div className="relative min-w-[170px]">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full appearance-none bg-creator-card border border-creator-border text-white text-xs font-bold py-2.5 px-3 pr-8 rounded-xl focus:outline-none focus:border-ai-cyan transition cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-creator-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Filter Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-creator-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topic keywords..."
              className="w-full bg-creator-card border border-creator-border text-white text-xs py-2.5 pl-9 pr-3 rounded-xl focus:outline-none focus:border-ai-cyan"
            />
          </div>
        </div>

        {/* Generate High-Retention Ideas Button */}
        <button
          onClick={handleGenerateIdeas}
          disabled={isGenerating}
          className="px-6 py-2.5 bg-gradient-to-r from-ai-cyan via-ai-indigo to-ai-purple hover:from-cyan-400 hover:to-purple-500 text-white text-xs font-extrabold rounded-xl transition shadow-glow-cyan flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              Scanning Retention Patterns...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              Generate High-Retention Ideas
            </>
          )}
        </button>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="glass-panel p-10 rounded-2xl border border-creator-border text-center text-creator-muted space-y-3">
            <Layers className="w-10 h-10 text-creator-border mx-auto" />
            <p className="text-sm font-semibold">No topic recommendations match your current filters.</p>
            <button
              onClick={() => {
                setTargetPlatform('all');
                setSelectedCategory('All Categories');
                setSearchQuery('');
              }}
              className="text-xs text-ai-cyan hover:underline font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredTopics.map((topic) => {
            const isExpanded = expandedTopicId === topic.id;

            return (
              <div
                key={topic.id}
                className={`glass-panel rounded-2xl border transition-all duration-200 ${
                  isExpanded
                    ? 'border-ai-cyan shadow-glow-cyan bg-creator-card/90'
                    : 'border-creator-border hover:border-slate-600'
                }`}
              >
                {/* Header Card Area */}
                <div className="p-5 space-y-3">
                  {/* Badges Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Virality Demand Score Badge */}
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-ai-cyan/20 text-ai-cyan border border-ai-cyan/40 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" />
                        Demand Score: {topic.expectedScore}/100
                      </span>

                      {/* Format Badge */}
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-300 flex items-center gap-1">
                        {topic.targetPlatform === 'youtube_long' ? (
                          <Video className="w-3 h-3 text-yt-red" />
                        ) : topic.targetPlatform === 'youtube_shorts' ? (
                          <Film className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Smartphone className="w-3 h-3 text-ig-pink" />
                        )}
                        {topic.targetPlatform === 'youtube_long'
                          ? 'YouTube Long-Form'
                          : topic.targetPlatform === 'youtube_shorts'
                          ? 'YouTube Shorts'
                          : 'Instagram Reels'}
                      </span>

                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-400">
                        {topic.potentialReach}
                      </span>
                    </div>

                    {/* Saved Badge if applicable */}
                    {topic.savedToCalendar && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center gap-1">
                        <CalendarCheck className="w-3 h-3 text-indigo-400" /> Saved to Calendar
                      </span>
                    )}
                  </div>

                  {/* Title & Angle */}
                  <div>
                    <h3 className="text-lg font-extrabold text-white tracking-tight leading-snug">
                      {topic.title}
                    </h3>
                    <p className="text-xs text-creator-muted mt-1">
                      <span className="font-semibold text-slate-300">Hook Angle:</span> {topic.angle}
                    </p>
                  </div>

                  {/* Target Demographic Pill */}
                  <div className="flex items-center gap-2 text-xs text-creator-muted bg-creator-bg p-2.5 rounded-xl border border-creator-border/60">
                    <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>
                      <strong className="text-slate-200">Target Demographic:</strong> {topic.targetAudienceDemographic}
                    </span>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-creator-border/50">
                    <button
                      onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      className="text-xs font-bold text-ai-cyan hover:underline flex items-center gap-1"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {isExpanded ? 'Hide Script & Data Rationale' : 'Inspect Script Hook & Data Rationale'}
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Copy Outline Button */}
                      <button
                        onClick={() => handleCopyOutline(topic)}
                        className="px-3 py-1.5 rounded-xl bg-creator-card border border-creator-border hover:border-slate-500 text-xs font-semibold text-creator-muted hover:text-white transition flex items-center gap-1.5"
                        title="Copy Script Structure & Outline"
                      >
                        {copiedId === topic.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Outline
                          </>
                        )}
                      </button>

                      {/* Save to Content Calendar Button */}
                      <button
                        onClick={() => handleToggleSaveCalendar(topic.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                          topic.savedToCalendar
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50'
                            : 'bg-creator-hover border border-creator-border text-white hover:border-ai-cyan'
                        }`}
                      >
                        {topic.savedToCalendar ? (
                          <>
                            <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                            Saved
                          </>
                        ) : (
                          <>
                            <CalendarPlus className="w-3.5 h-3.5 text-ai-cyan" />
                            Save to Content Calendar
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-3 border-t border-creator-border space-y-4 animate-in fade-in duration-200">
                    {/* Suggested Hook Script */}
                    <div className="p-3.5 bg-cyan-950/30 border border-ai-cyan/30 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-ai-cyan uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        First 5-30 Seconds Script Hook Concept
                      </div>
                      <p className="text-xs text-cyan-100 font-mono leading-relaxed italic">
                        {topic.hookScript}
                      </p>
                    </div>

                    {/* Data Rationale Box */}
                    <div className="p-3.5 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
                        Why this will perform (Data-backed Rationale)
                      </div>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {topic.dataTrigger}
                      </p>
                    </div>

                    {/* Structure Outline */}
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-ai-cyan" />
                        Suggested Video Section Outline ({topic.suggestedDuration})
                      </h4>
                      <div className="space-y-1.5 bg-creator-bg p-3.5 rounded-xl border border-creator-border">
                        {topic.outline.map((step, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="font-mono text-ai-cyan text-[11px] font-bold shrink-0 mt-0.5">
                              Step {idx + 1}:
                            </span>
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
