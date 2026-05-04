import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { registerCommands } from './src/commands.js';
import { registerInteractionHandler } from './src/events/interaction.js';
import { registerMessageHandler } from './src/events/message.js';
import { registerVoiceStateHandler } from './src/events/voiceState.js';

// tts.js를 미리 import해서 TTS 엔진 초기화
await import('./src/tts.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

registerInteractionHandler(client);
registerMessageHandler(client);
registerVoiceStateHandler(client);

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} 봇 온라인!`);
  try {
    await registerCommands(client.user.id, process.env.DISCORD_TOKEN);
  } catch (err) {
    console.error('슬래시 명령어 등록 실패:', err);
  }
});

client.login(process.env.DISCORD_TOKEN);