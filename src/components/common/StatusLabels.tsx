import React from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  FileWarning,
  HelpCircle,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import {
  MaterialOrigin,
  ResourceAccessStatus,
  ResourceProcessingStatus,
  ResourceType,
  TopicUnderstandingProfile,
  UnderstandingStatus,
} from '../../types/platform';

export const UnderstandingIndicator: React.FC<{ status: UnderstandingStatus }> = ({ status }) => {
  if (status === 'understood') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        Understood
      </span>
    );
  }
  if (status === 'developing') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 whitespace-nowrap">
        <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        Developing
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      Needs review
    </span>
  );
};

export const AssessmentStateIndicator: React.FC<{
  state: TopicUnderstandingProfile['assessmentState'];
  label: string;
}> = ({ state, label }) => {
  if (state === 'solid') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        {label}
      </span>
    );
  }
  if (state === 'needs-attention') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
        <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        {label}
      </span>
    );
  }
  if (state === 'not-yet-assessed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 whitespace-nowrap">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 whitespace-nowrap">
      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
      {label}
    </span>
  );
};

export const ResourceAccessIndicator: React.FC<{ status: ResourceAccessStatus }> = ({ status }) => {
  if (status === 'accessible') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        Readable (Read-only)
      </span>
    );
  }
  if (status === 'auth-required') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
        <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        Authorisation needed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300 whitespace-nowrap">
      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
      Restricted access
    </span>
  );
};

export const ProcessingStatusIndicator: React.FC<{ status: ResourceProcessingStatus }> = ({
  status,
}) => {
  switch (status) {
    case 'extracted':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 whitespace-nowrap">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          Processed · Ready
        </span>
      );
    case 'transcript-unavailable':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
          <FileWarning className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          No transcript · Unanalysed
        </span>
      );
    case 'auth-required':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-300 whitespace-nowrap">
          <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          Auth needed · Unanalysed
        </span>
      );
    case 'restricted':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-300 whitespace-nowrap">
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          Restricted · Unanalysed
        </span>
      );
    case 'metadata-only':
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 whitespace-nowrap">
          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          Metadata only
        </span>
      );
  }
};

export const MaterialOriginNotice: React.FC<{
  origin: MaterialOrigin;
  sourceRef?: string;
}> = ({ origin, sourceRef }) => {
  if (origin === 'student-resource') {
    return (
      <span className="text-xs font-medium text-emerald-400">
        From your resource{sourceRef ? ` · ${sourceRef}` : ''}
      </span>
    );
  }
  if (origin === 'weakness-targeted') {
    return (
      <span className="text-xs font-medium text-amber-300">
        Weakness-targeted{sourceRef ? ` · ${sourceRef}` : ''}
      </span>
    );
  }
  return (
    <span className="text-xs font-medium text-slate-400">
      General curriculum{sourceRef ? ` · ${sourceRef}` : ''}
    </span>
  );
};

export function formatResourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'google-doc':
      return 'Google Doc';
    case 'google-slides':
      return 'Google Slides';
    case 'google-sheet':
      return 'Google Sheet';
    case 'google-drive':
      return 'Google Drive';
    case 'youtube':
      return 'YouTube Video';
    case 'article':
      return 'Article / Web';
    case 'pdf':
      return 'PDF Document';
    case 'image':
      return 'Image';
    case 'typed-note':
      return 'Typed Note';
  }
}

export function formatFriendlyDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return isoDate;
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}
