import { SlashCommandBuilder, REST, Routes } from 'discord.js';
import { VOICES } from './config.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('입장')
    .setDescription('봇을 음성 채널에 입장시킵니다'),
  new SlashCommandBuilder()
    .setName('퇴장')
    .setDescription('봇을 음성 채널에서 퇴장시킵니다'),
  new SlashCommandBuilder()
    .setName('채널설정')
    .setDescription('현재 채널을 TTS 채널로 설정합니다'),
  new SlashCommandBuilder()
    .setName('목소리')
    .setDescription('목소리를 변경합니다')
    .addStringOption(option =>
      option.setName('선택')
        .setDescription('변경할 목소리 이름')
        .setRequired(true)
        .addChoices(
          ...Object.entries(VOICES).map(([key, val]) => ({ name: val.displayName, value: key }))
        )
    ),
  new SlashCommandBuilder()
    .setName('내목소리')
    .setDescription('현재 내 목소리를 확인합니다'),
  new SlashCommandBuilder()
    .setName('tts')
    .setDescription('텍스트를 음성으로 읽습니다')
    .addStringOption(option =>
      option.setName('텍스트')
        .setDescription('읽을 텍스트')
        .setRequired(true)
    ),
  new SlashCommandBuilder()
    .setName('큐모드')
    .setDescription('큐 모드를 켜거나 끕니다 (켜면 재생 중 새 문장을 대기열에 추가'),
  new SlashCommandBuilder()
    .setName('스킵')
    .setDescription('현재 재생 중인 문장을 건너뜁니다.'),
].map(cmd => cmd.toJSON());

export async function registerCommands(clientId, token) {
  const rest = new REST({ version: '10' }).setToken(token);
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  console.log('슬래시 명령어 등록 완료!');
}