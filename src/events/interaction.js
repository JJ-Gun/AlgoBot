import { Events, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } from 'discord.js';
import { getVoiceConnection, joinVoiceChannel, createAudioPlayer } from '@discordjs/voice';
import { VOICES, DEFAULT_VOICE, audioPlayers, ttsChanels, settings, saveSettings, queueMode, getUserVoice, setUserVoice } from '../config.js';
import { playTTS, skipTTS } from '../player.js';
import { logError } from '../../server/db/logger.js';

const WEB_URL = process.env.WEB_URL

export function registerInteractionHandler(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    const { commandName } = interaction;

    // Select Menu 선택 처리
    if (interaction.isStringSelectMenu() && interaction.customId === 'voice_select') {
      const voiceKey = interaction.values[0]
      const voice = VOICES[voiceKey]
      if (!voice) return interaction.update({ content: '알 수 없는 목소리입니다.', components: [] })

      try {
        setUserVoice(interaction.user.id, voiceKey, interaction.user.username)

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('voice_select')
          .setPlaceholder('목소리를 선택하세요')
          .addOptions(
            Object.entries(VOICES).map(([key, val]) => ({
              label: val.displayName,
              description: val.lang,
              value: key,
              default: key === voiceKey,
            }))
          )

        const row = new ActionRowBuilder().addComponents(selectMenu)

        await interaction.update({
          content: `목소리를 **${voice.displayName}** 로 변경했어요!\n\n더 많은 설정은 [웹페이지](${WEB_URL})에서 할 수 있어요.`,
          components: [row],
        })
      } catch (err) {
        logError(`목소리 변경 실패 · user: ${interaction.user.id} · ${err.message}`)
        await interaction.update({ content: '목소리 변경 중 오류가 발생했습니다.', components: [] })
      }
      return
    }

    if (!interaction.isChatInputCommand()) return;

    try {
      if (commandName === '입장') {
        const voiceChannel = interaction.member?.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: '먼저 음성 채널에 들어가세요!', flags: 64 });

        const existingConnection = getVoiceConnection(interaction.guild.id);
        if (existingConnection && existingConnection.joinConfig.channelId !== voiceChannel.id) {
          return interaction.reply({ content: '봇이 이미 다른 음성 채널에서 사용 중이에요!', flags: 64 });
        }

        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guild.id,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        const player = createAudioPlayer();
        audioPlayers.set(interaction.guild.id, player);
        connection.subscribe(player);
        return interaction.reply({ content: `**${voiceChannel.name}** 채널 입장!`, flags: 64 });
      }

      if (commandName === '퇴장') {
        const connection = getVoiceConnection(interaction.guild.id);
        if (connection) {
          connection.destroy();
          audioPlayers.delete(interaction.guild.id);
          return interaction.reply({ content: '퇴장했습니다.', flags: 64 });
        }
        return interaction.reply({ content: '봇이 음성 채널에 없습니다.', flags: 64 });
      }

      if (commandName === '채널설정') {
        await interaction.deferReply({ flags: 64 });

        const guildId = interaction.guild.id;
        const currentChannelId = ttsChanels.get(guildId);
        const newChannelId = interaction.channel.id;
        const newChannelName = interaction.channel.name;

        if (currentChannelId === newChannelId) {
          ttsChanels.delete(guildId);
          delete settings.ttsChannels[guildId];
          saveSettings();
          return interaction.editReply({ content: `**#${newChannelName}** 채널 TTS 설정을 해제했습니다.` });
        }

        if (currentChannelId) {
          const prevChannel = interaction.guild.channels.cache.get(currentChannelId);
          const prevChannelName = prevChannel ? prevChannel.name : currentChannelId;
          ttsChanels.set(guildId, newChannelId);
          settings.ttsChannels[guildId] = newChannelId;
          saveSettings();
          return interaction.editReply({ content: `**#${prevChannelName}** 채널 해제 → **#${newChannelName}** 채널로 TTS 채널을 변경했습니다.` });
        }

        ttsChanels.set(guildId, newChannelId);
        settings.ttsChannels[guildId] = newChannelId;
        saveSettings();
        return interaction.editReply({ content: `**#${newChannelName}** 채널을 TTS 채널로 설정했습니다.` });
      }

      if (commandName === '목소리') {
        const currentVoiceKey = getUserVoice(interaction.user.id)
        const currentVoice = VOICES[currentVoiceKey]

        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('voice_select')
          .setPlaceholder('목소리를 선택하세요')
          .addOptions(
            Object.entries(VOICES).map(([key, val]) => ({
              label: val.displayName,
              description: val.lang,
              value: key,
              default: key === currentVoiceKey,
            }))
          )

        const row = new ActionRowBuilder().addComponents(selectMenu)

        return interaction.reply({
          content: `현재 목소리: **${currentVoice?.displayName ?? currentVoiceKey}**\n목소리를 선택해주세요.`,
          components: [row],
          flags: 64,
        })
      }

      if (commandName === '내목소리') {
        const voiceKey = getUserVoice(interaction.user.id)
        const voice = VOICES[voiceKey]
        return interaction.reply({
          content: `현재 내 목소리: **${voice?.displayName ?? voiceKey}**\n\n더 많은 설정은 [웹페이지](${WEB_URL})에서 할 수 있어요.`,
          flags: 64,
        });
      }

      if (commandName === 'tts') {
        const text = interaction.options.getString('텍스트');
        const voiceChannel = interaction.member?.voice.channel;
        if (!voiceChannel) return interaction.reply({ content: '먼저 음성 채널에 들어가세요!', flags: 64 });

        await interaction.deferReply({ flags: 64 });
        const voiceKey = getUserVoice(interaction.user.id)
        try {
          await playTTS(text, voiceKey, interaction.guild.id, voiceChannel, interaction, interaction.user.id);
          await interaction.editReply({ content: '재생 중!' });
        } catch (err) {
          logError(`/tts 명령어 처리 실패 · guild: ${interaction.guild.id} · ${err.message}`);
          await interaction.editReply({ content: 'TTS 생성 중 오류가 발생했습니다.' });
        }
        return;
      }

      if (commandName === '큐모드') {
        const current = queueMode.get(interaction.guild.id) ?? false;
        queueMode.set(interaction.guild.id, !current);
        saveSettings();
        return interaction.reply({ content: `큐 모드 ${!current ? '켜짐' : '꺼짐'}`, flags: 64 });
      }

      if (commandName === '스킵') {
        const success = skipTTS(interaction.guild.id);
        return interaction.reply({ content: success ? '건너뜁니다!' : '재생 중인 문장이 없어요.', flags: 64 });
      }
    } catch (err) {
      logError(`'/${commandName}' 명령어 처리 중 예외 · guild: ${interaction.guild?.id} · ${err.message}`);
      if (interaction.deferred || interaction.replied) {
        await interaction.editReply({ content: '명령어 처리 중 오류가 발생했습니다.' }).catch(() => {});
      } else {
        await interaction.reply({ content: '명령어 처리 중 오류가 발생했습니다.', flags: 64 }).catch(() => {});
      }
    }
  });
}