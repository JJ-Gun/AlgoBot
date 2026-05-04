import { preprocessForKokoro } from './src/textProcessor.js';
const tests = ['호우', '그냥', 'ㅋㅋㅋ홀리', '안녕하세요'];
for (const t of tests) {
  console.log(`${t} → ${preprocessForKokoro(t)}`);
}