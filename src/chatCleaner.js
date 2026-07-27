import {
  StringSelectMenuBuilder,
  UserSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
} from 'discord.js';
import { logError } from '../server/db/logger.js';

const sessions = new Map(); // key: userId -> 진행 상태

export function getSession(userId) {
  if (!sessions.has(userId)) {
    sessions.set(userId, { scope: null, range: null, author: null, content: null });
  }
  return sessions.get(userId);
}

export function resetSession(userId) {
  sessions.set(userId, { scope: null, range: null, author: null, content: null });
}

export function clearSession(userId) {
  sessions.delete(userId);
}

// --- Step 1: 범위 ---
export function buildScopeRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('cleaner_scope')
    .setPlaceholder('삭제할 범위를 선택하세요')
    .addOptions(
      { label: '이 채널에서', value: 'channel' },
      { label: '모든 채널에서', value: 'all' },
    );
  return new ActionRowBuilder().addComponents(menu);
}

// --- Step 2: 기간/개수 ---
const RANGE_OPTIONS = [
  { label: '최근 10개', value: 'count:10' },
  { label: '최근 50개', value: 'count:50' },
  { label: '최근 100개', value: 'count:100' },
  { label: '최근 500개', value: 'count:500' },
  { label: '최근 1000개', value: 'count:1000' },
  { label: '3분 전까지 보낸', value: 'time:3m' },
  { label: '10분 전까지 보낸', value: 'time:10m' },
  { label: '1시간 전까지 보낸', value: 'time:1h' },
  { label: '오늘까지 보낸', value: 'time:today' },
  { label: '어제까지 보낸', value: 'time:yesterday' },
  { label: '최근 7일간', value: 'time:7d' },
  { label: '최근 14일간', value: 'time:14d' },
];

export function buildRangeRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('cleaner_range')
    .setPlaceholder('삭제할 기간/개수를 선택하세요')
    .addOptions(RANGE_OPTIONS);
  return new ActionRowBuilder().addComponents(menu);
}

// --- Step 3: 작성자 필터 ---
export function buildAuthorRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('cleaner_author')
    .setPlaceholder('작성자 필터를 선택하세요')
    .addOptions(
      { label: '모든 메시지 중에서', value: 'all' },
      { label: '내가 보낸 메시지 중에서', value: 'me' },
      { label: '모든 봇이 보낸 메시지 중에서', value: 'all_bots' },
      { label: '특정 멤버/봇이 보낸 메시지 중에서', value: 'specific' },
    );
  return new ActionRowBuilder().addComponents(menu);
}

export function buildAuthorUserSelectRow() {
  const menu = new UserSelectMenuBuilder()
    .setCustomId('cleaner_author_user')
    .setPlaceholder('멤버 또는 봇을 선택하세요');
  return new ActionRowBuilder().addComponents(menu);
}

// --- Step 4: 내용 필터 ---
export function buildContentRow() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId('cleaner_content')
    .setPlaceholder('내용 필터를 선택하세요')
    .addOptions(
      { label: '모든 메시지를', value: 'all' },
      { label: 'N줄 이상 메시지를', value: 'min_lines' },
      { label: '첨부파일/사진/동영상이 있는 메시지를', value: 'attachment' },
      { label: '특정 텍스트를 포함하는 메시지를', value: 'contains' },
      { label: '특정 텍스트와 완전히 일치하는 메시지를', value: 'exact' },
      { label: '특정 텍스트를 포함하지 않는 메시지를', value: 'not_contains' },
      { label: '특정 텍스트와 완전히 일치하지 않는 메시지를', value: 'not_exact' },
    );
  return new ActionRowBuilder().addComponents(menu);
}

export function buildContentModal(kind) {
  const modal = new ModalBuilder()
    .setCustomId(`cleaner_content_modal:${kind}`)
    .setTitle(kind === 'min_lines' ? '최소 줄 수 입력' : '텍스트 입력');

  const input = new TextInputBuilder()
    .setCustomId('value')
    .setLabel(kind === 'min_lines' ? '몇 줄 이상인 메시지를 지울까요?' : '기준 텍스트를 입력하세요')
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  modal.addComponents(new ActionRowBuilder().addComponents(input));
  return modal;
}

// --- 확인 단계 ---
export function buildConfirmRow() {
  const confirm = new ButtonBuilder().setCustomId('cleaner_confirm').setLabel('제거').setStyle(ButtonStyle.Danger);
  const cancel = new ButtonBuilder().setCustomId('cleaner_cancel').setLabel('취소').setStyle(ButtonStyle.Secondary);
  return new ActionRowBuilder().addComponents(confirm, cancel);
}

export function summarize(state) {
  const scopeLabel = state.scope === 'all' ? '모든 채널' : '이 채널';
  const rangeLabel = RANGE_OPTIONS.find(o => o.value === state.range)?.label ?? state.range;
  let authorLabel = '모든 메시지';
  if (state.author?.type === 'me') authorLabel = '내가 보낸 메시지';
  if (state.author?.type === 'all_bots') authorLabel = '모든 봇이 보낸 메시지';
  if (state.author?.type === 'specific') authorLabel = `<@${state.author.userId}>가 보낸 메시지`;
  let contentLabel = '모든 메시지';
  if (state.content?.type === 'min_lines') contentLabel = `${state.content.value}줄 이상 메시지`;
  if (state.content?.type === 'attachment') contentLabel = '첨부파일이 있는 메시지';
  if (state.content?.type === 'contains') contentLabel = `"${state.content.value}" 포함 메시지`;
  if (state.content?.type === 'exact') contentLabel = `"${state.content.value}"와 완전히 일치하는 메시지`;
  if (state.content?.type === 'not_contains') contentLabel = `"${state.content.value}" 미포함 메시지`;
  if (state.content?.type === 'not_exact') contentLabel = `"${state.content.value}"와 다른 메시지`;

  return `**범위**: ${scopeLabel}\n**기간/개수**: ${rangeLabel}\n**작성자**: ${authorLabel}\n**내용**: ${contentLabel}\n\n위 조건에 맞는 메시지를 삭제할까요?`;
}

function getCutoffDate(range) {
  const now = new Date();
  switch (range) {
    case 'time:3m': return new Date(now - 3 * 60 * 1000);
    case 'time:10m': return new Date(now - 10 * 60 * 1000);
    case 'time:1h': return new Date(now - 60 * 60 * 1000);
    case 'time:today': { const d = new Date(now); d.setHours(0, 0, 0, 0); return d; }
    case 'time:yesterday': { const d = new Date(now); d.setDate(d.getDate() - 1); d.setHours(0, 0, 0, 0); return d; }
    case 'time:7d': return new Date(now - 7 * 24 * 60 * 60 * 1000);
    case 'time:14d': return new Date(now - 14 * 24 * 60 * 60 * 1000);
    default: return null; // time:all
  }
}

function matchesAuthor(message, authorFilter, invokerId) {
  if (!authorFilter || authorFilter.type === 'all') return true;
  if (authorFilter.type === 'me') return message.author.id === invokerId;
  if (authorFilter.type === 'all_bots') return message.author.bot;
  if (authorFilter.type === 'specific') return message.author.id === authorFilter.userId;
  return true;
}

function matchesContent(message, contentFilter) {
  if (!contentFilter || contentFilter.type === 'all') return true;
  const text = message.content ?? '';
  switch (contentFilter.type) {
    case 'min_lines': return text.split('\n').length >= Number(contentFilter.value);
    case 'attachment': return message.attachments.size > 0;
    case 'contains': return text.includes(contentFilter.value);
    case 'exact': return text === contentFilter.value;
    case 'not_contains': return !text.includes(contentFilter.value);
    case 'not_exact': return text !== contentFilter.value;
    default: return true;
  }
}

async function collectFromChannel(channel, state, invokerId) {
  const collected = [];
  const isCount = state.range?.startsWith('count:');
  const cutoff = isCount ? null : getCutoffDate(state.range);
  const countLimit = isCount ? Number(state.range.split(':')[1]) : null;

  let before;
  while (true) {
    const batch = await channel.messages.fetch({ limit: 100, before }).catch(() => null);
    if (!batch || batch.size === 0) break;

    for (const message of batch.values()) {
      if (cutoff && message.createdAt < cutoff) return collected;
      if (matchesAuthor(message, state.author, invokerId) && matchesContent(message, state.content)) {
        collected.push(message);
      }
      if (countLimit && collected.length >= countLimit) return collected;
    }

    before = batch.last().id;
  }
  return collected;
}

export async function collectAllMessages(interaction, state) {
  const invokerId = interaction.user.id;
  const channels = state.scope === 'all'
    ? interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildText && ch.viewable)
    : new Map([[interaction.channel.id, interaction.channel]]);

  const result = [];
  for (const channel of channels.values()) {
    try {
      const messages = await collectFromChannel(channel, state, invokerId);
      result.push(...messages);
    } catch (err) {
      logError(`청소 - 채널 조회 실패 (${channel.id}): ${err.message}`, 'ERROR', err.stack);
    }
  }
  return result;
}

export async function executeDelete(messages) {
  const TWO_WEEKS = 14 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  const byChannel = new Map();
  for (const m of messages) {
    if (!byChannel.has(m.channel.id)) byChannel.set(m.channel.id, []);
    byChannel.get(m.channel.id).push(m);
  }

  let deleted = 0;
  let failed = 0;

  for (const msgs of byChannel.values()) {
    const recent = msgs.filter(m => now - m.createdTimestamp < TWO_WEEKS);
    const old = msgs.filter(m => now - m.createdTimestamp >= TWO_WEEKS);

    for (let i = 0; i < recent.length; i += 100) {
      const chunk = recent.slice(i, i + 100);
      try {
        if (chunk.length === 1) {
          await chunk[0].delete();
        } else {
          await chunk[0].channel.bulkDelete(chunk, true);
        }
        deleted += chunk.length;
      } catch {
        failed += chunk.length;
      }
    }

    for (const m of old) {
      try {
        await m.delete();
        deleted += 1;
        await new Promise(r => setTimeout(r, 300));
      } catch {
        failed += 1;
      }
    }
  }

  return { deleted, failed };
}