import { Events } from 'discord.js';
import { ttsChanels, DEFAULT_VOICE, getUserVoice } from '../config.js';
import { playTTS } from '../player.js';
import { logError } from '../../server/db/logger.js';

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

    const voiceKey = getUserVoice(message.author.id);
    try {
      await playTTS(message.content, voiceKey, message.guild.id, voiceChannel, null, message.author.id);
    } catch (err) {
      logError(`메시지 TTS 처리 실패 · guild: ${message.guild.id} · ${err.message}`, 'ERROR', err.stack);
      message.react('<:speakfail:1498223231369482381>').catch(() => {});
    }
  });
}