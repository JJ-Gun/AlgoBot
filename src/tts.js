import { Communicate } from 'edge-tts-universal';
import { PassThrough } from 'stream';
import { VOICES } from './config.js';
import { preprocessText } from './textProcessor.js';

console.log('✅ 모든 TTS 준비 완료!');

const EDGE_RATE = '+0%';

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function meloTTS(text) {
  const response = await fetch('http://127.0.0.1:5050/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('MeloTTS 서버 오류');
  return streamToBuffer(response.body);
}

async function kokoroTTS(text, voiceKey) {
  const response = await fetch('http://127.0.0.1:5051/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voiceKey }),
  });
  if (!response.ok) throw new Error('Kokoro 서버 오류');
  return streamToBuffer(response.body);
}

function edgeTTSStream(text, voice) {
  const communicate = new Communicate(text, {
    voice: voice.name,
    rate: EDGE_RATE,
  });
  const pass = new PassThrough();

  (async () => {
    try {
      for await (const chunk of communicate.stream()) {
        if (chunk.type === 'audio' && chunk.data) pass.write(chunk.data);
      }
      pass.end();
    } catch (err) {
      pass.destroy(err);
    }
  })();

  return pass;
}

export async function generateTTS(text, voiceKey) {
  const voice = VOICES[voiceKey];
  const processedText = preprocessText(text);

  if (voice.type === 'edge') {
    return edgeTTSStream(processedText, voice);
  }

  if (voice.type === 'melo') {
    return await meloTTS(preprocessText(text, false));
  }

  if (voice.type === 'kokoro') {
    return await kokoroTTS(processedText, voiceKey);
  }

  throw new Error('지원되지 않는 voice');
}