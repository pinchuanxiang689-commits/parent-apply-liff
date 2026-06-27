/**
 * validation.js の単体テスト（実機不要・node で実行）。
 * 実行: node validation.test.js
 *
 * docs/32 §11 のエッジケース表を網羅。合格/不合格/補正/境界/Unicode の各群を検証する。
 */
const { validateChildName } = require('./validation');

let pass = 0;
let fail = 0;
const failures = [];

function expectOk(label, input, expectedValue) {
  const r = validateChildName(input);
  if (r.ok && (expectedValue === undefined || r.value === expectedValue)) {
    pass++;
  } else {
    fail++;
    failures.push(`[OK期待] ${label}: 入力=${JSON.stringify(input)} → ${JSON.stringify(r)}${expectedValue !== undefined ? ` (期待value=${JSON.stringify(expectedValue)})` : ''}`);
  }
}

function expectNg(label, input) {
  const r = validateChildName(input);
  if (!r.ok) {
    pass++;
  } else {
    fail++;
    failures.push(`[NG期待] ${label}: 入力=${JSON.stringify(input)} → ${JSON.stringify(r)}`);
  }
}

const ZEN = '　'; // 全角スペース

// --- 合格群 ---
expectOk('全角スペース1個', 'やまだ' + ZEN + 'たろう', 'やまだ' + ZEN + 'たろう');
expectOk('半角スペース→全角補正', 'やまだ たろう', 'やまだ' + ZEN + 'たろう');
expectOk('全角スペース2個→1個収束', 'やまだ' + ZEN + ZEN + 'たろう', 'やまだ' + ZEN + 'たろう');
expectOk('先頭末尾スペースtrim', ZEN + 'やまだ' + ZEN + 'たろう' + ZEN, 'やまだ' + ZEN + 'たろう');
expectOk('長音符を含む名', 'ちーちゃん' + ZEN + 'すずき');
expectOk('小書き仮名', 'きゃの' + ZEN + 'しゃちょう');
expectOk('濁点・半濁点（合成済み）', 'がぎ' + ZEN + 'ぱぴ');
// 結合濁点（か+U+3099）は NFC で「が」に合成される
expectOk('結合濁点はNFCで合成され合格', 'が' + ZEN + 'やまだ', 'が' + ZEN + 'やまだ');

// --- 不合格群 ---
expectNg('スペース0個', 'やまだたろう');
expectNg('カタカナ', 'ヤマダ' + ZEN + 'タロウ');
expectNg('漢字', '山田' + ZEN + '太郎');
expectNg('英字', 'Yamada Taro');
expectNg('片方カタカナ', 'やまだ' + ZEN + 'タロウ');
expectNg('数字混入', 'やまだ1' + ZEN + 'たろう');
expectNg('半角カナ', 'ﾔﾏﾀﾞ' + ZEN + 'たろう');
expectNg('全角スペース3分割（中点的に余分な空白）', 'やまだ' + ZEN + 'た' + ZEN + 'ろう');
expectNg('空文字', '');
expectNg('スペースのみ', ZEN + ' ' + ZEN);
expectNg('IME未確定ローマ字', 'yamada');
expectNg('null', null);
expectNg('undefined', undefined);

// --- 結果出力 ---
console.log(`\n児童名バリデーション 単体テスト`);
console.log(`合格 ${pass} / 不合格 ${fail} （計 ${pass + fail}）`);
if (fail > 0) {
  console.log('\n--- 失敗ケース ---');
  failures.forEach((f) => console.log('  ✗ ' + f));
  process.exit(1);
} else {
  console.log('✅ 全ケース PASS');
}
