import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import { Readable } from 'stream';
import { audioPlayers, queueMode, ttsQueues, VOICES } from './config.js';
import { generateTTS } from './tts.js';
import db from '../server/db/index.js';
import { logError } from '../server/db/logger.js';

const generateChains = new Map();

function createBufferResource(audio) {
  const input = Buffer.isBuffer(audio) ? Readable.from(audio) : audio;
  return createAudioResource(input, {
    inputType: StreamType.Arbitrary,
  });
}

function attachStreamErrorHandler(audio, onError) {
  if (Buffer.isBuffer(audio) || typeof audio?.on !== 'function') return;
  audio.on('error', (err) => {
    if (err.code === 'ERR_STREAM_PREMATURE_CLOSE') return; // 스킵/중단 등으로 재생이 끊긴 것 - 실제 실패 아님
    if (onError) onError(err);
    else logError(`TTS 스트리밍 오류: ${err.message}`, 'ERROR', err.stack);
  });
}

function logTTS(guildId, userId, voiceKey) {
  try {
    const engine = VOICES[voiceKey]?.type ?? 'unknown';
    db.prepare(`
      INSERT INTO tts_logs (guild_id, user_id, voice_key, engine)
      VALUES (?, ?, ?, ?)
    `).run(guildId, userId, voiceKey, engine);
  } catch (err) {
    logError(`TTS 로그 기록 실패: ${err.message}`, 'ERROR', err.stack);
  }
}

async function processQueue(guildId) {
  const queue = ttsQueues.get(guildId);
  if (!queue || queue.length === 0) return;
  const player = audioPlayers.get(guildId);
  if (!player || player.state.status !== AudioPlayerStatus.Idle) return;
  const { audio } = queue.shift();
  const resource = createBufferResource(audio);
  player.play(resource);
  player.once(AudioPlayerStatus.Idle, () => {
    processQueue(guildId);
  });
}

export function skipTTS(guildId) {
  const player = audioPlayers.get(guildId);
  if (!player) return false;
  player.stop();
  return true;
}

export function clearQueue(guildId) {
  ttsQueues.set(guildId, []);
  generateChains.set(guildId, Promise.resolve());
}

export async function playTTS(text, voiceKey, guildId, voiceChannel, interaction = null, userId = null, onPlaybackError = null) {
  let connection = getVoiceConnection(guildId);

  if (!connection) {
    try {
      connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });
      const player = createAudioPlayer();
      audioPlayers.set(guildId, player);
      ttsQueues.set(guildId, []);
      generateChains.set(guildId, Promise.resolve());
      connection.subscribe(player);
    } catch (err) {
      logError(`음성 채널 연결 실패 · guild: ${guildId} · ${err.message}`, 'ERROR', err.stack);
      throw err;
    }
  } else {
    const currentChannelId = connection.joinConfig.channelId;
    if (currentChannelId !== voiceChannel.id) {
      if (interaction) {
        await interaction.reply({
          content: '봇이 이미 다른 음성 채널에서 사용 중이에요!',
          ephemeral: true,
        });
      }
      return;
    }
  }

  const isQueueMode = queueMode.get(guildId) ?? false;

  if (isQueueMode) {
    const prevChain = generateChains.get(guildId) ?? Promise.resolve();
    const newChain = prevChain.then(async () => {
      let audio;
      try {
        const t0 = performance.now();
        audio = await generateTTS(text, voiceKey);
        console.log(`[TTS] generated ${(performance.now() - t0).toFixed(0)}ms`);
      } catch (err) {
        logError(`TTS 생성 실패 (${voiceKey}) · guild: ${guildId} · ${err.message}`, 'ERROR', err.stack);
        if (onPlaybackError) onPlaybackError(err);
        return;
      }
      attachStreamErrorHandler(audio, onPlaybackError);
      logTTS(guildId, userId, voiceKey);
      if (!ttsQueues.has(guildId)) ttsQueues.set(guildId, []);
      ttsQueues.get(guildId).push({ audio });
      processQueue(guildId);
    });
    generateChains.set(guildId, newChain);
  } else {
    let audio;
    try {
      const t0 = performance.now();
      audio = await generateTTS(text, voiceKey);
      console.log(`[TTS] generated ${(performance.now() - t0).toFixed(0)}ms`);
    } catch (err) {
      logError(`TTS 생성 실패 (${voiceKey}) · guild: ${guildId} · ${err.message}`, 'ERROR', err.stack);
      throw err;
    }
    attachStreamErrorHandler(audio, onPlaybackError);
    logTTS(guildId, userId, voiceKey);
    const player = audioPlayers.get(guildId);
    player.play(createBufferResource(audio));
  }
}