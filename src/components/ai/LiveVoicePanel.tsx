import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Send, Volume2 } from 'lucide-react';

interface LiveVoicePanelProps {
  defaultSystemInstruction: string;
  contextLabel?: string;
}

interface TranscriptLine {
  id: string;
  speaker: 'You' | 'Gemini Live';
  text: string;
}

const VOICE_OPTIONS = ['Zephyr', 'Kore', 'Puck', 'Charon', 'Fenrir'] as const;

function float32ToBase64Pcm16(float32: Float32Array): string {
  const int16 = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  const bytes = new Uint8Array(int16.buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

function base64Pcm16ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const view = new DataView(bytes.buffer);
  const float32 = new Float32Array(bytes.byteLength / 2);
  for (let i = 0; i < float32.length; i++) {
    float32[i] = view.getInt16(i * 2, true) / 32768;
  }
  return float32;
}

export const LiveVoicePanel: React.FC<LiveVoicePanelProps> = ({
  defaultSystemInstruction,
  contextLabel,
}) => {
  const [voiceName, setVoiceName] = useState<string>('Zephyr');
  const [systemInstruction, setSystemInstruction] = useState(defaultSystemInstruction);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live'>('idle');
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [textNudge, setTextNudge] = useState('');
  const [transcripts, setTranscripts] = useState<TranscriptLine[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const inputCtxRef = useRef<AudioContext | null>(null);
  const outputCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mutedRef = useRef(false);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  useEffect(() => {
    setSystemInstruction(defaultSystemInstruction);
  }, [defaultSystemInstruction]);

  useEffect(() => {
    mutedRef.current = isMuted;
  }, [isMuted]);

  const clearAudioQueue = () => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
      } catch {
        // ignore already stopped
      }
    }
    activeSourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  };

  const stopSession = () => {
    clearAudioQueue();
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (inputCtxRef.current) {
      inputCtxRef.current.close().catch(() => {});
      inputCtxRef.current = null;
    }
    if (outputCtxRef.current) {
      outputCtxRef.current.close().catch(() => {});
      outputCtxRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setStatus('idle');
    setIsMuted(false);
  };

  useEffect(() => {
    return () => {
      stopSession();
    };
  }, []);

  const appendTranscript = (speaker: 'You' | 'Gemini Live', text: string) => {
    const clean = text.trim();
    if (!clean) return;
    setTranscripts((prev) => {
      const last = prev[prev.length - 1];
      if (last && last.speaker === speaker) {
        return [
          ...prev.slice(0, -1),
          { ...last, text: `${last.text} ${clean}`.trim() },
        ];
      }
      return [...prev, { id: `${Date.now()}-${Math.random()}`, speaker, text: clean }];
    });
  };

  const playOutputChunk = (base64Pcm: string) => {
    const ctx = outputCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const samples = base64Pcm16ToFloat32(base64Pcm);
    const buffer = ctx.createBuffer(1, samples.length, 24000);
    buffer.getChannelData(0).set(samples);

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.connect(ctx.destination);

    const startAt = Math.max(ctx.currentTime, nextStartTimeRef.current);
    src.start(startAt);
    nextStartTimeRef.current = startAt + buffer.duration;

    activeSourcesRef.current.add(src);
    src.onended = () => {
      activeSourcesRef.current.delete(src);
    };
  };

  const startSession = async () => {
    if (status !== 'idle') return;
    setErrorMsg(null);
    setStatus('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const inputCtx = new AudioContext({ sampleRate: 16000 });
      const outputCtx = new AudioContext({ sampleRate: 24000 });
      inputCtxRef.current = inputCtx;
      outputCtxRef.current = outputCtx;

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${proto}//${window.location.host}/api/gemini/live`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(
          JSON.stringify({
            type: 'start',
            voiceName,
            systemInstruction,
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data) as {
            type?: string;
            data?: string;
            text?: string;
            message?: string;
          };
          if (msg.type === 'ready') {
            setStatus('live');
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            sourceRef.current = source;
            processorRef.current = processor;

            processor.onaudioprocess = (e) => {
              if (mutedRef.current) return;
              if (ws.readyState !== WebSocket.OPEN) return;
              const base64 = float32ToBase64Pcm16(e.inputBuffer.getChannelData(0));
              ws.send(JSON.stringify({ type: 'audio', data: base64 }));
            };

            source.connect(processor);
            processor.connect(inputCtx.destination);
          } else if (msg.type === 'audio' && msg.data) {
            playOutputChunk(msg.data);
          } else if (msg.type === 'inputTranscript' && msg.text) {
            appendTranscript('You', msg.text);
          } else if (msg.type === 'outputTranscript' && msg.text) {
            appendTranscript('Gemini Live', msg.text);
          } else if (msg.type === 'interrupted') {
            clearAudioQueue();
          } else if (msg.type === 'error') {
            setErrorMsg(msg.message || 'Live voice session encountered an error.');
            stopSession();
          } else if (msg.type === 'closed') {
            stopSession();
          }
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => {
        setErrorMsg('WebSocket connection to /api/gemini/live failed.');
        stopSession();
      };

      ws.onclose = () => {
        if (wsRef.current) {
          stopSession();
        }
      };
    } catch (err) {
      setErrorMsg(
        err instanceof Error
          ? err.message
          : 'Could not access microphone or start live voice conversation.'
      );
      stopSession();
    }
  };

  const handleSendNudge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textNudge.trim() || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    const text = textNudge.trim();
    wsRef.current.send(JSON.stringify({ type: 'text', text }));
    appendTranscript('You', text);
    setTextNudge('');
  };

  return (
    <div className="bg-[#0F1B33] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-display text-lg font-semibold text-white">
              Real-Time Voice Conversation
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Model: <span className="font-mono text-cyan-300">gemini-3.8-live</span> (Live API · 16kHz in / 24kHz out)
            {contextLabel ? ` · ${contextLabel}` : ''}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={voiceName}
            disabled={status !== 'idle'}
            onChange={(e) => setVoiceName(e.target.value)}
            aria-label="Tutor voice preset"
            className="px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg disabled:opacity-50"
          >
            {VOICE_OPTIONS.map((v) => (
              <option key={v} value={v}>
                Voice: {v}
              </option>
            ))}
          </select>

          {status === 'idle' ? (
            <button
              type="button"
              onClick={startSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Start Live Voice
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setIsMuted((m) => !m)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border whitespace-nowrap ${
                  isMuted
                    ? 'bg-amber-500/15 text-amber-300 border-amber-400/40'
                    : 'bg-[#0B1528] text-slate-200 border-slate-700'
                }`}
              >
                {isMuted ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-cyan-400" />}
                {isMuted ? 'Mic muted' : 'Mic live'}
              </button>
              <button
                type="button"
                onClick={stopSession}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg whitespace-nowrap"
              >
                <PhoneOff className="w-3.5 h-3.5" />
                {status === 'connecting' ? 'Cancel' : 'End call'}
              </button>
            </>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">
          Voice tutor role / system instruction
        </label>
        <input
          type="text"
          disabled={status !== 'idle'}
          value={systemInstruction}
          onChange={(e) => setSystemInstruction(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-200 rounded-lg disabled:opacity-60"
        />
      </div>

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-400/30 rounded-xl text-xs text-rose-200">
          {errorMsg}
        </div>
      )}

      <div className="bg-[#0B1528] border border-slate-800 rounded-xl p-4 h-64 overflow-y-auto space-y-2.5">
        {transcripts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-xs text-slate-400 space-y-1">
            <p>
              {status === 'live'
                ? 'Live session active — speak naturally into your microphone.'
                : status === 'connecting'
                ? 'Connecting to Gemini Live API...'
                : 'Click "Start Live Voice" to speak in real time with your tutor.'}
            </p>
          </div>
        ) : (
          transcripts.map((line) => (
            <div
              key={line.id}
              className={`p-3 rounded-lg text-xs sm:text-sm ${
                line.speaker === 'You'
                  ? 'bg-[#142444] border border-cyan-500/30 text-slate-100 ml-6'
                  : 'bg-[#0F1B33] border border-slate-800 text-slate-200 mr-6'
              }`}
            >
              <span className="block text-[11px] font-semibold text-cyan-400 mb-0.5">
                {line.speaker}
              </span>
              <p className="leading-relaxed">{line.text}</p>
            </div>
          ))
        )}
      </div>

      {status === 'live' && (
        <form onSubmit={handleSendNudge} className="flex gap-2">
          <input
            type="text"
            value={textNudge}
            onChange={(e) => setTextNudge(e.target.value)}
            placeholder="Optional: type a quick prompt into the live voice session..."
            className="flex-1 px-3 py-2 text-xs bg-[#0B1528] border border-slate-700 text-slate-100 rounded-lg"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg"
          >
            <Send className="w-3.5 h-3.5" />
            Send
          </button>
        </form>
      )}
    </div>
  );
};
