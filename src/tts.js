import { Communicate } from 'edge-tts-universal';
import { writeFile } from 'fs/promises';
import { VOICES } from './config.js';
import { preprocessText } from './textProcessor.js';

console.log('✅ 모든 TTS 준비 완료!');
const EDGE_RATE = '+0%'; // 속도 조절 ( -50% ~ +100% )

async function meloTTS(text, filePath) {
  const response = await fetch('http://127.0.0.1:5050/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  if (!response.ok) throw new Error('MeloTTS 서버 오류');
  const buffer = await response.arrayBuffer();
  const wavPath = `${filePath}.wav`;
  await writeFile(wavPath, Buffer.from(buffer));
  return wavPath;
}

async function kokoroTTS(text, voiceKey, filePath) {
  const response = await fetch('http://127.0.0.1:5051/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, voice: voiceKey }),
  });
  if (!response.ok) throw new Error('Kokoro 서버 오류');
  const buffer = await response.arrayBuffer();
  const wavPath = `${filePath}.wav`;
  await writeFile(wavPath, Buffer.from(buffer));
  return wavPath;
}

export async function generateTTS(text, voiceKey) {
  const voice = VOICES[voiceKey];
  const filePath = `./tts_${Date.now()}`;
  const processedText = preprocessText(text);

  if (voice.type === 'edge') {
    const communicate = new Communicate(processedText, { voice: voice.name, rate: EDGE_RATE });
    const mp3Path = `${filePath}.mp3`;
    const chunks = [];
    for await (const chunk of communicate.stream()) {
      if (chunk.type === 'audio' && chunk.data) chunks.push(chunk.data);
    }
    if (chunks.length === 0) throw new Error('No audio received');
    await writeFile(mp3Path, Buffer.concat(chunks));
    return mp3Path;
  }

  if (voice.type === 'melo') {
    const processedText = preprocessText(text, false);
    return await meloTTS(processedText, filePath);
  }

  if (voice.type === 'kokoro') {
    return await kokoroTTS(text, voiceKey, filePath);
  }
}