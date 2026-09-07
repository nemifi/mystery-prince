# 開発・実行・配信

## 環境

Node.js 22.14以降、npm、Python 3.12以降。CIはNode.js 24/Python 3.12を使う。SQLiteはNode標準の `node:sqlite` で、使用するNodeの版によってExperimentalWarningが表示される。Pythonに追加パッケージは不要。

```bash
npm ci
npm run dev
```

`http://127.0.0.1:8000/` を開く。`npm run dev` はビルド後にプレビューを起動する。ホットリロードはない。変更時は別ターミナルで `npm run build` し、ページを再読込する。ビルド済みなら `npm run preview`。`MP_PORT=9000 npm run preview` でポートを変更できる。配信ルートは `dist/site/` に限定する。

## セーブと端末の交換

Webの「セーブを書き出す」は確定済みチェックポイントをJSONで保存する。通常プレイは `play/local`、研究は `study/<studyId>/<participantId>` のscopeを使う。

```bash
npm run play -- --import /tmp/web-save.json --db build/terminal-saves --export /tmp/terminal-save.json
```

番号で選択し、`q` で中断する。ターミナルの出力を、別ブラウザーの作品一覧にある「セーブファイルから再開」へ読み込む。同じ公開版だけを受け付ける。既存セッションを上書きするimportは拒否するので、新しい保存先を使う。

```bash
npm run play -- --resume SESSION_ID --db build/terminal-saves
```

自動操作には `--commands path.json` を指定する。内容は `[{"type":"advance","payload":{}}]` のような命令配列。正解や隠し状態を自動で読む機能は製品CLIに持たせない。

セッション中にコードや公開内容を変更した場合は新公開版になる。過去の公開版を現在のコードで勝手に開かない。続行が必要な場合は、その公開版を生成したソースと依存ロックから成果物を再生成し、対応する実装と一緒に使用する。

## 検証

```bash
npm run verify
npx playwright install chromium
npm run test:browser
```

`verify` はビルド、契約・交換・障害テスト、配布成果物のハッシュ検査を実行する。ブラウザーテストは8123番で専用サーバーを起動し、終了時に停止する。既存サーバーを使う場合は `MP_BASE_URL=http://127.0.0.1:8000/ npm run test:browser`。

`build/qa/` にPC/スマートフォンの画像、検証参加者のエクスポート、分析、端末間転送したセーブを出力する。検証データは実参加者の調査結果ではない。Node側のテストではテンポラリーなDBを作成し、終了時に削除する。

## 配信

GitHub Pagesは `.github/workflows/deploy-pages.yml` で `npm ci`、`npm run build` を実行し、`dist/site/` を配信する。相対URLなのでプロジェクトのサブパスでも動作する。旧 `prototype/` は配信しない。

ワークフローの公開ジョブは通常の検証ジョブとは分離する。ローカル検証が開発作業の完了条件であり、GitHub Actionsの完了待ちは別途依頼がある場合に行う。Pagesの初期設定が未完了ならリポジトリー設定のPagesでGitHub Actionsを選ぶ。公開環境の有効化・反映状態は、ローカル検証だけでは確認できない。
