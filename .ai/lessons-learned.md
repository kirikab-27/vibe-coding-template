# 学習した知識と教訓

このドキュメントは、プロジェクト開発を通じて得られた知見を記録します。

## 2025-06-21

### React + TypeScriptのベストプラクティス

**型定義の重要性:**
- インターフェースは必ず定義する
- anyは絶対に使わない（unknownを使用）
- ジェネリクスを活用して再利用性を高める

**学んだこと:**
```typescript
// ❌ 悪い例
const [data, setData] = useState<any>([]);

// ✅ 良い例
const [data, setData] = useState<Memo[]>([]);
```

---

### Viteプロジェクトでのライブラリ選定

**重要な教訓:**
- ビルドツールとの互換性を最優先に確認
- ESモジュール対応のライブラリを選ぶ
- TypeScript型定義の有無を確認

**具体例:**
- prismjs → ビルドエラー
- prism-react-renderer → 完璧に動作

---

### カスタムフックの設計

**学んだパターン:**
```typescript
// 汎用的なフックと特化型フックの組み合わせ
function useLocalStorage<T>() { /* 汎用 */ }
function useMemosStorage() { /* 特化 */ }
```

**メリット:**
- 再利用性と型安全性の両立
- テストが容易
- 責任の分離が明確

---

### エラーハンドリングの重要性

**LocalStorageの例:**
```typescript
try {
  localStorage.setItem(key, value);
} catch (err) {
  if (err instanceof DOMException && err.code === 22) {
    // QuotaExceededError
  }
}
```

**学んだこと:**
- 具体的なエラー型で分岐
- ユーザーフレンドリーなメッセージ
- 復旧可能な方法を提供

---

### WSL環境での開発

**ネットワーク設定:**
- 必ずhost: '0.0.0.0'を設定
- localhostだけでなくネットワークIPも確認
- ファイアウォール設定に注意

**ファイルシステム:**
- パフォーマンスはWSL2内が最速
- Windows側のファイルアクセスは遅い
- 大文字小文字の区別に注意

---

### コンポーネント設計の教訓

**責任の分離:**
```typescript
// ✅ 良い例：単一責任
function MemoList({ memos, onSelect, onDelete }) { }

// ❌ 悪い例：複数の責任
function MemoManager({ /* 全部入り */ }) { }
```

**Props設計:**
- コールバックは明確な名前（onXxx）
- 必須とオプショナルを明確に
- 型定義で使用方法を示す

---

### Git運用の知見

**コミットメッセージ:**
```bash
# ✅ 良い例
feat: ローカルストレージ保存機能を実装
fix: prism-react-rendererに切り替えてビルドエラーを解消

# ❌ 悪い例
update
fix bug
```

**ブランチ戦略:**
- 小規模プロジェクトはmainのみで十分
- 機能開発が並行したらfeatureブランチ

---

### パフォーマンス最適化の教訓

**早すぎる最適化は避ける:**
1. まず動くものを作る
2. 実際に遅い部分を計測
3. 必要な箇所だけ最適化

**React特有の注意点:**
- useEffectの依存配列は正確に
- 不要な再レンダリングを避ける
- key属性を適切に設定

---

### デバッグテクニック

**console.logの活用:**
```typescript
console.log('レンダリング:', { memos, isLoading });
```

**React Developer Tools:**
- コンポーネントツリーの確認
- Props/Stateの監視
- レンダリング回数の確認

---

### ドキュメント作成の重要性

**即座に記録する習慣:**
- エラーが発生したらすぐ記録
- 解決策が見つかったらすぐ記録
- 後回しにすると忘れる

**構造化の重要性:**
- 問題・原因・解決・予防の4点セット
- 具体的なコード例を含める
- 日付を必ず記録

---

### 効率的な開発フロー

**並行作業の活用:**
```bash
# ✅ 複数のツールを同時実行
git status & git diff & git log --oneline -3
```

**ツール使用の最適化:**
- 関連するコマンドは並行実行
- ファイル読み込みもバッチで実行
- 検索操作は事前に戦略を立てる

---

### TypeScriptの活用パターン

**型ガード:**
```typescript
function isMemo(obj: unknown): obj is Memo {
  return typeof obj === 'object' && obj !== null && 
         'id' in obj && 'title' in obj;
}
```

**ユーティリティ型:**
```typescript
type MemoFormData = Omit<Memo, 'id' | 'createdAt' | 'updatedAt'>;
```

---

### CSS/Tailwindの効率的な使い方

**レスポンシブ設計:**
```css
/* モバイルファースト */
grid-cols-1 lg:grid-cols-2
```

**コンポーネント化:**
```typescript
const buttonClasses = "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors";
```

---

### マークダウン処理の知見

**セキュリティ:**
- HTMLエスケープは必須
- dangerouslySetInnerHTMLは慎重に使用
- ユーザー入力は常にサニタイズ

**パフォーマンス:**
- 大きなマークダウンの処理は非同期化検討
- プレビューの更新頻度を調整
- メモ化で不要な再計算を防ぐ

---

### テストとQA

**手動テスト項目:**
1. メモの作成・編集・削除
2. ブラウザリロード後の復元
3. 大量データでの動作
4. エラー状態の確認

**自動化可能な項目:**
- Lintチェック
- TypeScriptコンパイル
- ビルド成功確認

---

### 次回プロジェクトでの改善点

**初期設定:**
- ESLintとPrettierの統合設定
- VSCode設定の共有
- Git hooksの設定

**開発プロセス:**
- テスト駆動開発の導入
- コンポーネントストーリーブック
- 自動デプロイの設定

**ドキュメント:**
- README.mdの充実
- API仕様書の作成
- 設計書の作成

---

### 知識の蓄積方法

**即座に記録:**
- 問題が発生したら即座にメモ
- 解決したら詳細を記録
- 定期的に見直しとブラッシュアップ

**構造化:**
- カテゴリ別に整理
- 検索しやすいキーワードを含める
- 具体例とコードサンプルを含める

**共有と活用:**
- チーム開発では共有
- 新メンバーのオンボーディング資料
- 次のプロジェクトでの参考資料

---

最終更新: 2025-06-21