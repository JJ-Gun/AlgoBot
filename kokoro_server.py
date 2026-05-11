from flask import Flask, request, Response
from kokoro import KPipeline
import soundfile as sf
import io
import re
import time
import numpy as np
import eng_to_ipa as ipa
import os

os.environ['LRU_CACHE_CAPACITY'] = '1024'

app = Flask(__name__)
SPEED = 0.9

print('Kokoro 로딩 중...')
pipeline = KPipeline(lang_code='a')
print('Kokoro 준비 완료!')

ONSET_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
VOWEL_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ']
CODA_LIST = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']

IPA_ONSET = {'ㄱ':'k','ㄲ':'k͈','ㄴ':'n','ㄷ':'t','ㄸ':'t͈','ㄹ':'ɾ','ㅁ':'m','ㅂ':'p','ㅃ':'p͈','ㅅ':'s','ㅆ':'s͈','ㅇ':'','ㅈ':'tɕ','ㅉ':'t͈ɕ','ㅊ':'tɕʰ','ㅋ':'kʰ','ㅌ':'tʰ','ㅍ':'pʰ','ㅎ':'h'}
IPA_VOWEL = {'ㅏ':'a','ㅐ':'ɛ','ㅑ':'ja','ㅒ':'jɛ','ㅓ':'ʌ','ㅔ':'e','ㅕ':'jʌ','ㅖ':'je','ㅗ':'o','ㅘ':'wa','ㅙ':'wɛ','ㅚ':'ø','ㅛ':'jo','ㅜ':'u','ㅝ':'wʌ','ㅞ':'we','ㅟ':'wi','ㅠ':'ju','ㅡ':'ɯ','ㅢ':'ɰi','ㅣ':'i'}
IPA_CODA = {'':'','ㄱ':'k','ㄲ':'k','ㄳ':'k','ㄴ':'n','ㄵ':'n','ㄶ':'n','ㄷ':'t','ㄹ':'l','ㄺ':'l','ㄻ':'m','ㄼ':'l','ㄽ':'l','ㄾ':'l','ㄿ':'p','ㅀ':'l','ㅁ':'m','ㅂ':'p','ㅄ':'p','ㅅ':'t','ㅆ':'t','ㅇ':'ŋ','ㅈ':'t','ㅊ':'t','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'t'}

JAMO_IPA = {
    'ㄱ':'k','ㄴ':'n','ㄷ':'t','ㄹ':'ɾ','ㅁ':'m','ㅂ':'p','ㅅ':'s',
    'ㅇ':'ŋ','ㅈ':'tɕ','ㅊ':'tɕʰ','ㅋ':'kʰ','ㅌ':'tʰ','ㅍ':'pʰ','ㅎ':'h',
    'ㄲ':'k͈','ㄸ':'t͈','ㅃ':'p͈','ㅆ':'s͈','ㅉ':'t͈ɕ',
    'ㅏ':'a','ㅑ':'ja','ㅓ':'ʌ','ㅕ':'jʌ','ㅗ':'o','ㅛ':'jo',
    'ㅜ':'u','ㅠ':'ju','ㅡ':'ɯ','ㅣ':'i','ㅐ':'ɛ','ㅔ':'e',
}


def hangul_to_ipa(text):
    result = ''
    for ch in text:
        code = ord(ch) - 0xAC00
        if code < 0 or code > 11171:
            result += ch
            continue
        onset = IPA_ONSET[ONSET_LIST[code // 588]]
        vowel = IPA_VOWEL[VOWEL_LIST[(code % 588) // 28]]
        coda = IPA_CODA[CODA_LIST[code % 28]]
        result += onset + vowel + coda
    return result


def text_to_kokoro(text):
    tokens = re.findall(r'[a-zA-Z]+|[0-9]+|[ㄱ-ㅎㅏ-ㅣ]|[가-힣]+|\s|.', text)
    result = []
    for token in tokens:
        if re.match(r'^[가-힣]+$', token):
            korean_ipa = hangul_to_ipa(token).replace('ɾ', 'l')
            result.append(f'[{token}](/{korean_ipa}/) ')
        elif re.match(r'^[ㄱ-ㅎㅏ-ㅣ]$', token):
            jamo_ipa = JAMO_IPA.get(token, token).replace('ɾ', 'l')
            result.append(f'[{token}](/{jamo_ipa}/) ')
        elif re.match(r'^[a-zA-Z]+$', token):
            eng_ipa = ipa.convert(token.lower())
            if eng_ipa and '*' not in eng_ipa:
                eng_ipa_clean = eng_ipa.replace(' ', '')
                result.append(f'[{token}](/{eng_ipa_clean}/) ')
            else:
                letter_ipa = ''.join([ipa.convert(c) or c for c in token.lower()])
                result.append(f'[{token}](/{letter_ipa}/) ')
        elif re.match(r'^[\s,]$', token):
            pass
        else:
            result.append(token)
    return ''.join(result)


@app.route('/tts', methods=['POST'])
def synthesize():

    req_start = time.time()

    data = request.json
    text = data.get('text', '')
    voice = data.get('voice', 'af_heart')

    if not text:
        return {'error': 'text is required'}, 400

    print(f'[REQ ] {text}')

    kokoro_text = text_to_kokoro(text)
    print(f'[IPA ] {kokoro_text}')

    infer_start = time.time()

    audio_chunks = []
    generator = pipeline(kokoro_text, voice=voice, speed=SPEED)
    for _, _, audio in generator:
        audio_chunks.append(audio)

    combined = np.concatenate(audio_chunks)

    infer_time = time.time() - infer_start
    print(f'[TTS ] infer {infer_time:.3f}s')

    buf = io.BytesIO()
    sf.write(buf, combined, 24000, format='WAV')
    buf.seek(0)

    total = time.time() - req_start
    print(f'[DONE] total {total:.3f}s')

    return Response(
        buf.read(),
        mimetype='audio/wav'
    )


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5051, threaded=True)