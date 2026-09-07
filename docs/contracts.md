# 契約と交換手順

## データと公開版

基盤の通信値は、循環、クラスインスタンス、undefined、非有限数、疎配列を含まないJSON。キーを辞書順で正規化し、SHA-256の入力にする。これは本プロジェクトの方式であり、別の正規化標準との互換は宣言しない。

- [publication/1](../foundation/publication.schema.json): 公開ID、内容、実装記述、権限、資産。
- [session/1](../foundation/session.schema.json): 状態、リビジョン、pending、操作結果、イベント、外部結果。
- 各領域の `*.schema.json`: 内容と状態の具体的な意味。

実装は `id`、`contract`、`digest` が一致するときだけ解決する。未知の版へフォールバックしない。公開版は対応する複数のプレゼンターを固定できる。

## エンジン

```text
const engine = {
  id, contract, requires: ['capability-name/1'],
  validateContent(content),
  validateState(content, state, sessionStatus),
  validateCommand(envelope),
  validateAction(content, state, envelope),
  initialize(content, context),
  dispatch(content, state, envelope, context),
  observe(content, state)
};
```

上記はインターフェースの表記。`initialize` と `dispatch` は `{ state, status: 'active' | 'completed', events }` を返す。`observe` は形式固有の表示用オブジェクトを返す。3メソッドとも非同期実装を使える。ホストは入力をコピー・凍結し、結果を領域契約で検証する。

命令は `{ id, expectedRevision, type, payload }`。payloadの形、実行可能性、完了条件は領域側が決める。`session.*` はホスト専用イベント。命令IDは英数字、ハイフン、ドット、アンダースコア、コロンを使う。

交換する際は、領域の検証を通すエンジンを[実装登録](../implementations/modules.mjs)と組み立て側に追加して再ビルドする。engineを切り替えると公開IDは変わる。既存セーブを強引に引き継がない。[独立Python実装との比較](../verification/contracts/experiences.test.mjs)が交換例になる。

## プレゼンター

`{ id, contract, render(observation, bindings) }` を実装する。Webのbindingsは論理資産IDの解決、命令送信、終了、ブランド名を提供する。ターミナルは同じ観測を文字列へ変換する。

内容全体や保存リポジトリーは受け取らない。正解や次ノードを知って進める処理はエンジンが担う。`authored-stage/1` と `inquiry-stage/1` は互いの画面や状態を継承しない。

## 保存リポジトリー

| メソッド | 契約 |
| --- | --- |
| `load(id)` | `{token, value}` またはnull。返却値の変更は保存値へ影響しない |
| `create(id, value)` | 未使用IDだけ原子的に作成し、競合時はnull |
| `commit(id, expectedToken, value)` | token一致時だけ置換し、新tokenを返す。競合時はnull |
| `list(scope)` | 指定scopeの値のみ返す |
| `getEffect(key)` | 記録済みの外部結果、またはnull |
| `recordEffect(key, value)` | 最初の値だけ保存し、保存されている値を返す |

SQLiteは原子的なDB更新、IndexedDBはreadwriteトランザクションでCASを実装する。[同じ契約テスト](../verification/repository-contract.mjs)が全実装で動く。

復元時は公開ID・実装・領域状態・操作履歴・効果キーを検証する。転送できるのはpendingがない確定状態。既存IDへ上書きせず、別保存先に未使用IDとして取り込む。取得済みの生成結果を維持する。研究scopeは通常プレイと混ぜない。

## 外部能力

アダプターは `id`、`idempotent: true`、`invoke(input, { idempotencyKey })` を持つ。エンジンはSDKを直接呼ばず、`context.invoke(capability, input)` を使う。

`case.generate/1` の入力はseed、役のID一覧、鍵の印一覧。結果は[生成事件の契約](../domains/inquiry/instance.schema.json)に従い、人物と鍵を一対一に結び、真相とアクセス記録を整合させる。

初期化失敗はpendingのまま残る。障害を直して `retryPending` で再開する。取得済みの不正な生成結果も勝手に再抽選しない。そのセッションを閉じ、新セッションでやり直す。`close` は後着の結果による復活を防ぐが、外部API自体を物理的に取り消さない。

意味が異なる変更には新しい契約名を与える。新形式は必要な領域・コンパイラー・エンジン・観測・表示・検証を揃えて追加する。基盤への追加は、複数形式で同じ意味と責務を持つ場合に限る。
