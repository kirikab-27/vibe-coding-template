# Tech Notes - Secure Notes App

## ID: t001
### 暗号化アルゴリズムの選択
**決定:** AES-GCM 256ビット暗号化を採用
**理由:**
1. Web Crypto APIでネイティブサポート
2. 認証付き暗号化（AEAD）で改ざん検出可能
3. ブラウザでの高性能
4. 業界標準のセキュリティレベル

**実装詳細:**
- 鍵導出: PBKDF2 (SHA-256, 100,000 iterations)
- IVサイズ: 12バイト (GCM推奨)
- ソルト: 16バイト (ランダム生成)
- タグ長: 128ビット

**日付:** 2025-06-25

## ID: t002
### データストレージ戦略
**決定:** IndexedDBを使用したローカル暗号化ストレージ
**理由:**
1. 大容量データに対応
2. 構造化クエリ可能
3. ブラウザ間でのデータ永続化
4. 非同期API

**ライブラリ選択:**
- **idb v8.0**: IndexedDBのPromiseラッパー
- **選択理由**: TypeScript型安全性、使いやすいAPI

**スキーマ設計:**
```typescript
interface SecureNotesDB {
  notes: EncryptedNote;      // 暗号化されたメモ
  user: User;                // ユーザー認証情報
  metadata: StorageMetadata; // アプリメタデータ
}
```

## ID: t003
### 状態管理の方針
**決定:** React Context + useReducer パターン
**理由:**
1. 中規模アプリに適切
2. 外部依存なし
3. TypeScript完全対応
4. デバッグしやすい

**コンテキスト分離:**
- AuthContext: 認証状態、セッション管理
- NotesContext: メモ操作、検索、フィルタ

**代替案との比較:**
- Redux Toolkit: オーバーエンジニアリング
- Zustand: 外部依存増加
- useState: 状態共有困難

## ID: t004
### セキュリティ設計決定
**アーキテクチャ:** ゼロ知識設計
**特徴:**
1. パスワードリセット機能なし
2. 平文データはメモリ内のみ
3. 鍵はセッション中のみ保持
4. 自動ログアウト (30分)

**XSS対策:**
- 入力サニタイズ
- CSP設定予定
- React標準のエスケープ

**セッション管理:**
- 30分自動ログアウト
- ユーザー操作で延長
- ブラウザ閉じるとクリア

## ID: t005
### UIフレームワーク選択
**決定:** Tailwind CSS + Lucide React
**理由:**
- **Tailwind CSS**: ユーティリティファースト、高速開発
- **Lucide React**: 軽量、豊富なアイコン、React最適化

**代替案:**
- Material-UI: 重い、カスタマイズ困難
- Chakra UI: バンドルサイズ大
- 独自CSS: 開発時間長い

**設計方針:**
- レスポンシブデザイン
- ダークモード対応準備
- アクセシビリティ考慮

## ID: t006
### TypeScript設計パターン
**型安全性戦略:**
1. 厳格なinterfaceでドメインモデル定義
2. Unionタイプでエラーハンドリング
3. Genericで再利用性確保

**主要パターン:**
```typescript
// エラーハンドリング
export enum ErrorCode {
  CRYPTO_ERROR = 'CRYPTO_ERROR',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

// 型安全なコンテキスト
interface AuthContextType {
  state: AuthState;
  login: (password: string) => Promise<void>;
}
```

**効果:**
- 実行時エラーの事前防止
- IDE支援の最大化
- リファクタリング安全性