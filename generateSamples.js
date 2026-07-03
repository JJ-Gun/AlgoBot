import 'dotenv/config'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { generateTTS } from './src/tts.js'
import { VOICES } from './src/config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = join(__dirname, 'server/public/samples')

if (!existsSync(OUTPUT_DIR)) {
  mkdirSync(OUTPUT_DIR, { recursive: true })
}

const SAMPLE_TEXT = '안녕하세요, 알고봇 목소리 미리듣기 테스트입니다. Hello, this is a voice preview test for AlgoBot.'

const targetKey = process.argv[2]

async function generate(key) {
  const voice = VOICES[key]
  if (!voice) {
    console.error(`알 수 없는 목소리: ${key}`)
    console.log(`사용 가능한 목소리: ${Object.keys(VOICES).join(', ')}`)
    process.exit(1)
  }

  const outputPath = join(OUTPUT_DIR, `${key}.wav`)
  console.log(`[생성 중] ${voice.displayName}`)
  const audio = await generateTTS(SAMPLE_TEXT, key)
  writeFileSync(outputPath, audio)
  console.log(`[완료] ${key}.wav`)
}

if (!targetKey) {
  console.error('목소리 키를 입력해 주세요.')
  console.log(`사용법: node generateSamples.js [voice_key]`)
  console.log(`사용 가능한 목소리: ${Object.keys(VOICES).join(', ')}`)
  process.exit(1)
}

generate(targetKey)