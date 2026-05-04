from flask import Flask, request, send_file
import tempfile
import os
import re
import numpy as np
import soundfile as sf
from melo.api import TTS

app = Flask(__name__)
SPEED = 1.2 # 속도 조절 ( 0.5 ~ 2.0 )

print('MeloTTS 로딩 중...')
tts_kr = TTS(language='KR', device='cpu')
speaker_kr = tts_kr.hps.data.spk2id['KR']
tts_en = TTS(language='EN', device='cpu')
speaker_en = tts_en.hps.data.spk2id['EN-Default']
print('MeloTTS 준비 완료!')

def split_segments(text):
    segments = []
    pattern = re.compile(r'([a-zA-Z0-9]+|[^a-zA-Z0-9]+)')
    for match in pattern.finditer(text):
        part = match.group()
        if re.search(r'[a-zA-Z0-9]', part):
            segments.append(('en', part))
        else:
            segments.append(('kr', part))
    return segments

@app.route('/tts', methods=['POST'])
def synthesize():
    data = request.json
    text = data.get('text', '')
    if not text:
        return {'error': 'text is required'}, 400

    text = re.sub(r'[^\w\s가-힣ㄱ-ㅎㅏ-ㅣa-zA-Z0-9.,!?~]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()

    tmp = tempfile.NamedTemporaryFile(suffix='.wav', delete=False)
    tmp.close()
    tts_kr.tts_to_file(text, speaker_kr, tmp.name, speed=SPEED)
    return send_file(tmp.name, mimetype='audio/wav', as_attachment=True, download_name='tts.wav')
    
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5050)