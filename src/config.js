import { existsSync, readFileSync, writeFileSync } from 'fs';
import db from '../server/db/index.js';

export const DEFAULT_VOICE = 'ko-SunHi';

export const VOICES = {
    // edge-tts
  'ko-SunHi': { type: 'edge', name: 'ko-KR-SunHiNeural', lang: '한국어 여성', displayName: '🇰🇷 선희 - 한국어 여성(edge)' },
  'ko-InJoon': { type: 'edge', name: 'ko-KR-InJoonNeural', lang: '한국어 남성', displayName: '🇰🇷 인준 - 한국어 남성(edge)' },
  'ko-Hyunsu': { type: 'edge', name: 'ko-KR-HyunsuMultilingualNeural', lang: '한국어 남성', displayName: '🇰🇷 현수 - 한국어 남성(edge)' },
  // melo-tts
  'ko-local': { type: 'melo', lang: '한국어 로컬 (MeloTTS)', displayName: '🇰🇷 로컬 - 한국어(melo)' },
  // kokoro-js 영어
  'af_heart': { type: 'kokoro', lang: '영어 여성', displayName: '🇺🇸 하트 - 미국 여성(kokoro)' },
  'af_bella': { type: 'kokoro', lang: '영어 여성', displayName: '🇺🇸 벨라 - 미국 여성(kokoro)' },
  'af_nicole': { type: 'kokoro', lang: '영어 여성', displayName: '🇺🇸 니콜 - 미국 여성(kokoro)' },
  'af_sarah': { type: 'kokoro', lang: '영어 여성', displayName: '🇺🇸 사라 - 미국 여성(kokoro)' },
  'am_adam': { type: 'kokoro', lang: '영어 남성', displayName: '🇺🇸 아담 - 미국 남성(kokoro)' },
  'am_michael': { type: 'kokoro', lang: '영어 남성', displayName: '🇺🇸 마이클 - 미국 남성(kokoro)' },
  'am_fenrir': { type: 'kokoro', lang: '영어 남성', displayName: '🇺🇸 펜리르 - 미국 남성(kokoro)' },
  'am_puck': { type: 'kokoro', lang: '영어 남성', displayName: '🇺🇸 퍽 - 미국 남성(kokoro)' },
  'bf_emma': { type: 'kokoro', lang: '영국 여성', displayName: '🇬🇧 엠마 - 영국 여성(kokoro)' },
  'bf_isabella': { type: 'kokoro', lang: '영국 여성', displayName: '🇬🇧 이사벨라 - 영국 여성(kokoro)' },
  'bm_george': { type: 'kokoro', lang: '영국 남성', displayName: '🇬🇧 조지 - 영국 남성(kokoro)' },
  'bm_lewis': { type: 'kokoro', lang: '영국 남성', displayName: '🇬🇧 루이스 - 영국 남성(kokoro)' },
};

export const SETTINGS_FILE = './settings.json';
export const settings = existsSync(SETTINGS_FILE)
  ? JSON.parse(readFileSync(SETTINGS_FILE, 'utf-8')) 
  : { ttsChannels: {}, queueMode: {} };

if(!settings.queueMode) settings.queueMode = {};

export const ttsChanels = new Map(Object.entries(settings.ttsChannels));
export const currentFiles = new Map();
export const audioPlayers = new Map();
export const queueMode = new Map(Object.entries(settings.queueMode).map(([k, v]) => [k, Boolean(v)]));
export const ttsQueues = new Map();

export function saveSettings() {
  settings.queueMode = Object.fromEntries(queueMode);
  writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
}

// --- 목소리 설정: SQLite (users 테이블) 기반 ---

export function getUserVoice(userId) {
  const row = db.prepare('SELECT voice_key FROM users WHERE id = ?').get(userId);
  return row?.voice_key || DEFAULT_VOICE;
}

export function setUserVoice(userId, voiceKey, username = null) {
  const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(userId);
  if (existing) {
    db.prepare('UPDATE users SET voice_key = ? WHERE id = ?').run(voiceKey, userId);
  } else {
    db.prepare(`
      INSERT INTO users (id, username, voice_key)
      VALUES (?, ?, ?)
    `).run(userId, username ?? userId, voiceKey);
  }
}