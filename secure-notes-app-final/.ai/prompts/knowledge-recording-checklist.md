# 📋 知識記録チェックリスト

開発中に遭遇する様々な状況に応じて、適切に知識を記録するためのチェックリストです。

## 🔧 新しいライブラリ/ツールの統合

- [ ] **パッケージ情報**
  - パッケージ名とバージョン
  - インストールコマンド
  - 依存関係の注意点

- [ ] **セットアップ手順**
  - 初期設定のコード例
  - 環境変数の設定（必要な場合）
  - TypeScript型定義の追加方法

- [ ] **基本的な使用例**
  - 最小限の動作するコード
  - よく使うパターン
  - ベストプラクティス

- [ ] **注意点・落とし穴**
  - バージョン互換性の問題
  - パフォーマンスへの影響
  - 既知の制限事項

## 🐛 エラーと解決策

- [ ] **エラー情報**
  - 完全なエラーメッセージ
  - エラー発生箇所（ファイル:行番号）
  - 再現手順

- [ ] **原因分析**
  - 根本原因の説明
  - なぜエラーが発生したか

- [ ] **解決方法**
  - 実際に機能した解決策
  - 代替案（もしあれば）
  - 予防策

## 🌐 API/外部サービス連携

- [ ] **エンドポイント情報**
  - ベースURL
  - 認証方法
  - レート制限

- [ ] **リクエスト/レスポンス**
  - 成功時のレスポンス例
  - エラーレスポンスの種類
  - タイムアウト設定

- [ ] **実装パターン**
  - エラーハンドリング
  - リトライロジック
  - キャッシュ戦略

## 🎨 UI/UXパターン

- [ ] **コンポーネント設計**
  - コンポーネント構造
  - Props定義
  - 状態管理方法

- [ ] **スタイリング**
  - 使用したCSSテクニック
  - レスポンシブ対応
  - アニメーション/トランジション

- [ ] **アクセシビリティ**
  - ARIA属性の使用
  - キーボードナビゲーション
  - スクリーンリーダー対応

## ⚡ パフォーマンス最適化

- [ ] **問題の特定**
  - パフォーマンス測定結果
  - ボトルネックの特定方法

- [ ] **最適化手法**
  - 実施した最適化
  - 効果の測定結果
  - トレードオフ

- [ ] **モニタリング**
  - 継続的な監視方法
  - パフォーマンス指標

## 🔒 セキュリティ考慮事項

- [ ] **脆弱性対策**
  - 対処した脆弱性
  - 実装した対策
  - テスト方法

- [ ] **認証・認可**
  - 実装パターン
  - トークン管理
  - セッション管理

## 📝 記録のベストプラクティス

### タイトルの付け方
```
k[XXX]: [動詞] + [対象] + [簡潔な説明]
例: k208: Chart.jsでリアルタイムグラフを実装する方法
```

### タグの使い方
```yaml
tags: [react, performance, hooks, optimization]
difficulty: intermediate
time-saved: 2-3 hours
```

### コード例の書き方
- 実際に動作するコードを記載
- 重要な部分にコメントを追加
- エッジケースも考慮

### 関連リンクの記載
- 公式ドキュメント
- 参考にしたブログ記事
- Stack Overflowの回答
- 関連する他の知識エントリー（kXXX）

## 🎯 記録タイミング

1. **即座に記録すべきもの**
   - 解決に30分以上かかったエラー
   - 新しい実装パターンの発見
   - パフォーマンスの大幅な改善

2. **機能完成時に記録**
   - 実装の全体的なアプローチ
   - 設計判断の理由
   - 学んだベストプラクティス

3. **セッション終了時に振り返り**
   - 今日の主な発見
   - 改善できる点
   - 明日への引き継ぎ事項

---

**Remember**: 「今の自分」ではなく「3ヶ月後の自分」や「他の開発者」のために記録を残しましょう。明確で、検索しやすく、実用的な知識を蓄積することが、長期的な開発効率の向上につながります。