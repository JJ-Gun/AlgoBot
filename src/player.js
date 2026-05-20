import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import { Readable } from 'stream';
import { audioPlayers, queueMode, ttsQueues } from './config.js';
import { generateTTS } from './tts.js';

const generateChains = new Map();

function createBufferResource(buffer) {
  return createAudioResource(Readable.from(buffer), {
    inputType: StreamType.Arbitrary,
  });
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

export async function playTTS(text, voiceKey, guildId, voiceChannel, interaction = null) {
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
      const t0 = performance.now();
      const audio = await generateTTS(text, voiceKey);
      console.log(`[TTS] generated ${(performance.now() - t0).toFixed(0)}ms`);
      if (!ttsQueues.has(guildId)) ttsQueues.set(guildId, []);
      ttsQueues.get(guildId).push({ audio });
      processQueue(guildId);
    });
    generateChains.set(guildId, newChain);
  } else {
    const t0 = performance.now();
    const audio = await generateTTS(text, voiceKey);
    console.log(`[TTS] generated ${(performance.now() - t0).toFixed(0)}ms`);
    const player = audioPlayers.get(guildId);
    player.play(createBufferResource(audio));
  }
}