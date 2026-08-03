import englishWords from 'an-array-of-english-words' with { type: 'json' };

const wordSet = new Set(englishWords);

const alphabetMap = {
  'a': '에이', 'b': '비', 'c': '씨', 'd': '디', 'e': '이',
  'f': '에프', 'g': '지', 'h': '에이치', 'i': '아이', 'j': '제이',
  'k': '케이', 'l': '엘', 'm': '엠', 'n': '엔', 'o': '오',
  'p': '피', 'q': '큐', 'r': '아르', 's': '에스', 't': '티',
  'u': '유', 'v': '브이', 'w': '더블유', 'x': '엑스', 'y': '와이',
  'z': '지'
};

const numberMap = {
  '0': '영', '1': '일', '2': '이', '3': '삼', '4': '사',
  '5': '오', '6': '육', '7': '칠', '8': '팔', '9': '구'
};

// 전화번호/코드처럼 한 글자씩 읽을 때는 0을 "공"으로 읽음
const sequentialDigitMap = { ...numberMap, '0': '공' };

// 고유어 숫자를 쓰는 단위들 (필요하면 추가/삭제하세요)
const NATIVE_COUNTERS = new Set([
  '시', '개', '명', '살', '마리', '장', '권', '그루', '채',
  '대', '잔', '병', '켤레', '알', '가지', '벌', '자루', '그릇', '줄', '다발', '사람',
]);

// 고유어 숫자 (1~99)
const nativeOnes = ['', '한', '두', '세', '네', '다섯', '여섯', '일곱', '여덟', '아홉'];
const nativeTens = ['', '열', '스물', '서른', '마흔', '쉰', '예순', '일흔', '여든', '아흔'];

function nativeKoreanNumber(n) {
  if (n <= 0 || n > 99) return null;
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return nativeTens[tens] + nativeOnes[ones];
}

// 한자어 숫자
const sinoDigits = ['', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];
const sinoSmallUnits = ['', '십', '백', '천'];
const sinoBigUnits = ['', '만', '억', '조', '경'];

function sinoKoreanGroup(num) {
  const digits = String(num).padStart(4, '0').split('').map(Number);
  let result = '';
  for (let i = 0; i < 4; i++) {
    const d = digits[i];
    const unit = sinoSmallUnits[3 - i];
    if (d === 0) continue;
    result += (d === 1 && unit) ? unit : sinoDigits[d] + unit;
  }
  return result;
}

function sinoKoreanNumber(n) {
  if (n === 0) return '영';
  const groups = [];
  let num = n;
  while (num > 0) {
    groups.push(num % 10000);
    num = Math.floor(num / 10000);
  }
  let result = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    if (groups[i] === 0) continue;
    result += sinoKoreanGroup(groups[i]) + (sinoBigUnits[i] || '');
  }
  return result;
}

// 전화번호처럼 앞자리가 0인 숫자, 그 숫자가 포함된 하이픈 체인을 찾아서 표시
function isLeadingZero(token) {
  return token.length > 1 && token[0] === '0';
}

function markPhoneCodePatterns(tokens) {
  const digitByDigit = new Set();
  const codeHyphen = new Set();
  const dashHyphen = new Set();

  let i = 0;
  while (i < tokens.length) {
    if (/^[0-9]+$/.test(tokens[i])) {
      const chainNumberIdx = [i];
      const chainHyphenIdx = [];
      let j = i;
      while (tokens[j + 1] === '-' && /^[0-9]+$/.test(tokens[j + 2])) {
        chainHyphenIdx.push(j + 1);
        chainNumberIdx.push(j + 2);
        j += 2;
      }
      if (chainHyphenIdx.length > 0) {
        const isCode = chainNumberIdx.some(idx => isLeadingZero(tokens[idx]));
        if (isCode) {
          chainNumberIdx.forEach(idx => digitByDigit.add(idx));
          chainHyphenIdx.forEach(idx => codeHyphen.add(idx));
        } else {
          chainHyphenIdx.forEach(idx => dashHyphen.add(idx));
        }
        i = j + 1;
        continue;
      }
    }
    i++;
  }

  return { digitByDigit, codeHyphen, dashHyphen };
}

const jamoMap = {
  'ㄱ': '기역', 'ㄴ': '니은', 'ㄷ': '디귿', 'ㄹ': '리을', 'ㅁ': '미음',
  'ㅂ': '비읍', 'ㅅ': '시옷', 'ㅇ': '이응', 'ㅈ': '지읒', 'ㅊ': '치읓',
  'ㅋ': '키읔', 'ㅌ': '티읕', 'ㅍ': '피읖', 'ㅎ': '히읗', 'ㄲ': '쌍기역',
  'ㄸ': '쌍디귿', 'ㅃ': '쌍비읍', 'ㅆ': '쌍시옷', 'ㅉ': '쌍지읒',
  'ㅏ': '아', 'ㅑ': '야', 'ㅓ': '어', 'ㅕ': '여', 'ㅗ': '오',
  'ㅛ': '요', 'ㅜ': '우', 'ㅠ': '유', 'ㅡ': '으', 'ㅣ': '이',
  'ㅐ': '에', 'ㅒ': '예', 'ㅔ': '에', 'ㅖ': '예', 'ㅘ': '와',
  'ㅙ': '왜', 'ㅚ': '외', 'ㅝ': '워', 'ㅞ': '웨', 'ㅟ': '위', 'ㅢ': '의',
};

const specialMap = {
  '-': '마이너스',
  '+': '플러스',
  '=': '이퀄',
};

// 같은 글자 반복 읽는 횟수 제한
function limitRepeatedChars(text, maxRepeat = 5) {
  return text.replace(/(.)\1{5,}/gu, (_, ch) => ch.repeat(maxRepeat));
}

// edge/melo용 영어 → 한글 변환
function englishToKorean(word) {
  const lower = word.toLowerCase();
  if (wordSet.has(lower)) {
    return word;
  }
  // 사전에 없는 단어는 알파벳 한글자씩 (발음 규칙 없이)
  return lower.split('').map(ch => alphabetMap[ch] || ch).join('');
}

export function preprocessText(text) {
  text = limitRepeatedChars(text);
  const tokens = text.match(/[a-zA-Z]+|[0-9]+|[ㄱ-ㅎㅏ-ㅣ]|[가-힣]|\s|./g) || [];
  const { digitByDigit, codeHyphen, dashHyphen } = markPhoneCodePatterns(tokens);
  const result = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (/^[a-zA-Z]+$/.test(token)) {
      result.push(englishToKorean(token));
    } else if (/^[0-9]+$/.test(token)) {
      if (digitByDigit.has(i) || isLeadingZero(token)) {
        result.push(token.split('').map(d => sequentialDigitMap[d]).join(''));
      } else {
        const n = Number(token);
        const next = tokens[i + 1];
        if (NATIVE_COUNTERS.has(next)) {
          result.push(nativeKoreanNumber(n) ?? sinoKoreanNumber(n));
        } else {
          result.push(sinoKoreanNumber(n));
        }
      }
    } else if (token === '-' && codeHyphen.has(i)) {
      result.push('에');
    } else if (token === '-' && dashHyphen.has(i)) {
      result.push('다시');
    } else if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(token)) {
      result.push(jamoMap[token] || token);
    } else if (specialMap[token]) {
      result.push(specialMap[token]);
    } else if (/^[^\w\s가-힣]$/.test(token)) {
      result.push(''); // 나머지 특수기호 제거
    } else {
      result.push(token);
    }
  }

  return result.join('');
}

// kokoro용 변환
const IPA_ONSET = {
  'ㄱ':'k','ㄲ':'k͈','ㄴ':'n','ㄷ':'t','ㄸ':'t͈','ㄹ':'ɾ',
  'ㅁ':'m','ㅂ':'p','ㅃ':'p͈','ㅅ':'s','ㅆ':'s͈','ㅇ':'',
  'ㅈ':'tɕ','ㅉ':'t͈ɕ','ㅊ':'tɕʰ','ㅋ':'kʰ','ㅌ':'tʰ','ㅍ':'pʰ','ㅎ':'h',
};
const IPA_VOWEL = {
  'ㅏ':'a','ㅐ':'ɛ','ㅑ':'ja','ㅒ':'jɛ','ㅓ':'ʌ',
  'ㅔ':'e','ㅕ':'jʌ','ㅖ':'je','ㅗ':'o','ㅘ':'wa',
  'ㅙ':'wɛ','ㅚ':'ø','ㅛ':'jo','ㅜ':'u','ㅝ':'wʌ',
  'ㅞ':'we','ㅟ':'wi','ㅠ':'ju','ㅡ':'ɯ','ㅢ':'ɰi','ㅣ':'i',
};
const IPA_CODA = {
  '':'','ㄱ':'k','ㄲ':'k','ㄳ':'k','ㄴ':'n','ㄵ':'n','ㄶ':'n',
  'ㄷ':'t','ㄹ':'l','ㄺ':'l','ㄻ':'m','ㄼ':'l','ㄽ':'l','ㄾ':'l',
  'ㄿ':'p','ㅀ':'l','ㅁ':'m','ㅂ':'p','ㅄ':'p','ㅅ':'t','ㅆ':'t',
  'ㅇ':'ŋ','ㅈ':'t','ㅊ':'t','ㅋ':'k','ㅌ':'t','ㅍ':'p','ㅎ':'t',
};
const IPA_JAMO = {
  'ㄱ':'k','ㄴ':'n','ㄷ':'t','ㄹ':'ɾ','ㅁ':'m','ㅂ':'p','ㅅ':'s',
  'ㅇ':'ŋ','ㅈ':'tɕ','ㅊ':'tɕʰ','ㅋ':'kʰ','ㅌ':'tʰ','ㅍ':'pʰ','ㅎ':'h',
  'ㄲ':'k͈','ㄸ':'t͈','ㅃ':'p͈','ㅆ':'s͈','ㅉ':'t͈ɕ',
  'ㅏ':'a','ㅑ':'ja','ㅓ':'ʌ','ㅕ':'jʌ','ㅗ':'o','ㅛ':'jo',
  'ㅜ':'u','ㅠ':'ju','ㅡ':'ɯ','ㅣ':'i','ㅐ':'ɛ','ㅔ':'e',
};

const ONSET_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const VOWEL_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];
const CODA_LIST = ['','ㄱ','ㄲ','ㄳ','ㄴ','ㄵ','ㄶ','ㄷ','ㄹ','ㄺ','ㄻ','ㄼ','ㄽ','ㄾ','ㄿ','ㅀ','ㅁ','ㅂ','ㅄ','ㅅ','ㅆ','ㅇ','ㅈ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];

function hangulToIPA(text) {
  return text.split('').map(ch => {
    const code = ch.charCodeAt(0) - 0xAC00;
    if (code < 0 || code > 11171) return ch;
    const onsetIdx = Math.floor(code / 588);
    const vowelIdx = Math.floor((code % 588) / 28);
    const codaIdx = code % 28;
    return IPA_ONSET[ONSET_LIST[onsetIdx]] + IPA_VOWEL[VOWEL_LIST[vowelIdx]] + IPA_CODA[CODA_LIST[codaIdx]];
  }).join('');
}

export function preprocessForKokoro(text) {
  const tokens = text.match(/[a-zA-Z]+|[0-9]+|[ㄱ-ㅎㅏ-ㅣ]|[가-힣]+|\s|./g) || [];
  const converted = tokens.map(token => {
    if (/^[a-zA-Z]+$/.test(token)) return token;
    if (/^[0-9]+$/.test(token)) return token;
    if (/^[ㄱ-ㅎㅏ-ㅣ]$/.test(token)) return IPA_JAMO[token] || token;
    if (/^[가-힣]+$/.test(token)) return hangulToIPA(token);
    return token;
  }).join('');
  return `[text](/${converted}/)`;
}