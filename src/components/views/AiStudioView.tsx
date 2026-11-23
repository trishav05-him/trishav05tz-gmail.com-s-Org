import React, { useMemo, useState } from 'react';
import {
  Check,
  Download,
  ExternalLink,
  Film,
  Globe,
  Image as ImageIcon,
  Loader2,
  MapPin,
  Mic,
  Music,
  Plus,
  Search,
  Sparkles,
  Upload,
  Video,
} from 'lucide-react';
import { APP_CONFIG } from '../../config/appConfig';
import { usePlatform } from '../../context/PlatformContext';
import { LiveVoicePanel } from '../ai/LiveVoicePanel';
import { AudioTranscribePanel } from '../ai/AudioTranscribePanel';

type StudioTab = 'grounding' | 'voice' | 'image' | 'video' | 'music';

function fileToBase64(file: File): Promise<{ base64: string; mimeType: string; dataUrl: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = dataUrl.indexOf(',');
      const base64 = commaIdx >= 0 ? dataUrl.slice(commaIdx + 1) : dataUrl;
      resolve({
        base64,
        mimeType: file.type || 'image/png',
        dataUrl,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const AiStudioView: React.FC = () => {
  const { currentUser, subjects, addResource, setActiveSection } = usePlatform();
  const [activeTab, setActiveTab] = useState<StudioTab>('grounding');

  // Search Grounding state (gemini-4-hydrogen + googleSearch)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<{
    text: string;
    sources: { uri: string; title: string }[];
  } | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Maps Grounding state (gemini-4-hydrogen + googleMaps)
  const [mapsQuery, setMapsQuery] = useState('');
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsCoords, setMapsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapsLocStatus, setMapsLocStatus] = useState<string | null>(null);
  const [mapsResult, setMapsResult] = useState<{
    text: string;
    places: { title: string; uri: string; reviewSnippets: string[] }[];
  } | null>(null);
  const [mapsError, setMapsError] = useState<string | null>(null);

  // Image Studio state (gemini-nano-banana-2.1)
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageAspect, setImageAspect] = useState<'1:1' | '16:9' | '9:16' | '4:3' | '3:4'>('1:1');
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [imageInputPreview, setImageInputPreview] = useState<string | null>(null);
  const [imageInputBase64, setImageInputBase64] = useState<string | null>(null);
  const [imageInputMime, setImageInputMime] = useState<string>('image/png');
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageText, setGeneratedImageText] = useState<string>('');
  const [imageError, setImageError] = useState<string | null>(null);
  const [imageSaveSubject, setImageSaveSubject] = useState(subjects[0]?.id ?? 'bio');
  const [imageSaved, setImageSaved] = useState(false);

  // Video Studio state (gemini-omni-1.2-flash via Interactions API)
  const [videoMode, setVideoMode] = useState<'text-to-video' | 'animate-image'>('text-to-video');
  const [videoPrompt, setVideoPrompt] = useState('');
  const [videoAspect, setVideoAspect] = useState<'16:9' | '9:16'>('16:9');
  const [videoDuration, setVideoDuration] = useState<'5s' | '10s'>('10s');
  const [videoRes, setVideoRes] = useState<'720p' | '1080p'>('720p');
  const [videoFramePreview, setVideoFramePreview] = useState<string | null>(null);
  const [videoFrameBase64, setVideoFrameBase64] = useState<string | null>(null);
  const [videoFrameMime, setVideoFrameMime] = useState<string>('image/png');
  const [videoLoading, setVideoLoading] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Music Studio state (lyria-3-clip-preview & lyria-3-pro-preview)
  const [musicMode, setMusicMode] = useState<'clip' | 'pro'>('clip');
  const [musicPrompt, setMusicPrompt] = useState('');
  const [musicImagePreview, setMusicImagePreview] = useState<string | null>(null);
  const [musicImageBase64, setMusicImageBase64] = useState<string | null>(null);
  const [musicImageMime, setMusicImageMime] = useState<string>('image/jpeg');
  const [musicLoading, setMusicLoading] = useState(false);
  const [generatedAudioUrl, setGeneratedAudioUrl] = useState<string | null>(null);
  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [musicError, setMusicError] = useState<string | null>(null);

  const studentContextString = useMemo(() => {
    const name = currentUser?.name || 'the student';
    const grade = currentUser?.gradeLevel || APP_CONFIG.defaultYearLevel;
    const country = currentUser?.country || APP_CONFIG.defaultCountry;
    const age = currentUser?.age || APP_CONFIG.defaultAge;
    return `You are helping ${name}, a secondary school student (${grade}, ${country}, age ${age}). Keep explanations accurate, clear, and aligned to their level.`;
  }, [currentUser]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchLoading(true);
    setSearchError(null);
    try {
      const res = await fetch('/api/gemini/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          systemInstruction: studentContextString,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Search grounding request failed.');
      setSearchResult({ text: data.text || '', sources: data.sources || [] });
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : 'Search failed.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleUseLocation = () => {
    if (!('geolocation' in navigator)) {
      setMapsLocStatus('Browser geolocation is unavailable; include a city or suburb in your query.');
      return;
    }
    setMapsLocStatus('Requesting location...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setMapsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setMapsLocStatus(
          `Location attached (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}).`
        );
      },
      () => {
        setMapsLocStatus('Location permission denied; type a city or neighbourhood in your query.');
      }
    );
  };

  const handleMapsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mapsQuery.trim()) return;
    setMapsLoading(true);
    setMapsError(null);
    try {
      const res = await fetch('/api/gemini/maps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery.trim(),
          latLng: mapsCoords ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Maps grounding request failed.');
      setMapsResult({ text: data.text || '', places: data.places || [] });
    } catch (err) {
      setMapsError(err instanceof Error ? err.message : 'Maps query failed.');
    } finally {
      setMapsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType, dataUrl } = await fileToBase64(file);
    setImageInputBase64(base64);
    setImageInputMime(mimeType);
    setImageInputPreview(dataUrl);
  };

  const handleImageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setImageError(null);
    setImageSaved(false);
    try {
      const res = await fetch('/api/gemini/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          aspectRatio: imageAspect,
          imageSize,
          imageBase64: imageInputBase64 ?? undefined,
          imageMimeType: imageInputBase64 ? imageInputMime : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Image generation failed.');
      setGeneratedImageUrl(data.imageDataUrl);
      setGeneratedImageText(data.text || '');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Image generation failed.');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSaveGeneratedImage = () => {
    if (!generatedImageUrl) return;
    addResource({
      subjectId: imageSaveSubject,
      title: `Study Visual: ${imagePrompt.trim().slice(0, 48)}`,
      type: 'image',
      accessStatus: 'accessible',
      processingStatus: 'extracted',
      identifiedTopics: ['Visual Diagram'],
      accessMode: 'Local file',
      sourceReference: 'Generated via gemini-nano-banana-2.1',
      ownerOrPublisher: currentUser?.name || 'Student Study Visual',
      summaryPreview: imagePrompt.trim(),
      verifiedExcerpts: [
        {
          location: 'Diagram Prompt',
          text: imagePrompt.trim(),
        },
      ],
    });
    setImageSaved(true);
  };

  const handleVideoFrameUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType, dataUrl } = await fileToBase64(file);
    setVideoFrameBase64(base64);
    setVideoFrameMime(mimeType);
    setVideoFramePreview(dataUrl);
    setVideoMode('animate-image');
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoPrompt.trim()) return;
    if (videoMode === 'animate-image' && !videoFrameBase64) {
      setVideoError('Please upload a starting photo to animate, or switch to Text-to-Video.');
      return;
    }
    setVideoLoading(true);
    setVideoError(null);
    try {
      const res = await fetch('/api/gemini/video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspect,
          duration: videoDuration,
          resolution: videoRes,
          imageBase64: videoMode === 'animate-image' ? videoFrameBase64 : undefined,
          imageMimeType: videoMode === 'animate-image' ? videoFrameMime : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed.');
      setGeneratedVideoUrl(data.videoDataUrl || data.videoUri || null);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Video generation failed.');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleMusicImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { base64, mimeType, dataUrl } = await fileToBase64(file);
    setMusicImageBase64(base64);
    setMusicImageMime(mimeType);
    setMusicImagePreview(dataUrl);
  };

  const handleMusicSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!musicPrompt.trim()) return;
    setMusicLoading(true);
    setMusicError(null);
    try {
      const res = await fetch('/api/gemini/music', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: musicPrompt.trim(),
          mode: musicMode,
          imageBase64: musicImageBase64 ?? undefined,
          imageMimeType: musicImageBase64 ? musicImageMime : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Music generation failed.');
      setGeneratedAudioUrl(data.audioDataUrl || null);
      setGeneratedLyrics(data.lyrics || '');
    } catch (err) {
      setMusicError(err instanceof Error ? err.message : 'Music generation failed.');
    } finally {
      setMusicLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header & Sub-Navigation */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="font-display text-xl font-semibold text-white">
                AI Media, Voice &amp; Grounding Lab
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Web Search &amp; Google Maps research, Live Voice conversations, microphone transcription, study diagrams, explainer videos, and focus tracks.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveSection('tutor')}
            className="px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap self-start lg:self-auto"
          >
            Open Multi-Turn AI Tutor →
          </button>
        </div>

        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-800">
          {(
            [
              { id: 'grounding', label: 'Search & Maps', icon: Globe },
              { id: 'voice', label: 'Voice & Transcribe', icon: Mic },
              { id: 'image', label: 'Create & Edit Images', icon: ImageIcon },
              { id: 'video', label: 'Video & Animate Photo', icon: Video },
              { id: 'music', label: 'Generate Music', icon: Music },
            ] as { id: StudioTab; label: string; icon: React.ComponentType<{ className?: string }> }[]
          ).map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-[#162647] text-cyan-300 border border-cyan-400/40'
                    : 'bg-[#0B1528] text-slate-300 border border-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-cyan-400' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* TAB 1: GOOGLE SEARCH & GOOGLE MAPS GROUNDING */}
      {activeTab === 'grounding' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Google Search Grounding */}
          <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" />
                <h3 className="font-display text-lg font-semibold text-white">
                  Google Search Grounding
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <span className="font-mono text-cyan-300">gemini-4-hydrogen</span> with <span className="font-mono">googleSearch</span> · Up-to-date syllabus facts &amp; cited web sources.
              </p>
            </div>

            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask a current curriculum or fact-check question..."
                className="flex-1 px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={searchLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg whitespace-nowrap"
              >
                {searchLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                Search
              </button>
            </form>

            {searchError && (
              <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                {searchError}
              </p>
            )}

            {searchResult && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {searchResult.text}
                </div>
                {searchResult.sources.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-cyan-400">Verified web sources</p>
                    <div className="space-y-1.5">
                      {searchResult.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src.uri}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-2 p-2.5 bg-[#0B1528] border border-slate-800 hover:border-cyan-400/40 rounded-lg text-xs text-cyan-300"
                        >
                          <span className="truncate">{src.title}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Google Maps Grounding */}
          <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <h3 className="font-display text-lg font-semibold text-white">
                    Study Spaces &amp; Maps Grounding
                  </h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Model: <span className="font-mono text-cyan-300">gemini-4-hydrogen</span> with <span className="font-mono">googleMaps</span> · Find quiet libraries, museums, or fieldwork sites.
                </p>
              </div>
              <button
                type="button"
                onClick={handleUseLocation}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg whitespace-nowrap shrink-0"
              >
                <MapPin className="w-3 h-3" />
                Use my location
              </button>
            </div>

            {mapsLocStatus && (
              <p className="text-[11px] text-slate-400">{mapsLocStatus}</p>
            )}

            <form onSubmit={handleMapsSubmit} className="flex gap-2">
              <input
                type="text"
                required
                value={mapsQuery}
                onChange={(e) => setMapsQuery(e.target.value)}
                placeholder="e.g. Quiet public libraries or science museums nearby"
                className="flex-1 px-3.5 py-2.5 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <button
                type="submit"
                disabled={mapsLoading}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-lg whitespace-nowrap"
              >
                {mapsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                Find places
              </button>
            </form>

            {mapsError && (
              <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                {mapsError}
              </p>
            )}

            {mapsResult && (
              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div className="p-4 bg-[#0B1528] border border-slate-800 rounded-xl text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {mapsResult.text}
                </div>
                {mapsResult.places.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-cyan-400">Google Maps places</p>
                    <div className="space-y-2">
                      {mapsResult.places.map((pl, i) => (
                        <div
                          key={i}
                          className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1.5"
                        >
                          {pl.uri ? (
                            <a
                              href={pl.uri}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-300 hover:underline"
                            >
                              {pl.title}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <p className="text-xs font-semibold text-white">{pl.title}</p>
                          )}
                          {pl.reviewSnippets.length > 0 && (
                            <ul className="text-[11px] text-slate-400 list-disc pl-4 space-y-0.5">
                              {pl.reviewSnippets.slice(0, 2).map((sn, idx) => (
                                <li key={idx}>{sn}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: VOICE CONVERSATIONS & AUDIO TRANSCRIPTION */}
      {activeTab === 'voice' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <LiveVoicePanel
            defaultSystemInstruction={`${studentContextString} Speak concisely and teach using Socratic questions before giving away answers.`}
          />
          <AudioTranscribePanel />
        </div>
      )}

      {/* TAB 3: CREATE & EDIT IMAGES (gemini-nano-banana-2.1) */}
      {activeTab === 'image' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Create &amp; Edit Study Visuals
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <span className="font-mono text-cyan-300">gemini-nano-banana-2.1</span> · Requires a billing-enabled key in Settings &gt; Secrets.
              </p>
            </div>
          </div>

          <form onSubmit={handleImageSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Prompt (create new visual or describe how to edit the uploaded image)
                </label>
                <textarea
                  rows={3}
                  required
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="e.g. Clean labelled cross-section diagram of a plant chloroplast showing light-dependent reactions and Calvin cycle"
                  className="w-full p-3 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Aspect ratio
                  </label>
                  <select
                    value={imageAspect}
                    onChange={(e) =>
                      setImageAspect(
                        e.target.value as '1:1' | '16:9' | '9:16' | '4:3' | '3:4'
                      )
                    }
                    className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="1:1">1:1 Square</option>
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                    <option value="4:3">4:3 Standard</option>
                    <option value="3:4">3:4 Tall</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Resolution
                  </label>
                  <select
                    value={imageSize}
                    onChange={(e) => setImageSize(e.target.value as '1K' | '2K' | '4K')}
                    className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Optional source image to edit
                  </label>
                  {imageInputPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setImageInputPreview(null);
                        setImageInputBase64(null);
                      }}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Clear image
                    </button>
                  )}
                </div>
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl bg-[#0B1528] text-xs text-slate-300 cursor-pointer">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{imageInputPreview ? 'Replace source image' : 'Upload photo or diagram to edit'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="sr-only"
                  />
                </label>
                {imageInputPreview && (
                  <img
                    src={imageInputPreview}
                    alt="Uploaded source for editing"
                    className="max-h-36 rounded-lg border border-slate-800 object-contain"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={imageLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl"
              >
                {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                {imageLoading
                  ? 'Generating with Nano Banana 2.1...'
                  : imageInputBase64
                  ? 'Edit image'
                  : 'Create image'}
              </button>

              {imageError && (
                <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                  {imageError}
                </p>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#0B1528] border border-slate-800 rounded-xl p-5 flex flex-col justify-between gap-4 min-h-[320px]">
              {generatedImageUrl ? (
                <>
                  <img
                    src={generatedImageUrl}
                    alt="Generated study visual"
                    className="w-full max-h-[420px] object-contain rounded-lg"
                  />
                  {generatedImageText && (
                    <p className="text-xs text-slate-300">{generatedImageText}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center gap-2">
                      <select
                        value={imageSaveSubject}
                        onChange={(e) => setImageSaveSubject(e.target.value)}
                        className="px-2.5 py-1.5 text-xs bg-[#0F1B33] border border-slate-700 text-slate-200 rounded-lg"
                      >
                        {subjects.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleSaveGeneratedImage}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-400/30 rounded-lg"
                      >
                        {imageSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        {imageSaved ? 'Saved' : 'Save to Resources'}
                      </button>
                    </div>
                    <a
                      href={generatedImageUrl}
                      download="study-visual.png"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] border border-slate-700 rounded-lg"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-slate-500 text-center">
                  Your generated or edited image will appear here.
                </div>
              )}
            </div>
          </form>
        </section>
      )}

      {/* TAB 4: TEXT-TO-VIDEO & ANIMATE PHOTO (gemini-omni-1.2-flash via Interactions API) */}
      {activeTab === 'video' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Concept Video &amp; Image Animation
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Model: <span className="font-mono text-cyan-300">gemini-omni-1.2-flash</span> via Interactions API · Requires a billing-enabled key in Settings &gt; Secrets.
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 bg-[#0B1528] border border-slate-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setVideoMode('text-to-video')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  videoMode === 'text-to-video' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400'
                }`}
              >
                Text to Video
              </button>
              <button
                type="button"
                onClick={() => setVideoMode('animate-image')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                  videoMode === 'animate-image' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400'
                }`}
              >
                Animate Photo
              </button>
            </div>
          </div>

          <form onSubmit={handleVideoSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 space-y-4">
              {videoMode === 'animate-image' && (
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">
                    Starting photo to animate
                  </label>
                  <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl bg-[#0B1528] text-xs text-slate-300 cursor-pointer">
                    <Upload className="w-4 h-4 text-cyan-400" />
                    <span>{videoFramePreview ? 'Replace photo' : 'Upload photo to animate'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleVideoFrameUpload}
                      className="sr-only"
                    />
                  </label>
                  {videoFramePreview && (
                    <img
                      src={videoFramePreview}
                      alt="Starting frame"
                      className="max-h-36 rounded-lg border border-slate-800 object-contain"
                    />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {videoMode === 'animate-image' ? 'Motion & scene instruction' : 'Video prompt'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder={
                    videoMode === 'animate-image'
                      ? 'e.g. Gently animate the water ripples and sunlight rays passing across the leaf cells'
                      : 'e.g. Clear 3D educational animation showing blood flowing through chambers of the human heart'
                  }
                  className="w-full p-3 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Aspect ratio
                  </label>
                  <select
                    value={videoAspect}
                    onChange={(e) => setVideoAspect(e.target.value as '16:9' | '9:16')}
                    className="w-full px-2.5 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="16:9">16:9 Landscape</option>
                    <option value="9:16">9:16 Portrait</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Duration
                  </label>
                  <select
                    value={videoDuration}
                    onChange={(e) => setVideoDuration(e.target.value as '5s' | '10s')}
                    className="w-full px-2.5 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="5s">5 seconds</option>
                    <option value="10s">10 seconds</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Resolution
                  </label>
                  <select
                    value={videoRes}
                    onChange={(e) => setVideoRes(e.target.value as '720p' | '1080p')}
                    className="w-full px-2.5 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={videoLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl"
              >
                {videoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                {videoLoading
                  ? 'Rendering video (may take a minute)...'
                  : videoMode === 'animate-image'
                  ? 'Animate image into video'
                  : 'Generate video'}
              </button>

              {videoError && (
                <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                  {videoError}
                </p>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#0B1528] border border-slate-800 rounded-xl p-5 flex flex-col justify-center items-center min-h-[320px] gap-3">
              {generatedVideoUrl ? (
                <>
                  <video
                    controls
                    src={generatedVideoUrl}
                    className="w-full max-h-[420px] rounded-lg bg-black"
                  />
                  <a
                    href={generatedVideoUrl}
                    download="study-clip.mp4"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] border border-slate-700 rounded-lg self-end"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download video
                  </a>
                </>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Your {videoAspect} generated video will appear here.
                </p>
              )}
            </div>
          </form>
        </section>
      )}

      {/* TAB 5: GENERATE MUSIC (lyria-3-clip-preview / lyria-3-pro-preview) */}
      {activeTab === 'music' && (
        <section className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-white">
                Focus Soundtrack &amp; Mnemonic Music Generator
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Models: <span className="font-mono text-cyan-300">lyria-3-clip-preview</span> (30s) &amp;{' '}
                <span className="font-mono text-cyan-300">lyria-3-pro-preview</span> (full-length) · Requires a billing-enabled key in Settings &gt; Secrets.
              </p>
            </div>

            <div className="grid grid-cols-2 p-1 bg-[#0B1528] border border-slate-800 rounded-lg self-start">
              <button
                type="button"
                onClick={() => setMusicMode('clip')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  musicMode === 'clip' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400'
                }`}
              >
                30s Clip (Lyria Clip)
              </button>
              <button
                type="button"
                onClick={() => setMusicMode('pro')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  musicMode === 'pro' ? 'bg-[#162647] text-cyan-300' : 'text-slate-400'
                }`}
              >
                Full Track (Lyria Pro)
              </button>
            </div>
          </div>

          <form onSubmit={handleMusicSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Music prompt (ambient focus beat, lo-fi study track, or educational song)
                </label>
                <textarea
                  rows={3}
                  required
                  value={musicPrompt}
                  onChange={(e) => setMusicPrompt(e.target.value)}
                  placeholder="e.g. Calm lo-fi ambient piano and soft synth track at 72 BPM for deep math revision"
                  className="w-full p-3 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-xl"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-400">
                    Optional inspiration image
                  </label>
                  {musicImagePreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setMusicImagePreview(null);
                        setMusicImageBase64(null);
                      }}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <label className="flex items-center justify-center gap-2 p-3 border border-dashed border-slate-700 hover:border-cyan-400/50 rounded-xl bg-[#0B1528] text-xs text-slate-300 cursor-pointer">
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span>{musicImagePreview ? 'Replace image' : 'Upload scene image (optional)'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleMusicImageUpload}
                    className="sr-only"
                  />
                </label>
                {musicImagePreview && (
                  <img
                    src={musicImagePreview}
                    alt="Music inspiration"
                    className="max-h-32 rounded-lg border border-slate-800 object-contain"
                  />
                )}
              </div>

              <button
                type="submit"
                disabled={musicLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 rounded-xl"
              >
                {musicLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
                {musicLoading
                  ? 'Composing track...'
                  : musicMode === 'pro'
                  ? 'Generate Full Track'
                  : 'Generate 30s Clip'}
              </button>

              {musicError && (
                <p className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
                  {musicError}
                </p>
              )}
            </div>

            <div className="lg:col-span-7 bg-[#0B1528] border border-slate-800 rounded-xl p-5 flex flex-col justify-center gap-4 min-h-[260px]">
              {generatedAudioUrl ? (
                <>
                  <audio controls src={generatedAudioUrl} className="w-full" />
                  {generatedLyrics && (
                    <div className="p-3.5 bg-[#0F1B33] border border-slate-800 rounded-xl text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                      {generatedLyrics}
                    </div>
                  )}
                  <a
                    href={generatedAudioUrl}
                    download="study-track.mp3"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-[#13223D] border border-slate-700 rounded-lg self-end"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download audio
                  </a>
                </>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Your generated study track will play here.
                </p>
              )}
            </div>
          </form>
        </section>
      )}
    </div>
  );
};
