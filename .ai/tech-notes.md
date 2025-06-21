# 技術的決定事項

このドキュメントは、プロジェクトの技術的な決定とその理由を記録します。

## 2025-06-21

### ビルドツール: Viteを選択
**決定理由:**
- 高速なHMR (Hot Module Replacement)
- TypeScriptのネイティブサポート
- ゼロコンフィグで始められる
- 本番ビルドの最適化が優秀

**考慮した代替案:**
- Create React App → メンテナンス停止
- Webpack → 設定が複雑
- Parcel → コミュニティが小さい

---

### UIフレームワーク: Tailwind CSSを選択
**決定理由:**
- ユーティリティファーストで開発速度向上
- ビルドサイズの最適化（未使用CSSの削除）
- レスポンシブデザインが簡単
- カスタマイズ性が高い

**考慮した代替案:**
- CSS Modules → スタイルの再利用性が低い
- styled-components → ランタイムオーバーヘッド
- Material-UI → カスタマイズが困難

---

### マークダウンパーサー: marked.jsを選択
**決定理由:**
- 軽量で高速
- 拡張性が高い（カスタムレンダラー）
- 活発にメンテナンスされている
- TypeScriptサポート

**実装方針:**
```typescript
// カスタムレンダラーでコードブロックを処理
const renderer = new marked.Renderer();
renderer.code = (code, language) => {
  // カスタム処理
};
```

---

### シンタックスハイライト: prism-react-rendererを選択
**変更履歴:**
1. 初期: prismjs → Viteビルドエラー
2. 最終: prism-react-renderer

**決定理由:**
- Reactコンポーネントとして提供
- Viteとの完全な互換性
- TypeScript型定義が組み込み
- テーマのカスタマイズが容易

**実装詳細:**
```typescript
import { Highlight, themes } from 'prism-react-renderer';
// VS Codeダークテーマを使用
theme={themes.vsDark}
```

---

### 状態管理: useStateを選択
**決定理由:**
- アプリケーションの規模が小さい
- Reactの標準機能で十分
- 学習コストが低い
- パフォーマンスへの影響が最小

**将来の拡張性:**
- 必要に応じてContext APIへ移行可能
- さらに大規模化したらRedux/Zustand検討

---

### データ永続化: LocalStorageを選択
**決定理由:**
- ブラウザ標準API
- 実装がシンプル
- 5-10MBの容量で十分
- オフライン対応

**実装方針:**
- カスタムフックで抽象化
- エラーハンドリングを徹底
- 型安全性を確保

---

### TypeScript設定
**strictモードを有効化:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

**理由:**
- 型安全性の向上
- 潜在的なバグの早期発見
- コード品質の向上

---

### コンポーネント設計方針

**単一責任の原則:**
- MemoList: 一覧表示のみ
- MemoForm: フォーム処理のみ
- App: 状態管理とコーディネーション

**Props設計:**
- コールバック関数で親子通信
- 型定義を明確に
- オプショナルプロパティは最小限

---

### パフォーマンス最適化

**コード分割:**
- 動的インポートは現時点では不要
- アプリが大きくなったら検討

**メモ化:**
- React.memoは必要に応じて
- useCallbackは過度に使わない
- パフォーマンス計測してから最適化

---

### セキュリティ考慮事項

**XSS対策:**
- dangerouslySetInnerHTMLの使用箇所を限定
- marked.jsのサニタイズ機能を活用
- ユーザー入力は常にエスケープ

**データ検証:**
- TypeScriptの型システムを活用
- ランタイムでの検証も検討

---

### 開発環境設定

**VSCode推奨拡張:**
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- Tailwind CSS IntelliSense

**Git設定:**
- コミットメッセージ規約（Conventional Commits）
- .gitignoreの適切な設定
- ブランチ戦略は現時点では不要

---

### 将来の拡張計画

**検討中の機能:**
1. マークダウンのエクスポート機能
2. カテゴリーによるフィルタリング
3. 全文検索機能
4. ダークモード対応

**技術的準備:**
- コンポーネントの疎結合を維持
- 状態管理の抽象化
- テストの追加

---

最終更新: 2025-06-21