# 保護者申請フォーム（LIFF）

児童福祉事業者向けの保護者申請フォーム（欠席連絡・利用日確認・変更）。LINE の中で開く LIFF アプリ。
設計仕様・契約情報は非公開の PM フォルダ側で管理する（本リポジトリには契約情報・PII・固有名を置かない）。

> ⚠ **PII厳禁**: このフォルダ／公開リポジトリには、児童・保護者・職員の個人情報を一切置かない。
> 動作確認は必ず**ダミー（架空のひらがな名）**で行う。

## 構成（2026-06-26 ハイブリッド版・自己完結化）

- **`index.html`** … 申請フォーム本体（**1ファイル完結**：HTML/CSS/JS をすべて内包）。
  プレビュー・どこのホスティングでも単体で動く。設定は冒頭の `HABATAKI_CONFIG`。
- `validation.js` … 児童名ひらがなバリデーション（Node テスト用の正本）。
  index.html 内の同名関数は**これと同一ロジックを保つ**こと。
- `validation.test.js` … 単体テスト（21ケース）。`node validation.test.js` で実行。
- `style.css` / `app.js` / `submit.js` / `config.js` … 旧分割版。index.html に統合済みで**未参照**（スタブ）。

### テスト実行

```sh
node validation.test.js
```

### 設定（品川がチャネル発行・GASデプロイ後）

`index.html` 冒頭の `HABATAKI_CONFIG` に以下を入れる：
- `liffId` … LINE Developers で発行する LIFF アプリ ID
- `gasEndpoint` … GAS ウェブアプリ URL（末尾 `/exec`）。空なら送信は console モック
- `gasKey` … `?key=` トークン
- `classroom` … 教室名（既定: 稲毛教室）

いずれも空でもフォームは壊れず動く（LIFF未対応なら degrade・送信は console モック）。

## 実装済みの要件（docs/32 v3）

- 児童名ひらがな強制＋全角スペース1個（中庸バリデ・サーバ側でも再検証する設計）
- 送迎3択を必須化／出席番号なし／教室=稲毛固定
- 「その他」選択時のみ自由記述（理由・送迎・利用時間）
- 過去日を弾く／完了表示はサーバ送信成功後のみ（fail-secure）
- 連打・再送で二重記録されない（applicationId セッション固定）
- LIFF 未対応環境で degrade／XSS防御（DOM構築＋textContent）

## 今後（次フェーズ）

- GAS 側の LIFF 受け口（doPost 新パス・childMaster 逆引き）
- リッチメニューを「LIFF URL を開く」へ
- 実物の liffId / gasEndpoint を設定（品川作業・チャネル発行後）

URL クエリでフロー切替：`?type=absence`（既定）/ `?type=date-change` / `?type=transport-change` / `?type=child-register`
