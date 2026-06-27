/**
 * 児童名バリデーション（中庸版）
 *
 * 要件（docs/29・docs/30）:
 *   - ひらがな以外は入力不可（漢字・カタカナ・英数・半角を弾く）
 *   - 苗字と名前の間は全角スペース1個固定
 *
 * 設計方針（FamHopper docs/32 §5・5観点レビュー反映）:
 *   - フロントのこの検証は UX。最終防壁はサーバ側（GAS）でも同じ検証＋サニタイズを通す。
 *   - 過剰な攻撃面対策（結合濁点偽装・ZWSP/BOM・旧かな・合略仮名・IME監視）は深追いしない。
 *     NFC正規化＋ひらがなホワイトリストで自然に弾ける範囲で十分。
 *
 * 許可文字: U+3041(ぁ)〜U+3096(ゖ) のひらがな ＋ U+30FC(ー 長音符)。
 *   - 結合用濁点/半濁点(U+3099/U+309A)は許可集合に含めない → NFC正規化で合成され、
 *     合成先のない裸の結合文字が残れば不正として弾かれる。
 *
 * ブラウザ(LIFF)からも Node(テスト)からも使えるよう UMD 風にエクスポートする。
 */
(function (root) {
  'use strict';

  var HIRAGANA = /^[ぁ-ゖー]+$/u; // ひらがな＋長音符のみ
  var IDEOGRAPHIC_SPACE = '　'; // 全角スペース

  /**
   * 児童名を検証・正規化する。
   * @param {string} raw 保護者の入力（IME確定後の値を渡す想定）
   * @return {{ok: boolean, value?: string, error?: string}}
   *   ok=true なら value に正規化済み（前後trim・全角スペース1個固定）の名前を返す。
   */
  function validateChildName(raw) {
    if (raw === null || raw === undefined) {
      return { ok: false, error: 'お名前を入力してください' };
    }

    // 1. NFC 正規化（結合文字・互換文字を合成形へ）
    var s = String(raw).normalize('NFC');

    // 2. 前後の空白（半角・全角どちらも）を除去
    s = s.replace(/^[\s　]+|[\s　]+$/g, '');
    if (s === '') {
      return { ok: false, error: 'お名前を入力してください' };
    }

    // 連続する空白（半角・全角）を全角スペース1個へ収束
    s = s.replace(/[\s　]+/g, IDEOGRAPHIC_SPACE);

    // 3. 全角スペースで分割し、ちょうど2つ（姓・名）になるか
    var parts = s.split(IDEOGRAPHIC_SPACE);
    if (parts.length !== 2) {
      return {
        ok: false,
        error: '姓と名の間に全角スペースを1つ入れてください（例：やまだ　たろう）',
      };
    }

    // 4. 各セグメントがひらがな（＋長音符）のみ・空でない
    var sei = parts[0];
    var mei = parts[1];
    if (!sei || !mei || !HIRAGANA.test(sei) || !HIRAGANA.test(mei)) {
      return {
        ok: false,
        error: '漢字・カタカナ・アルファベットは使えません。ひらがなで入力してください',
      };
    }

    return { ok: true, value: sei + IDEOGRAPHIC_SPACE + mei };
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { validateChildName: validateChildName };
  } else {
    root.validateChildName = validateChildName;
  }
})(typeof window !== 'undefined' ? window : this);
