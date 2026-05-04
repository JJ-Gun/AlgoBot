import { Events } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { audioPlayers, ttsQueues, currentFiles } from '../config.js';
import { clearQueue } from '../player.js';
import { unlink } from 'fs/promises';

export function registerVoiceStateHandler(client) {
  client.on(Events.VoiceStateUpdate, (oldState, newState) => {
    const guild = oldState.guild || newState.guild;
    const connection = getVoiceConnection(guild.id);
    if (!connection) return;

    const botChannelId = connection.joinConfig.channelId;
    const voiceChannel = guild.channels.cache.get(botChannelId);
    if (!voiceChannel) return;

    // 봇 제외하고 채널에 남은 멤버 수 확인
    const members = voiceChannel.members.filter(m => !m.user.bot);
    if (members.size === 0) {
      clearQueue(guild.id);
      const player = audioPlayers.get(guild.id);
      if(player){
        player.stop();
        const currentFile = currentFiles.get(guild.id);
        if(currentFile){
            unlink(currentFile).catch(() => {});
            currentFiles.delete(guild.id);
        }
      }
      connection.destroy();
      audioPlayers.delete(guild.id);
      ttsQueues.delete(guild.id);
    }
  });
}