import React, { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Mic, Plus, Square, Upload } from 'lucide-react';
import { usePlatform } from '../../context/PlatformContext';

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const commaIdx = result.indexOf(',');
      resolve(commaIdx >= 0 ? result.slice(commaIdx + 1) : result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export const AudioTranscribePanel: React.FC = () => {
  const { subjects, addResource } = usePlatform();

  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [customPrompt, setCustomPrompt] = useState(
    'Transcribe this audio accurately, and organise key study points if applicable.'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [saveSubjectId, setSaveSubjectId] = useState(subjects[0]?.id ?? 'bio');
  const [saveTitle, setSaveTitle] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    setSavedNotice(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mimeType });
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        setAudioUrl(URL.createObjectURL(blob));
        setAudioMimeType(mimeType);
        const b64 = await blobToBase64(blob);
        setAudioBase64(b64);
      };

      recorder.start();
      recorderRef.current = recorder;
      setSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Microphone permission is needed to record audio.'
      );
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg(null);
    setSavedNotice(false);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(URL.createObjectURL(file));
    setAudioMimeType(file.type || 'audio/mp3');
    const b64 = await blobToBase64(file);
    setAudioBase64(b64);
  };

  const handleTranscribe = async () => {
    if (!audioBase64) return;
    setIsLoading(true);
    setErrorMsg(null);
    setSavedNotice(false);
    try {
      const res = await fetch('/api/gemini/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioMimeType,
          prompt: customPrompt,
        }),
      });
      const data = (await res.json()) as { transcript?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error || 'Transcription request failed.');
      }
      setTranscript(data.transcript || '');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to transcribe audio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAsResource = () => {
    if (!transcript.trim()) return;
    const title =
      saveTitle.trim() || `Voice Note Transcript (${new Date().toLocaleDateString()})`;
    addResource({
      subjectId: saveSubjectId,
      title,
      type: 'typed-note',
      accessStatus: 'accessible',
      processingStatus: 'extracted',
      identifiedTopics: ['Voice Transcript'],
      accessMode: 'User note',
      sourceReference: 'Transcribed via gemini-3.5-transcribe',
      ownerOrPublisher: 'Student Voice Note',
      summaryPreview: transcript.trim().slice(0, 180),
      verifiedExcerpts: [
        {
          location: 'Voice Transcript',
          text: transcript.trim(),
        },
      ],
    });
    setSavedNotice(true);
    setSaveTitle('');
  };

  return (
    <div className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyan-400" />
          <h3 className="font-display text-lg font-semibold text-white">
            Microphone Speech-to-Text Transcription
          </h3>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Model: <span className="font-mono text-cyan-300">gemini-3.5-transcribe</span> · Record spoken explanations or lecture clips and save them into your Subject Resources.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
          >
            <Mic className="w-3.5 h-3.5" />
            Record microphone
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg tabular-nums"
          >
            <Square className="w-3.5 h-3.5" />
            Stop recording ({seconds}s)
          </button>
        )}

        <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-200 bg-[#0B1528] border border-slate-700 hover:border-slate-600 rounded-lg cursor-pointer">
          <Upload className="w-3.5 h-3.5 text-cyan-400" />
          Upload audio file
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="sr-only"
          />
        </label>

        {audioBase64 && (
          <button
            type="button"
            disabled={isLoading || isRecording}
            onClick={handleTranscribe}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-50 rounded-lg"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
            {isLoading ? 'Transcribing...' : 'Transcribe audio'}
          </button>
        )}
      </div>

      {audioUrl && (
        <audio controls src={audioUrl} className="w-full h-10" />
      )}

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Transcription instruction
        </label>
        <input
          type="text"
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-200 rounded-lg"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      {transcript && (
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <label className="block text-xs font-semibold text-cyan-400">
            Transcript output
          </label>
          <textarea
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full p-3 text-sm bg-[#0B1528] border border-slate-700 text-slate-100 rounded-xl leading-relaxed"
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={saveSubjectId}
              onChange={(e) => setSaveSubjectId(e.target.value)}
              className="px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
              aria-label="Subject for saved transcript"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={saveTitle}
              onChange={(e) => setSaveTitle(e.target.value)}
              placeholder="Note title (optional)"
              className="flex-1 min-w-[160px] px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
            />
            <button
              type="button"
              onClick={handleSaveAsResource}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/30 rounded-lg"
            >
              {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {savedNotice ? 'Saved to Resource Centre' : 'Save to Resource Centre'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
