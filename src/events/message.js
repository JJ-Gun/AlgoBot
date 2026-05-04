import { Events } from 'discord.js';
import { ttsChanels, userVoices, DEFAULT_VOICE } from '../config.js';
import { playTTS } from '../player.js';

export function registerMessageHandler(client) {
  client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    const ttsChannelId = ttsChanels.get(message.guild?.id);
    if (!ttsChannelId || message.channel.id !== ttsChannelId) return;
    if (message.content.startsWith('/')) return;

    // 첨부파일 있으면 제외
    if (message.attachments.size > 0) return;

    // 링크 포함 시 제외
    if (/https?:\/\/\S+/.test(message.content)) return;

    // 커스텀 이모지, 멘션만 있으면 제외
    const cleaned = message.content
      .replace(/<a?:\w+:\d+>/g, '')
      .replace(/<@!?\d+>/g, '')
      .replace(/<#\d+>/g, '')
      .trim();
    if (!cleaned) return;

    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel) return;

    const voiceKey = userVoices.get(message.author.id) || DEFAULT_VOICE;
    try {
      await playTTS(message.content, voiceKey, message.guild.id, voiceChannel);
    } catch (err) {
      console.error('TTS 오류:', err);
      message.react('<:speakfail:1498223231369482381>').catch(() => {});
    }
  });
}