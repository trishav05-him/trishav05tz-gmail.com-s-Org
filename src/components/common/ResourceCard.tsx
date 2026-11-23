import React from 'react';
import {
  FileSpreadsheet,
  FileText,
  Folder,
  Globe,
  Image as ImageIcon,
  Layers,
  MessageSquareText,
  NotebookPen,
  Presentation,
  Video,
} from 'lucide-react';
import { ResourceItem, ResourceType, TopicItem } from '../../types/platform';
import {
  ProcessingStatusIndicator,
  formatFriendlyDate,
  formatResourceTypeLabel,
} from './StatusLabels';

export function ResourceTypeIcon({ type }: { type: ResourceType }) {
  const cls = 'w-4 h-4 text-cyan-400 shrink-0';
  switch (type) {
    case 'google-doc':
    case 'pdf':
      return <FileText className={cls} />;
    case 'google-slides':
      return <Presentation className={cls} />;
    case 'google-sheet':
      return <FileSpreadsheet className={cls} />;
    case 'google-drive':
      return <Folder className={cls} />;
    case 'youtube':
      return <Video className={cls} />;
    case 'article':
      return <Globe className={cls} />;
    case 'image':
      return <ImageIcon className={cls} />;
    case 'typed-note':
      return <NotebookPen className={cls} />;
  }
}

interface ResourceCardProps {
  resource: ResourceItem;
  subjectName: string;
  topics: TopicItem[];
  selected?: boolean;
  compact?: boolean;
  onSelect?: () => void;
  onOpenTutor?: () => void;
  onOpenStudyTools?: () => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource,
  subjectName,
  topics,
  selected = false,
  compact = false,
  onSelect,
  onOpenTutor,
  onOpenStudyTools,
}) => {
  const resolvedTopicLabels = resource.identifiedTopics.map((tag) => {
    const match = topics.find((t) => t.id === tag);
    return match ? match.title : tag;
  });

  return (
    <article
      className={`border rounded-xl transition-colors ${
        selected
          ? 'border-cyan-400/70 bg-[#142444]'
          : 'border-slate-800 bg-[#0F1B33] hover:border-slate-700'
      } ${compact ? 'p-3.5' : 'p-4 sm:p-5'}`}
    >
      <div className="flex items-start gap-3.5">
        <div className="mt-0.5 p-2 rounded-lg bg-[#162647] border border-slate-700/80 shrink-0">
          <ResourceTypeIcon type={resource.type} />
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            {onSelect ? (
              <button
                type="button"
                onClick={onSelect}
                className="text-sm font-semibold text-white hover:text-cyan-300 text-left truncate"
              >
                {resource.title}
              </button>
            ) : (
              <h4 className="text-sm font-semibold text-white truncate">
                {resource.title}
              </h4>
            )}
            <ProcessingStatusIndicator status={resource.processingStatus} />
          </div>

          <p className="text-xs text-slate-400">
            {subjectName} · {formatResourceTypeLabel(resource.type)} ·{' '}
            <span className="font-mono tabular-nums">{formatFriendlyDate(resource.addedAt)}</span>
          </p>

          {!compact && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
              {resource.summaryPreview}
            </p>
          )}

          {resolvedTopicLabels.length > 0 && (
            <p className="text-xs text-slate-400 truncate">
              <span className="text-slate-300 font-medium">Topics: </span>
              {resolvedTopicLabels.join(' · ')}
            </p>
          )}

          {(onOpenTutor || onOpenStudyTools) && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {onOpenTutor && (
                <button
                  type="button"
                  onClick={onOpenTutor}
                  disabled={resource.processingStatus !== 'extracted'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-40 rounded-md transition-colors whitespace-nowrap"
                >
                  <MessageSquareText className="w-3 h-3 text-cyan-400" />
                  Tutor
                </button>
              )}
              {onOpenStudyTools && (
                <button
                  type="button"
                  onClick={onOpenStudyTools}
                  disabled={resource.processingStatus !== 'extracted'}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 disabled:opacity-40 border border-cyan-500/30 rounded-md transition-colors whitespace-nowrap"
                >
                  <Layers className="w-3 h-3" />
                  Study Tools
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
