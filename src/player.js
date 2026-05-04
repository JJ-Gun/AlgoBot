import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';
import { createReadStream } from 'fs';
import { unlink } from 'fs/promises';
import { audioPlayers, queueMode, ttsQueues, currentFiles } from './config.js';
import { generateTTS } from './tts.js';

async function processQueue(guildId) {
  const queue = ttsQueues.get(guildId);
  if (!queue || queue.length === 0) return;

  const player = audioPlayers.get(guildId);
  if (!player || player.state.status === AudioPlayerStatus.Playing) return;

  const { filePath } = queue.shift();
  const resource = createAudioResource(createReadStream(filePath), {
    inputType: StreamType.Arbitrary,
  });
  currentFiles.set(guildId, filePath);
  player.play(resource);
  player.once('idle', () => {
    unlink(filePath).catch(() => {});
    currentFiles.delete(guildId);
    processQueue(guildId);
  });
}

export function skipTTS(guildId) {
  const player = audioPlayers.get(guildId);
  if (!player) return false;
  const queue = ttsQueues.get(guildId) || [];
  // 현재 재생 중인 파일 삭제 후 다음 항목 재생
  player.stop();
  if (queue.length > 0) {
    processQueue(guildId);
  }
  return true;
}

export function clearQueue(guildId) {
  const queue = ttsQueues.get(guildId) || [];
  for (const { filePath } of queue) {
    unlink(filePath).catch(() => {});
  }
  ttsQueues.set(guildId, []);
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
    connection.subscribe(player);
  } else {
    const currentChannelId = connection.joinConfig.channelId;
    if (currentChannelId !== voiceChannel.id) {
      if (interaction) await interaction.reply({ content: '봇이 이미 다른 음성 채널에서 사용 중이에요!', ephemeral: true });
      return;
    }
  }

  const filePath = await generateTTS(text, voiceKey);
  const player = audioPlayers.get(guildId);
  const isQueueMode = queueMode.get(guildId) ?? false;

  if(isQueueMode){
    if(!ttsQueues.has(guildId)) ttsQueues.set(guildId, []);
    ttsQueues.get(guildId).push({ filePath });
    processQueue(guildId);
  }
  else{
    const resource = createAudioResource(createReadStream(filePath), {
      inputType: StreamType.Arbitrary,
    });
    currentFiles.set(guildId, filePath);
    player.play(resource);
    player.once('idle', () => {
      unlink(filePath).catch(() => {});
      currentFiles.delete(guildId);
    });
  }
}