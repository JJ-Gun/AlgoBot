from flask import Flask, request, Response
import os
import re
import io
import time
import tempfile

os.environ['TOKENIZERS_PARALLELISM'] = 'false'
os.environ['LRU_CACHE_CAPACITY'] = '1024'
os.environ['DNNL_DEFAULT_FPMATH_MODE'] = 'BF16'

import soundfile as sf
from melo.api import TTS

app = Flask(__name__)

SPEED = 1.15

print('MeloTTS 로딩 중...')

tts_kr = TTS(
    language='KR',
    device='cpu'
)

speaker_kr = tts_kr.hps.data.spk2id['KR']

print('MeloTTS 준비 완료!')

print('MeloTTS 워밍업 중...')

warmup_file = '/tmp/melo_warmup.wav'

tts_kr.tts_to_file(
    '워밍업',
    speaker_kr,
    warmup_file,
    speed=SPEED
)

try:
    os.remove(warmup_file)
except:
    pass

print('MeloTTS 워밍업 완료!')


@app.route('/tts', methods=['POST'])
def synthesize():

    req_start = time.time()

    data = request.json
    text = data.get('text', '')

    if not text:
        return {'error': 'text is required'}, 400

    text = re.sub(
        r'[^\w\s가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9.,!?~]',
        ' ',
        text
    )

    text = re.sub(
        r'\s+',
        ' ',
        text
    ).strip()

    if len(text) == 0:
        return {'error': 'empty text'}, 400

    print(f'[REQ ] {text}')

    infer_start = time.time()

    tmp = tempfile.NamedTemporaryFile(
        suffix='.wav',
        delete=False
    )

    tmp.close()

    try:

        tts_kr.tts_to_file(
            text,
            speaker_kr,
            tmp.name,
            speed=SPEED
        )

        infer_time = time.time() - infer_start

        print(f'[TTS ] infer {infer_time:.3f}s')

        with open(tmp.name, 'rb') as f:
            wav_data = f.read()

        total = time.time() - req_start

        print(f'[DONE] total {total:.3f}s')

        return Response(
            wav_data,
            mimetype='audio/wav'
        )

    finally:

        try:
            os.remove(tmp.name)
        except:
            pass


if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=5050,
        threaded=True
    )