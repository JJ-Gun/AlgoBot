# 알고봇 TTS 봇

Discord 음성 채널에서 텍스트를 읽어주는 TTS(Text-to-Speech) 봇입니다.

[업데이트 로그 바로가기](#업데이트-로그)

---

## 프로젝트 배경
디스코드에서 TTS 봇들을 사용하는 이유는 주로 마이크를 사용하지 못하지만 음성 채널에서 소통하기 위해 사용됩니다.
기존에 사용하던 TTS 봇들은 서버 이슈나 사용자 몰림으로 인해 갑자기 사용이 불가능해지는 경우가 자주 있었습니다. 이 문제를 해결하기 위해 직접 운영하는 서버 기반의 TTS 봇을 개발했습니다.

외부 API에만 의존하지 않고 로컬 TTS 엔진을 함께 운영해, 외부 서비스 장애가 발생하더라도 항상 사용할 수 있는 것을 목표로 합니다.

---

## 대상

- 음성 채널에서 TTS를 자주 사용하는 Discord 서버
- 기존 TTS 봇의 잦은 장애로 불편을 겪는 사용자
- 다양한 목소리와 언어를 지원하는 TTS가 필요한 서버

---

## TTS 엔진 구성

| 엔진 | 언어 | 방식 | 특징 |
|------|------|------|------|
| edge-tts | 한국어 | MS 서버 (비공식) | 가장 빠름, 거의 실시간, 자연스러운 발음 |
| MeloTTS | 한국어 | 로컬 추론 | 완전 오프라인, 외부 장애 무관 |
| Kokoro | 영어/한국어 | 로컬 추론 | IPA 변환으로 한국어 지원, 다양한 영어 목소리 |

edge-tts가 기본 엔진으로 사용되며, 로컬 엔진(MeloTTS, Kokoro)은 외부 API 장애 시 대안으로 활용할 수 있습니다.

---

## 주요 기능

### 자동 TTS
`/채널설정`으로 지정한 채널에 메시지를 입력하면 자동으로 TTS를 재생합니다. 봇이 음성 채널에 없으면 자동으로 입장합니다.

### 목소리 선택
사용자별로 목소리를 설정할 수 있습니다. 설정은 서버 간에 공유되며 재시작 후에도 유지됩니다.

### 큐 모드
- **큐 모드 OFF (기본)**: 새 메시지가 오면 현재 재생을 중단하고 즉시 재생합니다.
- **큐 모드 ON**: 현재 재생이 완료된 후 순서대로 재생합니다. 여러 사람이 동시에 입력해도 순서가 보장됩니다.

### 텍스트 전처리
- 자모(`ㅋㅋ`, `ㄹㅇ` 등) → 한글 이름으로 변환
- 영어 약어(`tts`, `gg` 등) → 알파벳 한 글자씩 읽기
- 영어 일반 단어(`hello`, `control` 등) → 그대로 발음
- 숫자 → 한글 숫자로 변환
- 링크, 이미지, 멘션만 있는 메시지 → 자동 무시

### 기타
- 채널에 아무도 없으면 자동 퇴장
- TTS 생성 실패 시 이모지 반응으로 피드백
- 이미 다른 음성 채널에서 봇 사용 중이면 가져가기 불가

---

## 명령어

| 명령어 | 설명 |
|--------|------|
| `/입장` | 현재 입장해 있는 음성 채널에 봇 입장 |
| `/퇴장` | 봇 음성 채널에서 퇴장 및 큐 초기화 |
| `/채널설정` | 현재 텍스트 채널을 TTS 채널로 설정 |
| `/목소리` | 목소리 변경 |
| `/내목소리` | 현재 설정된 목소리 확인 |
| `/tts [텍스트]` | 입력한 텍스트를 TTS로 재생 |
| `/큐모드` | 큐 모드 ON/OFF 전환 |
| `/스킵` | 현재 재생 중인 TTS 스킵 |

---

## 목소리 목록

### 한국어 (edge-tts)
| 키 | 설명 |
|----|------|
| `ko-SunHi` | 🇰🇷 선희 - 한국어 여성 (기본값) |
| `ko-InJoon` | 🇰🇷 인준 - 한국어 남성 |
| `ko-Hyunsu` | 🇰🇷 현수 - 한국어 남성 |

### 한국어 로컬 (MeloTTS)
| 키 | 설명 |
|----|------|
| `ko-local` | 🇰🇷 로컬 - 한국어 로컬 |

### 영어 (Kokoro)
| 키 | 설명 |
|----|------|
| `af_heart` | 🇺🇸 Heart - 미국 영어 여성 |
| `af_bella` | 🇺🇸 Bella - 미국 영어 여성 |
| `af_nicole` | 🇺🇸 Nicole - 미국 영어 여성 |
| `af_sarah` | 🇺🇸 Sarah - 미국 영어 여성 |
| `am_adam` | 🇺🇸 Adam - 미국 영어 남성 |
| `am_michael` | 🇺🇸 Michael - 미국 영어 남성 |
| `am_fenrir` | 🇺🇸 Fenrir - 미국 영어 남성 |
| `am_puck` | 🇺🇸 Puck - 미국 영어 남성 |
| `bf_emma` | 🇬🇧 Emma - 영국 영어 여성 |
| `bf_isabella` | 🇬🇧 Isabella - 영국 영어 여성 |
| `bm_george` | 🇬🇧 George - 영국 영어 남성 |
| `bm_lewis` | 🇬🇧 Lewis - 영국 영어 남성 |

---

## 아키텍처

```
Discord 봇 (Node.js)
    ├── edge-tts-universal  (MS 서버 스트리밍)
    ├── HTTP POST → MeloTTS Flask 서버 (127.0.0.1:5050)
    └── HTTP POST → Kokoro Flask 서버  (127.0.0.1:5051)
```

Discord 봇과 TTS 엔진 서버를 분리해 각 엔진을 독립적으로 관리합니다. Flask 서버는 localhost에서만 통신하며, 오디오 데이터를 메모리 버퍼로 반환해 디스크 I/O 없이 처리합니다.

---

## 파일 구조

```
AlgoBot/
├── index.js                    # 진입점
├── melo_server.py              # MeloTTS Flask 서버 (포트 5050)
├── kokoro_server.py            # Kokoro Flask 서버 (포트 5051)
├── src/
│   ├── config.js               # VOICES, 설정, settings.json 관리
│   ├── tts.js                  # TTS 생성 (generateTTS)
│   ├── player.js               # 음성 재생 (playTTS, 큐 관리)
│   ├── commands.js             # 슬래시 명령어 정의 및 등록
│   ├── textProcessor.js        # 텍스트 전처리
│   └── events/
│       ├── interaction.js      # 슬래시 명령어 처리
│       └── message.js          # TTS 채널 자동 감지
├── melo-venv/                  # MeloTTS Python 가상환경
├── kokoro-venv/                # Kokoro Python 가상환경
├── settings.json               # 서버별 채널/목소리/큐모드 설정 저장
└── .env                        # 환경 변수
```

---

## 서버 환경

- **인스턴스**: AWS EC2 t3.medium (x86, 2vCPU, 4GB RAM)
- **OS**: Ubuntu 24.04 LTS
- **스왑**: 4GB
- **고정 IP**: Elastic IP 연결
- **프로세스 관리**: pm2 (melo, kokoro, bot 각각 독립 실행, 재시작 시 자동 복구)

---

## 실행

### 의존성 설치

```bash
npm install
```

```bash
# MeloTTS 가상환경
python3 -m venv melo-venv
source melo-venv/bin/activate
pip install torch torchaudio flask soundfile
pip install git+https://github.com/myshell-ai/MeloTTS.git
deactivate

# Kokoro 가상환경
python3 -m venv kokoro-venv
source kokoro-venv/bin/activate
pip install kokoro soundfile flask numpy eng-to-ipa
deactivate
```

### pm2로 실행 (운영 서버)

```bash
pm2 start melo_server.py --name melo --interpreter ./melo-venv/bin/python3
pm2 start kokoro_server.py --name kokoro --interpreter ./kokoro-venv/bin/python3
pm2 start index.js --name bot
pm2 start server/index.js --name server
pm2 save
pm2 startup  # EC2 재부팅 시 자동 시작 설정
```

### 개별 실행 (개발 환경)

```bash
# 터미널 1
source melo-venv/bin/activate && python3 melo_server.py

# 터미널 2
source kokoro-venv/bin/activate && python3 kokoro_server.py

# 터미널 3
node index.js

# 터미널 4
npm run dev:server

# 터미널 5 (프론트엔드)
cd web && npm run dev
```

### 목소리 샘플 오디오 생성

새 목소리가 추가되었을 때 해당 목소리의 샘플 파일만 생성합니다. MeloTTS, Kokoro 서버가 실행 중인 상태에서 진행해야 합니다.

```bash
node generateSamples.js [voice_key]
# 예시: node generateSamples.js ko-SunHi
```

---

## 배포 (EC2 + nginx)

### 도메인 및 HTTPS
- **도메인**: algottsbot.com (AWS Route 53)
- **SSL**: Let's Encrypt (Certbot, 90일마다 자동 갱신)
- **웹 서버**: nginx (80 → HTTPS 리다이렉트, 443에서 프론트/백엔드 라우팅)

### nginx 설정
- `/auth/discord`, `/auth/me`, `/user/`, `/notices`, `/inquiries`, `/admin/`, `/samples/` → Express(3000) 프록시
- 그 외 모든 경로 → Vue 빌드 결과물 (`web/dist`) 정적 서빙

### 프론트엔드 빌드
```bash
cd web
npm run build
```

### AWS 보안 그룹 인바운드 규칙
| 포트 | 용도 |
|------|------|
| 22 | SSH |
| 80 | HTTP (HTTPS 리다이렉트) |
| 443 | HTTPS |

---

## 환경 변수 (.env)

```
TOKEN=디스코드봇토큰
DEV_TOKEN=개발용봇토큰
NODE_ENV=production
```

`NODE_ENV=development`로 설정하면 `DEV_TOKEN`을 사용하는 개발용 봇(아루고수-dev)으로 실행됩니다.

---

## 웹페이지

봇 설정을 웹에서도 관리할 수 있도록 Vue 3 기반 웹페이지를 추가했습니다. Discord OAuth로 로그인하며, 사용자 페이지(목소리/속도 설정, 공지사항, 문의)와 관리자 페이지(사용량 대시보드, 봇 상태, 에러 로그, 문의/공지 관리)로 구성됩니다.

### 구성

- **프론트엔드**: Vue 3 + TypeScript + Vite + Vue Router + Pinia + Naive UI + Chart.js
- **백엔드**: 기존 Node.js 봇 프로세스에 Express 추가 (별도 프로세스 아님)
- **DB**: SQLite (better-sqlite3, WAL 모드)
- **인증**: Discord OAuth2 + JWT

### 파일 구조

```
AlgoBot/
├── web/                         # Vue 3 프론트엔드
│   ├── src/
│   │   ├── pages/
│   │   │   ├── user/            # Home, Notice, Voice, Inquiry
│   │   │   └── admin/           # Dashboard, Status, Logs, Notice, Inquiry
│   │   ├── components/layout/   # UserLayout, AdminLayout
│   │   ├── stores/user.ts       # Pinia 유저 스토어 (로그인 상태, JWT)
│   │   └── router/index.ts      # 라우터 + 관리자 권한 가드
│   └── .env                     # VITE_API_URL
├── server/                      # Express 백엔드
│   ├── index.js                 # 서버 진입점
│   ├── routes/                  # auth, user, notice, inquiry, admin/*
│   ├── middleware/               # JWT 인증, 관리자 권한 체크
│   └── db/                      # SQLite 스키마 및 연결
```

### 실행

```bash
# 백엔드
npm run dev:server

# 프론트엔드
cd web
npm run dev -- --host
```

### 환경 변수 (.env, 기존 항목에 추가)

```
NODE_ENV=production

# Discord OAuth 운영용
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
DISCORD_REDIRECT_URI=http://EC2_IP:3000/auth/discord/callback

# Discord OAuth 개발용
DEV_DISCORD_CLIENT_ID=
DEV_DISCORD_CLIENT_SECRET=
DEV_DISCORD_REDIRECT_URI=http://localhost:3000/auth/discord/callback

# 공통
ADMIN_DISCORD_ID=
JWT_SECRET=

# Server
SERVER_PORT=3000
WEB_URL=http://EC2_IP:5173
```

`web/.env`에는 `VITE_API_URL`로 백엔드 주소를 지정합니다.

---

## 업데이트 로그

<details>
<summary><strong>2026-07-08</strong> — 운영 환경 구축, 보안 강화</summary>

* 도메인이 연결되었습니다.
  * algottsbot.com 도메인으로 접속할 수 있습니다.
* HTTPS가 적용되었습니다.
  * Let's Encrypt SSL 인증서가 적용되어 안전하게 접속할 수 있습니다.
  * 인증서는 자동으로 갱신됩니다.
* 보안이 강화되었습니다.
  * 불필요한 포트(3000, 5173)가 차단되었습니다.
  * 외부에서는 80(HTTP), 443(HTTPS) 포트로만 접근 가능합니다.
  * HTTP로 접속하면 자동으로 HTTPS로 리다이렉트됩니다.
* 서버 안정성이 개선되었습니다.
  * pm2로 모든 프로세스를 관리합니다.
  * 서버가 재부팅되면 모든 프로세스가 자동으로 다시 시작됩니다.

</details>

<details>
<summary><strong>2026-07-03</strong> — 목소리 설정 통합, 디스코드 목소리 선택 UI 개선, 미리듣기 기능 추가</summary>

* 디스코드와 웹페이지의 목소리 설정이 하나로 통합되었습니다.
  * 어느 쪽에서 바꾸든 동일하게 반영됩니다.
  * 디스코드에서 `/목소리`로 바꾸면 웹페이지에서도 같은 목소리로 표시됩니다.
  * 웹페이지에서 바꾸면 디스코드에서도 동일한 목소리로 재생됩니다.
  * 웹 창에 포커스가 돌아오면 자동으로 최신 설정으로 갱신됩니다.
* 디스코드에서 목소리를 더 편하게 바꿀 수 있습니다.
  * `/목소리` 명령어 실행 시 드롭다운 메뉴로 목소리를 선택할 수 있습니다.
  * 메시지를 닫기 전까지 계속 바꿀 수 있습니다.
  * 현재 선택된 목소리가 드롭다운에 표시됩니다.
  * 더 많은 설정은 웹페이지 링크로 바로 이동할 수 있습니다.
* 목소리 미리듣기 기능이 추가되었습니다.
  * 각 목소리 카드에서 "미리듣기" 버튼으로 샘플 음성을 들을 수 있습니다.
  * 재생 중 버튼을 다시 누르면 정지됩니다.
  * 설정한 재생 속도가 미리듣기에도 반영됩니다.

</details>

<details>
<summary><strong>2026-06-26</strong> — 에러 로그 범위 확대, 관리자 페이지 이동 개선</summary>

* 에러 로그에서 더 많은 문제 상황을 확인할 수 있습니다.
  * 명령어 처리, 메시지 처리, 음성 채널 연결 등 다양한 상황의 오류가 기록됩니다.
  * Discord 로그인 실패, 잘못된 접근 시도도 기록됩니다.
  * 예상하지 못한 오류가 발생해도 봇이 종료되지 않고 계속 동작하며, 내용이 로그에 남습니다.
* 관리자 페이지로 이동하기 편해졌습니다.
  * 관리자 계정으로 로그인하면 상단 메뉴에 "관리자" 링크가 나타납니다.
  * 관리자 페이지에서도 "사용자 페이지로" 링크로 쉽게 돌아갈 수 있습니다.

</details>

<details>
<summary><strong>2026-06-19</strong> — 실데이터 연동, 봇 안정성 개선</summary>

* 웹페이지가 더미데이터 대신 실제 데이터로 동작합니다.
  * 목소리 목록과 내 설정(목소리/속도)이 실시간으로 연동됩니다.
  * 공지사항, 문의 목록이 실제 등록된 내용으로 표시됩니다.
  * 홈에서 공지사항/문의 항목을 클릭하면 해당 페이지로 이동해 바로 펼쳐서 볼 수 있습니다.
  * 관리자 사용량 대시보드가 실제 TTS 사용 기록을 기준으로 집계됩니다.
* 봇 상태를 실시간으로 확인할 수 있습니다.
  * Discord 봇, MeloTTS, Kokoro 엔진의 상태를 주기적으로 자동 점검합니다.
  * 봇 상태 페이지를 열어두면 약 10초마다 자동으로 최신 상태로 갱신됩니다.
  * 서비스 상태가 바뀌면(정상↔오류) 에러 로그에 자동으로 기록됩니다.
* 안정성이 크게 개선되었습니다.
  * 로컬 TTS 엔진(MeloTTS, Kokoro)에 연결할 수 없을 때 봇 전체가 종료되던 문제를 고쳤습니다.
  * 이제 TTS 생성에 실패해도 봇은 계속 동작하며, 실패 내용이 에러 로그에 남습니다.

</details>


<details>
<summary><strong>2026-06-17</strong> — Discord 로그인 지원</summary>

* 웹페이지에서 Discord 계정으로 로그인할 수 있게 되었습니다.
  * 새로고침하거나 다시 접속해도 로그인 상태가 유지됩니다.
  * 로그인하면 프로필 사진과 이름이 화면에 표시됩니다.
* 화면 레이아웃이 개선되었습니다.
  * 로그인 전/후에도 메뉴 위치가 흔들리지 않도록 정리했습니다.
* 관리자 페이지가 보호됩니다.
  * 로그인 및 권한이 있는 계정만 접근할 수 있습니다.
* 재로그인 속도가 개선되었습니다.
  * 동의 화면이 더 빠르게 지나가도록 했습니다.

</details>

<details>
<summary><strong>2026-06-15</strong> — 목소리/속도 설정, 문의 기능 개선</summary>


* 목소리·속도 설정 방식이 개선되었습니다.
  * 슬라이더로 재생 속도를 조절할 수 있습니다.
  * 미리듣기로 먼저 확인한 뒤 "적용" 버튼을 눌러야 실제로 반영됩니다.
  * 의도치 않게 설정이 바뀌는 일이 없도록 했습니다.
  * 현재 사용 중인 목소리가 스크롤해도 항상 상단에 보입니다.
* 공지사항 화면이 개선되었습니다.
  * 목록에서는 한 줄만 보이고, 클릭하면 펼쳐서 전체 내용을 볼 수 있습니다.
  * 여러 개를 동시에 펼쳐볼 수 있습니다.
* 문의 기능이 개선되었습니다.
  * 문의하기가 팝업 형태로 바뀌어 더 간단하게 작성할 수 있습니다.
  * 문의 목록에서 다른 사람이 남긴 문의 내용과 답변 상태를 함께 볼 수 있습니다.
* 관리자 페이지가 추가되었습니다.
  * 사용량 대시보드(목소리별 비율, 시간대별 사용량, 일별 추이)
  * 서버 상태, 에러 로그
  * 문의/공지 관리 화면

</details>

<details>
<summary><strong>2026-06-12</strong> — 웹페이지 첫 공개</summary>

* Discord 봇 설정을 웹브라우저에서도 관리할 수 있는 웹페이지가 새로 생겼습니다.
  * 홈, 공지사항, 목소리·설정, 문의 페이지를 이용할 수 있습니다.

</details>

<details>
<summary><strong>2026-06-10</strong> — 관리자 페이지 준비</summary>

* 운영자가 사용량과 봇 상태를 확인할 수 있는 관리자 페이지를 준비 중입니다.

</details>

<details>
<summary><strong>2026-06-08</strong> — 채널 설정 사용성 개선</summary>

* `/채널설정` 동작이 더 편리해졌습니다.
  * 다시 실행하면 같은 채널이면 설정이 해제됩니다.
  * 다른 채널이면 기존 설정을 해제하고 새로 설정됩니다.
  * 어떤 채널이 해제/설정됐는지 메시지로 안내합니다.

</details>

<details>
<summary><strong>2026-05-20</strong> — 안정성 개선</summary>

* TTS 생성과 재생 과정의 안정성이 개선되었습니다.

</details>

<details>
<summary><strong>2026-05-11</strong> — 로컬 TTS 속도 개선</summary>

* MeloTTS, Kokoro의 응답 속도가 개선되었습니다.
  * 음성을 생성할 때 디스크에 파일을 저장하지 않고 메모리에서 바로 처리하도록 변경했습니다.

</details>

<details>
<summary><strong>2026-05-08</strong> — MeloTTS 안정성 개선</summary>

* MeloTTS 엔진의 안정성이 개선되었습니다.

</details>

<details>
<summary><strong>2026-05-06</strong> — 개발 환경 분리</summary>

* 운영 중인 봇과 별개로 개발용 봇이 분리되었습니다.
  * 새 기능을 더 안전하게 테스트할 수 있습니다.
* 첫 TTS 요청 지연이 줄었습니다.
  * 엔진을 미리 준비해두는 워밍업 과정을 추가했습니다.

</details>