import { Events } from 'discord.js';
import { getVoiceConnection, joinVoiceChannel, createAudioPlayer } from '@discordjs/voice';
import { VOICES, DEFAULT_VOICE, userVoices, audioPlayers, ttsChanels, settings, saveSettings, queueMode } from '../config.js';
import { playTTS, skipTTS } from '../player.js';

export function registerInteractionHandler(client) {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName } = interaction;

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
      ttsChanels.set(interaction.guild.id, interaction.channel.id);
      settings.ttsChannels[interaction.guild.id] = interaction.channel.id;
      saveSettings();
      return interaction.editReply({ content: '이 채널을 TTS 채널로 설정했어요! 봇을 재시작해도 유지됩니다.' });
    }

    if (commandName === '목소리') {
      const voiceKey = interaction.options.getString('선택');
      if (!voiceKey) {
        const current = userVoices.get(interaction.user.id) || DEFAULT_VOICE;
        const list = Object.entries(VOICES)
          .map(([key, val]) => `\`${key}\` - ${val.lang}`)
          .join('\n');
        return interaction.reply({ content: `**사용 가능한 목소리:**\n${list}\n\n**현재 내 목소리:** \`${current}\``, flags: 64 });
      }
      userVoices.set(interaction.user.id, voiceKey);
      saveSettings();
      return interaction.reply({ content: `목소리를 \`${voiceKey}\` 로 변경했어요!`, flags: 64 });
    }

    if (commandName === '내목소리') {
      const current = userVoices.get(interaction.user.id) || DEFAULT_VOICE;
      return interaction.reply({ content: `**현재 내 목소리:** \`${current}\``, flags: 64 });
    }

    if (commandName === 'tts') {
      const text = interaction.options.getString('텍스트');
      const voiceChannel = interaction.member?.voice.channel;
      if (!voiceChannel) return interaction.reply({ content: '먼저 음성 채널에 들어가세요!', flags: 64 });

      await interaction.deferReply({ flags: 64 });
      const voiceKey = userVoices.get(interaction.user.id) || DEFAULT_VOICE;
      try {
        await playTTS(text, voiceKey, interaction.guild.id, voiceChannel, interaction);
        await interaction.editReply({ content: '재생 중!' });
      } catch (err) {
        console.error('TTS 오류:', err);
        await interaction.editReply({ content: 'TTS 생성 중 오류가 발생했습니다.' });
      }
    }

    if(commandName === '큐모드'){
      const current = queueMode.get(interaction.guild.id) ?? false;
      queueMode.set(interaction.guild.id, !current);
      saveSettings();
      return interaction.reply({ content: `큐 모드 ${!current ? '켜짐' : '꺼짐'}`, flags: 64 });
    }

    if(commandName === '스킵'){
      const success = skipTTS(interaction.guild.id);
      return interaction.reply({ content: success ? '건너뜁니다!' : '재생 중인 문장이 없어요.', flags: 64});
    }
  });
}