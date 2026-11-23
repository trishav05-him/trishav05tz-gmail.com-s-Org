import 'dotenv/config';
import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocket, WebSocketServer } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CHAT_MODELS = new Set([
  'gemini-4-hydrogen',
  'gemini-3.1-flash-lite',
  'gemini-4-neon',
  'gemini-4-carbon',
]);

const PAID_MODELS = new Set([
  'gemini-4-carbon',
  'gemini-4-neon',
  'gemini-nano-banana-2.1',
  'gemini-omni-1.2-flash',
  'lyria-3-clip-preview',
  'lyria-3-pro-preview',
]);

function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw Object.assign(
      new Error('GEMINI_API_KEY is not configured. Please check Settings > Secrets.'),
      { status: 400 }
    );
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatGeminiError(err: unknown, model?: string): { status: number; message: string } {
  const raw = err as { status?: number; code?: number; message?: string } | undefined;
  const msg = raw?.message || (err instanceof Error ? err.message : 'Unexpected Gemini API error.');
  const status = Number(raw?.status || raw?.code) || 500;

  if (status === 403 || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')) {
    return {
      status: 403,
      message: `${msg} — Please verify your GEMINI_API_KEY in Settings > Secrets.`,
    };
  }
  if (status === 429 || msg.includes('RESOURCE_EXHAUSTED')) {
    const paidHint =
      model && PAID_MODELS.has(model)
        ? ` Model "${model}" requires a billing-enabled API key. Select a paid API key in Settings > Secrets to use it.`
        : ' Quota exceeded—check your API key tier in Settings > Secrets.';
    return { status: 429, message: `${msg}${paidHint}` };
  }
  if (status === 404 || msg.includes('NOT_FOUND')) {
    return {
      status: 404,
      message: `${msg} (Model: ${model ?? 'unknown'}). Please verify the model availability or API key tier in Settings > Secrets.`,
    };
  }
  return { status: status >= 400 && status < 600 ? status : 500, message: msg };
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '40mb' }));

  // 1. Multi-turn Gemini Chatbot (gemini-4-carbon, gemini-4-neon, gemini-4-hydrogen, gemini-3.1-flash-lite)
  app.post('/api/gemini/chat', async (req: Request, res: Response) => {
    const { model = 'gemini-4-hydrogen', messages = [], systemInstruction } = req.body ?? {};
    if (!CHAT_MODELS.has(model)) {
      res.status(400).json({ error: `Unsupported chat model: ${model}` });
      return;
    }
    if (!Array.isArray(messages) || messages.length === 0) {
      res.status(400).json({ error: 'At least one message is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const history = messages.slice(0, -1).map((m: { role: string; text: string }) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: String(m.text ?? '') }],
      }));
      const latest = messages[messages.length - 1];

      const chat = ai.chats.create({
        model,
        history,
        config: systemInstruction ? { systemInstruction: String(systemInstruction) } : undefined,
      });

      const response = await chat.sendMessage({ message: String(latest?.text ?? '') });
      res.json({
        reply: response.text ?? '',
        model,
      });
    } catch (err) {
      const formatted = formatGeminiError(err, model);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 2. Google Search Grounding (gemini-4-hydrogen + googleSearch)
  app.post('/api/gemini/search', async (req: Request, res: Response) => {
    const { query, systemInstruction } = req.body ?? {};
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: query.trim(),
        config: {
          ...(systemInstruction ? { systemInstruction: String(systemInstruction) } : {}),
          tools: [{ googleSearch: {} }],
        },
      });

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const sources = rawChunks
        .map((c) => c.web)
        .filter((w): w is { uri?: string; title?: string } => Boolean(w?.uri))
        .map((w) => ({ uri: w.uri!, title: w.title || w.uri! }));

      res.json({
        text: response.text ?? '',
        sources,
        model: 'gemini-4-hydrogen',
      });
    } catch (err) {
      const formatted = formatGeminiError(err, 'gemini-4-hydrogen');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 3. Google Maps Grounding (gemini-4-hydrogen + googleMaps)
  app.post('/api/gemini/maps', async (req: Request, res: Response) => {
    const { query, latLng } = req.body ?? {};
    if (!query || typeof query !== 'string' || !query.trim()) {
      res.status(400).json({ error: 'Maps query is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const hasCoords =
        latLng &&
        typeof latLng.latitude === 'number' &&
        typeof latLng.longitude === 'number';

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: query.trim(),
        config: {
          tools: [{ googleMaps: {} }],
          ...(hasCoords
            ? {
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: latLng.latitude,
                      longitude: latLng.longitude,
                    },
                  },
                },
              }
            : {}),
        },
      });

      const rawChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
      const places = rawChunks
        .map((c) => c.maps)
        .filter((m): m is NonNullable<typeof m> => Boolean(m?.uri || m?.title))
        .map((m) => ({
          title: m.title || 'Google Maps Place',
          uri: m.uri || '',
          reviewSnippets:
            m.placeAnswerSources?.reviewSnippets
              ?.map((s) => s.review || s.title)
              .filter((s): s is string => Boolean(s)) ?? [],
        }));

      res.json({
        text: response.text ?? '',
        places,
        model: 'gemini-4-hydrogen',
      });
    } catch (err) {
      const formatted = formatGeminiError(err, 'gemini-4-hydrogen');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 4. Create & Edit Images (gemini-nano-banana-2.1)
  app.post('/api/gemini/image', async (req: Request, res: Response) => {
    const {
      prompt,
      aspectRatio = '1:1',
      imageSize = '1K',
      imageBase64,
      imageMimeType,
    } = req.body ?? {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Image prompt is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const parts: Array<
        | { text: string }
        | { inlineData: { data: string; mimeType: string } }
      > = [];

      if (imageBase64 && typeof imageBase64 === 'string') {
        parts.push({
          inlineData: {
            data: imageBase64,
            mimeType: typeof imageMimeType === 'string' && imageMimeType ? imageMimeType : 'image/png',
          },
        });
      }
      parts.push({ text: prompt.trim() });

      const response = await ai.models.generateContent({
        model: 'gemini-nano-banana-2.1',
        contents: { parts },
        config: {
          imageConfig: {
            aspectRatio: String(aspectRatio || '1:1'),
            imageSize: String(imageSize || '1K'),
          },
        },
      });

      let imageDataUrl: string | null = null;
      let text = '';
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data && !imageDataUrl) {
          const mime = part.inlineData.mimeType ?? 'image/png';
          imageDataUrl = `data:${mime};base64,${part.inlineData.data}`;
        } else if (part.text) {
          text += part.text;
        }
      }

      if (!imageDataUrl) {
        res.status(502).json({
          error: text || 'No image was returned by gemini-nano-banana-2.1.',
        });
        return;
      }

      res.json({
        imageDataUrl,
        text,
        model: 'gemini-nano-banana-2.1',
      });
    } catch (err) {
      const formatted = formatGeminiError(err, 'gemini-nano-banana-2.1');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 5. Generate Music (lyria-3-clip-preview / lyria-3-pro-preview)
  app.post('/api/gemini/music', async (req: Request, res: Response) => {
    const { prompt, mode = 'clip', imageBase64, imageMimeType } = req.body ?? {};
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Music prompt is required.' });
      return;
    }

    const model = mode === 'pro' ? 'lyria-3-pro-preview' : 'lyria-3-clip-preview';

    try {
      const ai = getAiClient();
      const contents =
        imageBase64 && typeof imageBase64 === 'string'
          ? {
              parts: [
                { text: prompt.trim() },
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType:
                      typeof imageMimeType === 'string' && imageMimeType
                        ? imageMimeType
                        : 'image/jpeg',
                  },
                },
              ],
            }
          : prompt.trim();

      const stream = await ai.models.generateContentStream({
        model,
        contents,
      });

      const audioChunks: Buffer[] = [];
      let lyrics = '';
      let mimeType = 'audio/mpeg';

      for await (const chunk of stream) {
        const parts = chunk.candidates?.[0]?.content?.parts;
        if (!parts) continue;
        for (const part of parts) {
          if (part.inlineData?.data) {
            if (audioChunks.length === 0 && part.inlineData.mimeType) {
              mimeType = part.inlineData.mimeType;
            }
            audioChunks.push(Buffer.from(part.inlineData.data, 'base64'));
          }
          if (part.text) {
            lyrics += part.text;
          }
        }
      }

      if (audioChunks.length === 0) {
        res.status(502).json({ error: `No audio stream received from ${model}.` });
        return;
      }

      const audioBase64 = Buffer.concat(audioChunks).toString('base64');
      res.json({
        audioDataUrl: `data:${mimeType};base64,${audioBase64}`,
        lyrics: lyrics.trim(),
        model,
      });
    } catch (err) {
      const formatted = formatGeminiError(err, model);
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 6. Generate Video from Text or Animate Image into Video (gemini-omni-1.2-flash via Interactions API)
  app.post('/api/gemini/video', async (req: Request, res: Response) => {
    const {
      prompt,
      aspectRatio = '16:9',
      duration = '10s',
      resolution = '720p',
      imageBase64,
      imageMimeType,
    } = req.body ?? {};

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      res.status(400).json({ error: 'Video prompt is required.' });
      return;
    }

    const validAspect: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';

    try {
      const ai = getAiClient();
      const input =
        imageBase64 && typeof imageBase64 === 'string'
          ? [
              {
                type: 'image' as const,
                mime_type:
                  typeof imageMimeType === 'string' && imageMimeType
                    ? imageMimeType
                    : 'image/png',
                data: imageBase64,
              },
              {
                type: 'text' as const,
                text: prompt.trim(),
              },
            ]
          : prompt.trim();

      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input,
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: validAspect,
            duration: String(duration || '10s'),
            resolution: String(resolution || '720p'),
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (!videoPart || (!videoPart.data && !videoPart.uri)) {
        res.status(502).json({ error: 'No video output returned by gemini-omni-1.2-flash.' });
        return;
      }

      const mime = videoPart.mime_type || 'video/mp4';
      const videoDataUrl = videoPart.data
        ? `data:${mime};base64,${videoPart.data}`
        : undefined;

      res.json({
        videoDataUrl,
        videoUri: videoPart.uri,
        aspectRatio: validAspect,
        model: 'gemini-omni-1.2-flash',
      });
    } catch (err) {
      const formatted = formatGeminiError(err, 'gemini-omni-1.2-flash');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // 7. Audio Transcription (gemini-3.5-transcribe)
  app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
    const { audioBase64, mimeType = 'audio/webm', prompt } = req.body ?? {};
    if (!audioBase64 || typeof audioBase64 !== 'string') {
      res.status(400).json({ error: 'Recorded or uploaded audio data is required.' });
      return;
    }

    try {
      const ai = getAiClient();
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-transcribe',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: String(mimeType || 'audio/webm'),
                data: audioBase64,
              },
            },
            {
              text:
                typeof prompt === 'string' && prompt.trim()
                  ? prompt.trim()
                  : 'Transcribe this audio accurately with clear punctuation.',
            },
          ],
        },
      });

      res.json({
        transcript: response.text ?? '',
        model: 'gemini-3.5-transcribe',
      });
    } catch (err) {
      const formatted = formatGeminiError(err, 'gemini-3.5-transcribe');
      res.status(formatted.status).json({ error: formatted.message });
    }
  });

  // Frontend serving (Vite dev middleware in development, static dist in production)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = http.createServer(app);

  // 8. Real-time Voice Conversations (gemini-3.8-live via Live API over WebSocket)
  const wss = new WebSocketServer({ noServer: true });

  server.on('upgrade', (request, socket, head) => {
    const reqUrl = new URL(request.url || '/', `http://${request.headers.host}`);
    if (reqUrl.pathname === '/api/gemini/live') {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  wss.on('connection', (clientWs: WebSocket) => {
    let liveSession: Awaited<ReturnType<GoogleGenAI['live']['connect']>> | null = null;
    let isClosing = false;

    const sendSafe = (payload: Record<string, unknown>) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify(payload));
      }
    };

    clientWs.on('message', async (raw) => {
      try {
        const msg = JSON.parse(raw.toString()) as {
          type?: string;
          systemInstruction?: string;
          voiceName?: string;
          data?: string;
          text?: string;
        };

        if (msg.type === 'start') {
          if (liveSession) return;
          const ai = getAiClient();
          liveSession = await ai.live.connect({
            model: 'gemini-3.8-live',
            config: {
              responseModalities: [Modality.AUDIO],
              inputAudioTranscription: {},
              outputAudioTranscription: {},
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: {
                    voiceName: msg.voiceName || 'Zephyr',
                  },
                },
              },
              systemInstruction:
                msg.systemInstruction ||
                'You are a patient, encouraging secondary-school study tutor. Guide the student concisely by asking helpful questions.',
            },
            callbacks: {
              onmessage: (message: LiveServerMessage) => {
                const content = message.serverContent;
                if (content?.inputTranscription?.text) {
                  sendSafe({ type: 'inputTranscript', text: content.inputTranscription.text });
                }
                if (content?.outputTranscription?.text) {
                  sendSafe({ type: 'outputTranscript', text: content.outputTranscription.text });
                }
                for (const part of content?.modelTurn?.parts ?? []) {
                  if (part.inlineData?.data) {
                    sendSafe({ type: 'audio', data: part.inlineData.data });
                  }
                }
                if (content?.interrupted) {
                  sendSafe({ type: 'interrupted' });
                }
                if (content?.turnComplete) {
                  sendSafe({ type: 'turnComplete' });
                }
              },
              onerror: (err) => {
                const formatted = formatGeminiError(err, 'gemini-3.8-live');
                sendSafe({ type: 'error', message: formatted.message });
              },
              onclose: () => {
                if (!isClosing) {
                  sendSafe({ type: 'closed' });
                }
              },
            },
          });
          sendSafe({ type: 'ready' });
        } else if (msg.type === 'audio' && msg.data && liveSession) {
          liveSession.sendRealtimeInput({
            audio: { data: msg.data, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (msg.type === 'text' && msg.text && liveSession) {
          liveSession.sendRealtimeInput({
            text: msg.text,
          });
        }
      } catch (err) {
        const formatted = formatGeminiError(err, 'gemini-3.8-live');
        sendSafe({ type: 'error', message: formatted.message });
      }
    });

    clientWs.on('close', () => {
      isClosing = true;
      try {
        liveSession?.close();
      } catch {
        // ignore close errors
      }
      liveSession = null;
    });
  });

  const PORT = Number(process.env.PORT) || 3000;
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

createApp();
