# 알고봇 TTS 봇

Discord 음성 채널에서 텍스트를 읽어주는 TTS(Text-to-Speech) 봇입니다.

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
pm2 save
```

### 개별 실행 (개발 환경)

```bash
# 터미널 1
source melo-venv/bin/activate && python3 melo_server.py

# 터미널 2
source kokoro-venv/bin/activate && python3 kokoro_server.py

# 터미널 3
node index.js
```

---

## 환경 변수 (.env)

```
TOKEN=디스코드봇토큰
DEV_TOKEN=개발용봇토큰
NODE_ENV=production
```

`NODE_ENV=development`로 설정하면 `DEV_TOKEN`을 사용하는 개발용 봇(아루고수-dev)으로 실행됩니다.