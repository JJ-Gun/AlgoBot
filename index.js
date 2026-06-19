import 'dotenv/config';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { createServer } from 'http';
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

const token = process.env.NODE_ENV === 'development'
  ? process.env.DEV_TOKEN
  : process.env.DISCORD_TOKEN;

registerInteractionHandler(client);
registerMessageHandler(client);
registerVoiceStateHandler(client);

client.once(Events.ClientReady, async () => {
  console.log(`✅ ${client.user.tag} 봇 온라인!`);
  try {
    await registerCommands(client.user.id, token);
  } catch (err) {
    console.error('슬래시 명령어 등록 실패:', err);
  }
});

client.login(token);

// 헬스체크용 내부 HTTP 서버 (Express 백엔드가 ping용으로 사용)
const HEALTH_PORT = process.env.BOT_HEALTH_PORT || 3001;
createServer((req, res) => {
  if (req.url === '/health') {
    const isReady = client.ws.status === 0; // 0 = READY
    res.writeHead(isReady ? 200 : 503, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ready: isReady, ping: client.ws.ping }));
    return;
  }
  res.writeHead(404);
  res.end();
}).listen(HEALTH_PORT, () => {
  console.log(`헬스체크 서버 실행 중: http://localhost:${HEALTH_PORT}/health`);
});