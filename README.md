# Mystery Prince

作品の意味と、実行エンジン・表示・保存・生成サービスを独立して交換する、キャラクターを中心としたインタラクティブ作品基盤です。

小さな実行基盤の上に、**固定脚本のミステリー**と**プレイごとに事件を生成する対話型ミステリー**を実装しています。両者は別の状態・命令・完了条件を持ち、共通の物語形式を強制しません。

旧 Experience Contract、Realization-v1、prototype、セーブ形式からは全面移行済みです。現在の正本は `works/`、`domains/`、`experience-profiles/` 以下です。

## 実行

Node.js 22.14以降とPython 3.12以降を使用します。CIの基準はNode.js 24です。Pythonは独立実装との比較検証に使用し、Webの配信・プレイには不要です。

```bash
npm ci
npm run dev
```

`http://127.0.0.1:8000/` を開くと3作品を遊べます。

| 作品 | 参加の仕組み |
| --- | --- |
| THE 23:30 MESSAGE | 証拠を集め、仮説を評価し、犯人を指名する固定脚本 |
| THE SEALED EXPRESS | 別の役・事件・立ち絵を持つ固定脚本 |
| THE UNWRITTEN ALIBI | 生成した事件を質問で調べ、疑いを更新し、一度だけ結論する |

通常版3本に加え、研究用に説明を伏せた版2本をビルドします。対話型作品の生成器はローカルの決定的な実装です。

```bash
npm run play -- --list
npm run play -- --edition the-2330-message.stage
npm run play -- --edition the-unwritten-alibi.inquiry --seed example
```

WebはIndexedDB、ターミナルはSQLiteを使用します。同じ公開版の通常プレイは、JSONセーブを書き出して双方へ移せます。

## 検証

```bash
npm run verify
npx playwright install chromium
npm run test:browser
```

契約・誤操作・中断復元・二重確定防止・保存先の交換・別言語エンジンの同等性・再現可能なビルドを検査します。ブラウザーテストは専用ローカルサーバーでPCとスマートフォンの全編、AB/BA、回答、エクスポート、端末間移行を確認します。画像と検証用データは `build/qa/` に出力します。

## 設計と運用

- [構造と依存方向](docs/architecture.md)
- [契約と交換手順](docs/contracts.md)
- [作品・配役・演出の制作](docs/authoring.md)
- [開発と実行](docs/development.md)
- [Wave 1の運用と分析](docs/research.md)
- [移行記録](docs/migration-record.md)
- [過去の企画・設計記録](docs/archive/pre-platform/README.md)

配信成果物は `dist/site/` のみです。GitHub Pagesもこの成果物を配信します。機械検証、人による作品評価、公開環境の確認は別の記録として扱います。
