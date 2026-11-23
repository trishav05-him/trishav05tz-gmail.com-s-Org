import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  ExternalLink,
  FolderOpen,
  Layers,
  MessageSquareText,
  Plus,
  Search,
} from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ResourceAccessStatus,
  ResourceItem,
  ResourceProcessingStatus,
  ResourceType,
} from '../../types/platform';
import { ResourceCard } from '../common/ResourceCard';
import {
  ProcessingStatusIndicator,
  formatResourceTypeLabel,
} from '../common/StatusLabels';

const RESOURCE_TYPES: ResourceType[] = [
  'google-doc',
  'google-slides',
  'google-sheet',
  'google-drive',
  'youtube',
  'article',
  'pdf',
  'image',
  'typed-note',
];

export const ResourcesView: React.FC = () => {
  const {
    subjects,
    topics,
    resources,
    addResource,
    updateResourceTopics,
    openInTutor,
    openInStudyTools,
  } = usePlatform();

  const [viewMode, setViewMode] = useState<'list' | 'libraries'>('list');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<ResourceType | 'all'>('all');
  const [processingFilter, setProcessingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResourceId, setSelectedResourceId] = useState<string>(
    resources[0]?.id ?? ''
  );

  const [showAddPanel, setShowAddPanel] = useState(false);
  const [addMode, setAddMode] = useState<'link' | 'file' | 'note'>('link');
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState(subjects[0]?.id ?? 'bio');
  const [formType, setFormType] = useState<ResourceType>('google-doc');
  const [formReference, setFormReference] = useState('');
  const [formProcessingSim, setFormProcessingSim] =
    useState<ResourceProcessingStatus>('extracted');
  const [formSelectedTopicIds, setFormSelectedTopicIds] = useState<string[]>([]);
  const [formNoteBody, setFormNoteBody] = useState('');

  const subjectById = useMemo(
    () => Object.fromEntries(subjects.map((s) => [s.id, s])),
    [subjects]
  );

  const filteredResources = useMemo(() => {
    return resources.filter((r) => {
      if (subjectFilter !== 'all' && r.subjectId !== subjectFilter) return false;
      if (typeFilter !== 'all' && r.type !== typeFilter) return false;
      if (processingFilter === 'extracted' && r.processingStatus !== 'extracted') return false;
      if (processingFilter === 'unanalysed' && r.processingStatus === 'extracted') return false;
      if (
        searchQuery.trim() &&
        !r.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !r.summaryPreview.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        return false;
      }
      return true;
    });
  }, [resources, subjectFilter, typeFilter, processingFilter, searchQuery]);

  const activeResource: ResourceItem | undefined =
    resources.find((r) => r.id === selectedResourceId) ?? filteredResources[0];

  const subjectTopicsForForm = useMemo(
    () => topics.filter((t) => t.subjectId === formSubjectId),
    [topics, formSubjectId]
  );

  const handleAddResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const chosenType: ResourceType =
      addMode === 'note'
        ? 'typed-note'
        : addMode === 'file'
        ? formType === 'image'
          ? 'image'
          : 'pdf'
        : formType;

    const processingStatus: ResourceProcessingStatus =
      addMode === 'link' ? formProcessingSim : 'extracted';

    const accessStatus: ResourceAccessStatus =
      processingStatus === 'auth-required'
        ? 'auth-required'
        : processingStatus === 'restricted'
        ? 'restricted'
        : 'accessible';

    const accessNotice =
      processingStatus === 'transcript-unavailable'
        ? 'Transcript unavailable: captions are disabled on this video, so the platform has NOT analysed its contents or used it for study generation.'
        : processingStatus === 'auth-required'
        ? 'Private Google / cloud link detected. Read-only authorisation is required before contents can be extracted.'
        : processingStatus === 'restricted'
        ? 'Domain policy blocks automated read-only previews for this URL. This source has not been analysed.'
        : undefined;

    addResource({
      subjectId: formSubjectId,
      title: formTitle.trim(),
      type: chosenType,
      accessStatus,
      processingStatus,
      identifiedTopics: formSelectedTopicIds,
      accessMode:
        addMode === 'note'
          ? 'User note'
          : addMode === 'file'
          ? 'Local file'
          : 'Read-only link',
      sourceReference:
        addMode === 'note'
          ? 'Typed Note · Saved locally in workspace'
          : formReference.trim() || 'Added in Resource Centre',
      ownerOrPublisher: 'Added by student',
      summaryPreview:
        addMode === 'note'
          ? formNoteBody.trim().slice(0, 140) || 'Student-written revision note.'
          : processingStatus === 'extracted'
          ? 'Source processed and indexed for AI Tutor & Study Tools.'
          : 'Saved to your subject library; content has not been analysed.',
      accessNotice,
      verifiedExcerpts:
        addMode === 'note' && formNoteBody.trim()
          ? [{ location: 'Student Note Excerpt', text: formNoteBody.trim() }]
          : processingStatus === 'extracted'
          ? [
              {
                location: 'Indexed Summary Section',
                text: `Student resource "${formTitle.trim()}" linked to ${subjectById[formSubjectId]?.name ?? 'subject'} topics.`,
              },
            ]
          : [],
    });

    setFormTitle('');
    setFormReference('');
    setFormNoteBody('');
    setFormSelectedTopicIds([]);
    setShowAddPanel(false);
  };

  const toggleTopicOnActiveResource = (topicId: string) => {
    if (!activeResource) return;
    const exists = activeResource.identifiedTopics.includes(topicId);
    const updated = exists
      ? activeResource.identifiedTopics.filter((id) => id !== topicId)
      : [...activeResource.identifiedTopics, topicId];
    updateResourceTopics(activeResource.id, updated);
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Bar */}
      <section className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <h2 className="font-display text-xl font-semibold text-white">
              Resource Centre &amp; Subject Libraries
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Organise Docs, Slides, Sheets, Drive, YouTube, articles, PDFs, images, and notes. Inaccessible or uncaptioned links stay marked unanalysed.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <div className="inline-flex p-1 bg-[#0B1528] rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  viewMode === 'list'
                    ? 'bg-[#162647] text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                All Resources
              </button>
              <button
                type="button"
                onClick={() => setViewMode('libraries')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  viewMode === 'libraries'
                    ? 'bg-[#162647] text-cyan-300'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Subject Libraries
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowAddPanel((v) => !v)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              {showAddPanel ? 'Close form' : 'Add resource'}
            </button>
          </div>
        </div>

        {showAddPanel && (
          <form
            onSubmit={handleAddResource}
            className="pt-5 border-t border-slate-800 space-y-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex p-1 bg-[#0B1528] rounded-lg border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddMode('link');
                    setFormType('google-doc');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    addMode === 'link'
                      ? 'bg-[#162647] text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Paste Link / Google File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMode('file');
                    setFormType('pdf');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    addMode === 'file'
                      ? 'bg-[#162647] text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  PDF / Image (Local)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAddMode('note');
                    setFormType('typed-note');
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    addMode === 'note'
                      ? 'bg-[#162647] text-cyan-300'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Write Typed Note
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="lg:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Resource title
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Photosynthesis Light Reactions Guide"
                  className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Subject library
                </label>
                <select
                  value={formSubjectId}
                  onChange={(e) => {
                    setFormSubjectId(e.target.value);
                    setFormSelectedTopicIds([]);
                  }}
                  className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {addMode !== 'note' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Resource type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as ResourceType)}
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    {(addMode === 'file'
                      ? (['pdf', 'image'] as ResourceType[])
                      : ([
                          'google-doc',
                          'google-slides',
                          'google-sheet',
                          'google-drive',
                          'youtube',
                          'article',
                        ] as ResourceType[])
                    ).map((t) => (
                      <option key={t} value={t}>
                        {formatResourceTypeLabel(t)}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {addMode === 'link' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Source URL / Reference
                  </label>
                  <input
                    type="text"
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="https://docs.google.com/... or youtube.com/..."
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Processing &amp; access status (Prototype check)
                  </label>
                  <select
                    value={formProcessingSim}
                    onChange={(e) =>
                      setFormProcessingSim(e.target.value as ResourceProcessingStatus)
                    }
                    className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
                  >
                    <option value="extracted">Processed — readable text / transcript available</option>
                    <option value="transcript-unavailable">
                      YouTube transcript unavailable — not analysed
                    </option>
                    <option value="auth-required">
                      Private link — authorisation required
                    </option>
                    <option value="restricted">Restricted domain — access blocked</option>
                  </select>
                </div>
              </div>
            )}

            {addMode === 'file' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Select local PDF or image (metadata saved locally)
                </label>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!formTitle) setFormTitle(file.name);
                      setFormReference(
                        `Local file · ${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`
                      );
                    }
                  }}
                  className="block w-full text-xs text-slate-300 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border file:border-slate-700 file:text-xs file:font-medium file:bg-[#13223D] file:text-cyan-300 hover:file:bg-[#192D50]"
                />
              </div>
            )}

            {addMode === 'note' && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Note content
                </label>
                <textarea
                  rows={3}
                  value={formNoteBody}
                  onChange={(e) => setFormNoteBody(e.target.value)}
                  placeholder="Write key definitions, formulas, or quotes in your own words..."
                  className="w-full px-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
            )}

            {subjectTopicsForForm.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-slate-300">
                  Link to syllabus topics (used by Academic Intelligence)
                </p>
                <div className="flex flex-wrap gap-2">
                  {subjectTopicsForForm.map((t) => {
                    const picked = formSelectedTopicIds.includes(t.id);
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() =>
                          setFormSelectedTopicIds((prev) =>
                            picked ? prev.filter((id) => id !== t.id) : [...prev, t.id]
                          )
                        }
                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${
                          picked
                            ? 'bg-cyan-400 text-slate-950 font-semibold border-cyan-400'
                            : 'bg-[#0B1528] text-slate-300 border-slate-700 hover:text-white'
                        }`}
                      >
                        {t.title}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddPanel(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
              >
                Save to Subject Library
              </button>
            </div>
          </form>
        )}

        {/* Filter Bar */}
        <div className="pt-4 border-t border-slate-800 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources by title or topic..."
              className="w-full pl-9 pr-3 py-2 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
              aria-label="Filter by subject"
            >
              <option value="all">All subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as ResourceType | 'all')}
              className="px-3 py-2 text-xs font-medium border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
              aria-label="Filter by resource type"
            >
              <option value="all">All 9 resource types</option>
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {formatResourceTypeLabel(t)}
                </option>
              ))}
            </select>

            <select
              value={processingFilter}
              onChange={(e) => setProcessingFilter(e.target.value)}
              className="px-3 py-2 text-xs font-medium border border-slate-700 rounded-lg bg-[#0B1528] text-slate-200"
              aria-label="Filter by processing status"
            >
              <option value="all">All processing states</option>
              <option value="extracted">Processed &amp; readable</option>
              <option value="unanalysed">Not analysed / restricted</option>
            </select>
          </div>
        </div>
      </section>

      {viewMode === 'libraries' ? (
        <div className="space-y-6">
          {subjects
            .filter((s) => subjectFilter === 'all' || s.id === subjectFilter)
            .map((subj) => {
              const subjResources = filteredResources.filter(
                (r) => r.subjectId === subj.id
              );
              const extractedCount = subjResources.filter(
                (r) => r.processingStatus === 'extracted'
              ).length;
              return (
                <section
                  key={subj.id}
                  className="bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <FolderOpen className="w-4 h-4 text-cyan-400" />
                      <h3 className="font-display text-lg font-semibold text-white">
                        {subj.name} Library
                      </h3>
                    </div>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">
                      {extractedCount} processed · {subjResources.length} total items
                    </span>
                  </div>

                  {subjResources.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      No matching resources in {subj.name}.
                    </p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {subjResources.map((res) => (
                        <ResourceCard
                          key={res.id}
                          resource={res}
                          subjectName={subj.name}
                          topics={topics}
                          selected={activeResource?.id === res.id}
                          onSelect={() => {
                            setSelectedResourceId(res.id);
                            setViewMode('list');
                          }}
                          onOpenTutor={() => openInTutor(res.subjectId, res.id)}
                          onOpenStudyTools={() =>
                            openInStudyTools(res.subjectId, 'summaries', 'all', res.id)
                          }
                        />
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-7 space-y-3">
            {filteredResources.length === 0 ? (
              <div className="bg-[#0F1B33] border border-slate-800 rounded-xl p-8 text-center text-sm text-slate-400">
                No resources match your current filter.
              </div>
            ) : (
              filteredResources.map((res) => (
                <ResourceCard
                  key={res.id}
                  resource={res}
                  subjectName={subjectById[res.subjectId]?.name ?? 'Subject'}
                  topics={topics}
                  selected={activeResource?.id === res.id}
                  onSelect={() => setSelectedResourceId(res.id)}
                  onOpenTutor={() => openInTutor(res.subjectId, res.id)}
                  onOpenStudyTools={() =>
                    openInStudyTools(res.subjectId, 'summaries', 'all', res.id)
                  }
                />
              ))
            )}
          </div>

          {/* Dark Resource Inspector */}
          <aside className="lg:col-span-5 bg-[#0F1B33] border border-slate-800 rounded-xl p-5 sm:p-6 space-y-5 sticky top-20">
            {activeResource ? (
              <>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-cyan-400">
                      {subjectById[activeResource.subjectId]?.name} ·{' '}
                      {formatResourceTypeLabel(activeResource.type)}
                    </span>
                    <ProcessingStatusIndicator status={activeResource.processingStatus} />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-white">
                    {activeResource.title}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Owner / Source: {activeResource.ownerOrPublisher}
                  </p>
                </div>

                <div className="p-3.5 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1">
                  <p className="text-[11px] font-medium text-slate-400">
                    Preserved source reference ({activeResource.accessMode})
                  </p>
                  <p className="text-xs font-mono text-slate-200 break-all flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{activeResource.sourceReference}</span>
                  </p>
                </div>

                {activeResource.processingStatus !== 'extracted' && (
                  <div className="p-4 bg-amber-500/10 border border-amber-400/30 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Not analysed</span>
                    </div>
                    <p className="text-xs text-amber-100/90 leading-relaxed">
                      {activeResource.accessNotice ||
                        'Content could not be extracted from this source, so the AI Tutor and Study Tools do not claim to read it.'}
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-200">
                    Identified subject topics
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {topics
                      .filter((t) => t.subjectId === activeResource.subjectId)
                      .map((t) => {
                        const linked = activeResource.identifiedTopics.includes(t.id);
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => toggleTopicOnActiveResource(t.id)}
                            className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                              linked
                                ? 'bg-cyan-400 text-slate-950 font-semibold border-cyan-400'
                                : 'bg-[#0B1528] text-slate-300 border-slate-700 hover:text-white'
                            }`}
                          >
                            {t.title}
                          </button>
                        );
                      })}
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h4 className="text-xs font-semibold text-slate-200">
                    Indexed source excerpts
                  </h4>
                  {activeResource.verifiedExcerpts.length === 0 ? (
                    <p className="text-xs text-slate-400">No excerpts extracted.</p>
                  ) : (
                    <ul className="space-y-2">
                      {activeResource.verifiedExcerpts.map((ex, i) => (
                        <li
                          key={i}
                          className="p-3 bg-[#0B1528] border border-slate-800 rounded-lg space-y-1"
                        >
                          <p className="text-[11px] font-mono text-cyan-400">{ex.location}</p>
                          <p className="text-xs text-slate-300 leading-relaxed">{ex.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={activeResource.processingStatus !== 'extracted'}
                    onClick={() => openInTutor(activeResource.subjectId, activeResource.id)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 rounded-lg"
                  >
                    <MessageSquareText className="w-3.5 h-3.5" />
                    Use in AI Tutor
                  </button>
                  <button
                    type="button"
                    disabled={activeResource.processingStatus !== 'extracted'}
                    onClick={() =>
                      openInStudyTools(
                        activeResource.subjectId,
                        'summaries',
                        'all',
                        activeResource.id
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#13223D] border border-slate-700 hover:bg-[#192D50] disabled:opacity-40 rounded-lg"
                  >
                    <Layers className="w-3.5 h-3.5 text-cyan-400" />
                    Generate in Study Tools
                  </button>
                </div>
              </>
            ) : (
              <p className="text-sm text-slate-400">Select a resource to inspect details.</p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
};
