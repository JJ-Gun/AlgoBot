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

const generateChains = new Map();

function createBufferResource(buffer) {
  return createAudioResource(Readable.from(buffer), {
    inputType: StreamType.Arbitrary,
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
    console.error('TTS 로그 기록 실패:', err);
  }
}

function logError(message) {
  console.error(message);
  try {
    db.prepare('INSERT INTO error_logs (level, message) VALUES (?, ?)').run('ERROR', message);
  } catch (err) {
    console.error('에러 로그 기록 실패:', err);
  }
}

async function processQueue(guildId) {
  const queue = ttsQueues.get(guildId);
  if (!queue || queue.length === 0) return;
  const player = audioPlayers.get(guildId);
  if (!player || player.state.status === AudioPlayerStatus.Playing) return;
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

export async function playTTS(text, voiceKey, guildId, voiceChannel, interaction = null, userId = null) {
  let connection = getVoiceConnection(guildId);

  if (!connection) {
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
        logError(`TTS 생성 실패 (${voiceKey}) · guild: ${guildId} · ${err.message}`);
        return;
      }
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
      logError(`TTS 생성 실패 (${voiceKey}) · guild: ${guildId} · ${err.message}`);
      throw err;
    }
    logTTS(guildId, userId, voiceKey);
    const player = audioPlayers.get(guildId);
    player.play(createBufferResource(audio));
  }
}