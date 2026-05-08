import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  StreamType,
} from '@discordjs/voice';

import {
  Readable,
} from 'stream';

import {
  audioPlayers,
  queueMode,
  ttsQueues,
} from './config.js';

import {
  generateTTS,
} from './tts.js';

function createBufferResource(bufferOrStream) {

  if (Buffer.isBuffer(bufferOrStream)) {

    return createAudioResource(
      Readable.from(bufferOrStream),
      {
        inputType: StreamType.Arbitrary,
      }
    );
  }

  return createAudioResource(
    bufferOrStream,
    {
      inputType: StreamType.Arbitrary,
    }
  );
}

async function processQueue(guildId) {

  const queue = ttsQueues.get(guildId);

  if (!queue || queue.length === 0) {
    return;
  }

  const player = audioPlayers.get(guildId);

  if (
    !player ||
    player.state.status === AudioPlayerStatus.Playing
  ) {
    return;
  }

  const { audio } = queue.shift();

  const resource = createBufferResource(audio);

  player.play(resource);

  player.once(
    AudioPlayerStatus.Idle,
    () => {
      processQueue(guildId);
    }
  );
}

export function skipTTS(guildId) {

  const player = audioPlayers.get(guildId);

  if (!player) {
    return false;
  }

  player.stop();

  return true;
}

export function clearQueue(guildId) {

  ttsQueues.set(guildId, []);
}

export async function playTTS(
  text,
  voiceKey,
  guildId,
  voiceChannel,
  interaction = null
) {

  let connection = getVoiceConnection(guildId);

  if (!connection) {

    connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId,
      adapterCreator:
        voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    audioPlayers.set(guildId, player);

    ttsQueues.set(guildId, []);

    connection.subscribe(player);
  }
  else {

    const currentChannelId =
      connection.joinConfig.channelId;

    if (currentChannelId !== voiceChannel.id) {

      if (interaction) {

        await interaction.reply({
          content:
            '봇이 이미 다른 음성 채널에서 사용 중이에요!',
          ephemeral: true,
        });
      }

      return;
    }
  }

  const t0 = performance.now();

  const audio = await generateTTS(
    text,
    voiceKey
  );

  console.log(
    `[TTS] generated ${(performance.now() - t0).toFixed(0)}ms`
  );

  const player = audioPlayers.get(guildId);

  const isQueueMode =
    queueMode.get(guildId) ?? false;

  if (isQueueMode) {

    if (!ttsQueues.has(guildId)) {
      ttsQueues.set(guildId, []);
    }

    ttsQueues.get(guildId).push({
      audio,
    });

    processQueue(guildId);
  }
  else {

    const resource =
      createBufferResource(audio);

    player.play(resource);
  }
}