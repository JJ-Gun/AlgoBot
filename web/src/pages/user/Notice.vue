<script setup lang="ts">
import { ref, onMounted, nextTick, type ComponentPublicInstance } from 'vue'
import { useRoute } from 'vue-router'

interface Notice {
  id: number
  title: string
  content: string
  created_at: string
}

const route = useRoute()

const notices = ref<Notice[]>([])
const loading = ref(true)
const expanded = ref<Set<number>>(new Set())
const hasOverflow = ref<Set<number>>(new Set())
const contentRefs = new Map<number, HTMLElement>()

function setContentRef(id: number, el: Element | ComponentPublicInstance | null) {
  if (el) contentRefs.set(id, el as HTMLElement)
  else contentRefs.delete(id)
}

function toggle(id: number) {
  if (expanded.value.has(id)) {
    expanded.value.delete(id)
  } else {
    expanded.value.add(id)
  }
  expanded.value = new Set(expanded.value)
}

function formatDate(dateStr: string) {
  return dateStr.slice(0, 10).replace(/-/g, '. ')
}

async function checkOverflow() {
  await nextTick()
  const overflowing = new Set<number>()
  for (const [id, el] of contentRefs) {
    if (el.scrollHeight > el.clientHeight + 1) {
      overflowing.add(id)
    }
  }
  hasOverflow.value = overflowing
}

async function loadNotices() {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/notices`)
    notices.value = await res.json()

    const targetId = Number(route.query.id)
    if (targetId && notices.value.some(n => n.id === targetId)) {
      expanded.value.add(targetId)
      expanded.value = new Set(expanded.value)
    }
  } catch (err) {
    console.error('공지사항 로딩 실패:', err)
  } finally {
    loading.value = false
    await checkOverflow()
  }
}

onMounted(loadNotices)
</script>

<template>
  <div class="notice">
    <div class="page-header">
      <h2>공지사항</h2>
    </div>

    <div v-if="loading" class="loading-notice">불러오는 중...</div>
    <div v-else-if="notices.length === 0" class="empty-notice">등록된 공지사항이 없습니다.</div>

    <div v-else class="notice-list">
      <div
        v-for="notice in notices"
        :key="notice.id"
        class="notice-card"
        @click="toggle(notice.id)"
      >
        <div class="notice-header">
          <div class="notice-title">{{ notice.title }}</div>
          <div class="notice-date">{{ formatDate(notice.created_at) }}</div>
        </div>
        <div
          class="notice-content"
          :class="{ expanded: expanded.has(notice.id) }"
          :ref="(el) => setContentRef(notice.id, el)"
        >
          {{ notice.content }}
        </div>
        <div v-if="hasOverflow.has(notice.id) && !expanded.has(notice.id)" class="notice-more">
          더보기 ▾
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notice {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 20px;
}

.page-header h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
}

.loading-notice,
.empty-notice {
  font-size: 13px;
  color: #aaa;
  padding: 24px 0;
  text-align: center;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.notice-card {
  background: #fff;
  border: 0.5px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
  cursor: pointer;
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.notice-title {
  font-size: 14px;
  font-weight: 500;
}

.notice-date {
  font-size: 12px;
  color: #aaa;
}

.notice-content {
  font-size: 13px;
  color: #666;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
}

.notice-content.expanded {
  white-space: pre-wrap;
  overflow: visible;
  display: block;
  -webkit-line-clamp: unset;
  line-clamp: unset;
}

.notice-more {
  margin-top: 4px;
  font-size: 12px;
  color: #378add;
}
</style>