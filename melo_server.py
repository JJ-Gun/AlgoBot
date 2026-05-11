from flask import Flask, request, Response
import os
import re
import io
import time

os.environ['TOKENIZERS_PARALLELISM'] = 'false'
os.environ['LRU_CACHE_CAPACITY'] = '1024'

import torch
import numpy as np
import soundfile as sf
from melo.api import TTS
from melo import utils as melo_utils

app = Flask(__name__)

SPEED = 1.15

print('MeloTTS 로딩 중...')

tts_kr = TTS(
    language='KR',
    device='cpu'
)

speaker_kr = tts_kr.hps.data.spk2id['KR']

print('MeloTTS 준비 완료!')


def infer_to_bytes(text):
    """tts_to_file 내부 로직을 직접 사용해 메모리로 반환"""
    texts = tts_kr.split_sentences_into_pieces(text, tts_kr.language)
    audio_list = []

    for t in texts:
        device = tts_kr.device
        bert, ja_bert, phones, tones, lang_ids = melo_utils.get_text_for_tts_infer(
            t,
            tts_kr.language,
            tts_kr.hps,
            device,
            tts_kr.symbol_to_id
        )

        with torch.no_grad():
            x_tst = phones.to(device).unsqueeze(0)
            tones = tones.to(device).unsqueeze(0)
            lang_ids = lang_ids.to(device).unsqueeze(0)
            bert = bert.to(device).unsqueeze(0)
            ja_bert = ja_bert.to(device).unsqueeze(0)
            x_tst_lengths = torch.LongTensor([phones.size(0)]).to(device)
            speakers = torch.LongTensor([speaker_kr]).to(device)

            audio = tts_kr.model.infer(
                x_tst,
                x_tst_lengths,
                speakers,
                tones,
                lang_ids,
                bert,
                ja_bert,
                sdp_ratio=0.2,
                noise_scale=0.6,
                noise_scale_w=0.8,
                length_scale=1.0 / SPEED
            )[0][0, 0].data.cpu().float().numpy()

        audio_list.append(audio)

    audio_all = np.concatenate(audio_list)

    buf = io.BytesIO()
    sf.write(buf, audio_all, tts_kr.hps.data.sampling_rate, format='WAV')
    buf.seek(0)
    return buf


print('MeloTTS 워밍업 중...')
infer_to_bytes('워밍업')
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

    buf = infer_to_bytes(text)

    infer_time = time.time() - infer_start
    print(f'[TTS ] infer {infer_time:.3f}s')

    total = time.time() - req_start
    print(f'[DONE] total {total:.3f}s')

    return Response(
        buf.read(),
        mimetype='audio/wav'
    )


if __name__ == '__main__':
    app.run(
        host='127.0.0.1',
        port=5050,
        threaded=True
    )