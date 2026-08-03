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
  let chunkCount = 0;
  let byteCount = 0;

  (async () => {
    try {
      for await (const chunk of communicate.stream()) {
        if (pass.destroyed) {
          console.log(`[EDGE] 중간에 파괴됨 (chunks=${chunkCount}, bytes=${byteCount}) text="${text.slice(0, 20)}"`);
          return;
        }
        if (chunk.type === 'audio' && chunk.data) {
          chunkCount++;
          byteCount += chunk.data.length;
          pass.write(chunk.data);
        }
      }
      console.log(`[EDGE] 정상 완료 (chunks=${chunkCount}, bytes=${byteCount}) text="${text.slice(0, 20)}"`);
      if (!pass.destroyed) pass.end();
    } catch (err) {
      console.log(`[EDGE] 에러 발생 (chunks=${chunkCount}, bytes=${byteCount}): ${err.message}`);
      if (!pass.destroyed) pass.destroy(err);
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