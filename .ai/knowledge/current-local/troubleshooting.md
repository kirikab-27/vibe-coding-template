# トラブルシューティング履歴

このドキュメントは、プロジェクト開発中に発生した問題と解決策を記録します。

---
id: k001
title: prismjs Vite build error
date: 2025-06-21
tags: [build-error, vite, library]
versions:
  vite: ">=4.0.0"
  react: ">=18.0.0"
  prismjs: "1.29.0"
severity: high
---

### 問題
Viteでprismjsをインポートしたときにモジュールresolutionエラーが発生

### エラーメッセージ
```
Cannot find module 'prismjs/components/prism-javascript'
```

### 発生状況
- Viteでビルド実行時
- prismjsをインポートしようとした際

### 原因
- prismjsのモジュール解決がViteと互換性がない
- ESモジュールとCommonJSの混在問題

### 解決策
prism-react-rendererに切り替えることで解決（→ k002）

```bash
# prismjsをアンインストール
npm uninstall prismjs @types/prismjs

# prism-react-rendererをインストール
npm install prism-react-renderer
```

### 関連知識
- k002: prism-react-renderer solution
- k003: React + Vite互換性パターン

### 予防策
- Viteプロジェクトではprism-react-rendererを使用
- ビルドツールとの互換性を事前確認

---
id: k004
title: WSL localhost access issue
date: 2025-06-21
tags: [wsl, network, vite]
versions:
  vite: ">=4.0.0"
  wsl: "2.0"
severity: medium
---

### 問題
WSL環境でVite開発サーバーにブラウザからアクセスできない

### 発生状況
- WSL環境でnpm run devを実行
- ブラウザからhttp://localhost:5173にアクセスできない

### 原因
- WSLのネットワーク設定
- Viteのデフォルトホスト設定が127.0.0.1

### 解決策
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

### 関連知識
- k005: WSL network configuration patterns

### 予防策
- WSL環境では常にhost: '0.0.0.0'を設定
- ネットワークURLも確認可能に

---
id: k006
title: TypeScript generic type inference error
date: 2025-06-21
tags: [typescript, generics, hooks]
versions:
  typescript: ">=5.0.0"
  react: ">=18.0.0"
severity: medium
---

### 問題
useLocalStorageフックでジェネリック型の推論エラー

### エラーメッセージ
```
Type 'Memo[]' is not assignable to type 'never[]'
```

### 発生状況
- useLocalStorageフックを使用時
- ジェネリック型の推論エラー

### 解決策
```typescript
// 明示的に型を指定
export function useMemosStorage() {
  return useLocalStorage<Memo[]>(STORAGE_KEY, []);
}
```

### 関連知識
- k007: TypeScript generics best practices

### 予防策
- カスタムフックでは明示的な型指定
- ジェネリック型の正しい使用

---
id: k008
title: marked.js async type error
date: 2025-06-21
tags: [markdown, types, async]
versions:
  marked: ">=4.0.0"
severity: low
---

### 問題
marked(markdown)の返り値の型エラー

### エラーメッセージ
```
Type 'string | Promise<string>' is not assignable to type 'string'
```

### 解決策
```typescript
const result = marked(markdown);
return typeof result === 'string' ? result : markdown;
```

### 関連知識
- k009: Library type handling patterns

### 予防策
- ライブラリのAPIドキュメントを確認
- 返り値の型を適切に処理

---
id: k010
title: ESLint no-explicit-any error
date: 2025-06-21
tags: [eslint, typescript, code-quality]
versions:
  eslint: ">=8.0.0"
  typescript: ">=5.0.0"
severity: low
---

### 問題
ESLint の no-explicit-any ルールエラー

### エラーメッセージ
```
Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

### 解決策
- 具体的な型を定義
- やむを得ない場合はunknownを使用
- 型推論に任せる

### 関連知識
- k007: TypeScript best practices

### 予防策
- tsconfig.jsonでstrictモードを有効化
- 型定義を徹底

---
id: k011
title: ESLint no-prototype-builtins error
date: 2025-06-21
tags: [eslint, javascript, prototype]
versions:
  eslint: ">=8.0.0"
severity: low
---

### 問題
プロトタイプメソッドの直接アクセスエラー

### エラーメッセージ
```
Do not access Object.prototype method 'hasOwnProperty' from target object
```

### 解決策
```typescript
// 修正前
if (localStorage.hasOwnProperty(key))

// 修正後
if (Object.prototype.hasOwnProperty.call(localStorage, key))
```

### 関連知識
- k012: JavaScript prototype patterns

### 予防策
- プロトタイプメソッドの直接呼び出しを避ける
- ESLint推奨パターンに従う

---
id: k013
title: Git authentication error in WSL
date: 2025-06-21
tags: [git, authentication, wsl]
versions:
  git: ">=2.30.0"
  wsl: "2.0"
severity: medium
---

### 問題
WSL環境でgit pushコマンド実行時の認証エラー

### エラーメッセージ
```
fatal: could not read Username for 'https://github.com': No such device or address
```

### 解決策
1. Personal Access Token (PAT)を作成
2. git config --global credential.helper store
3. 手動でgit pushして認証情報を入力

### 関連知識
- k014: Git authentication patterns
- k015: WSL credential management

### 予防策
- GitHub CLIの使用を検討
- SSH認証の設定
- 認証情報の安全な管理

---

## 共通の対処法

### ビルドエラーが発生したら
1. npm run buildでエラー詳細を確認
2. node_modulesを削除して再インストール
3. package-lock.jsonも削除して完全リセット

### TypeScriptエラーが発生したら
1. npm run lintで型エラーを確認
2. tsconfig.jsonの設定を確認
3. 型定義ファイルの存在を確認

### 依存関係の問題
1. npm list [パッケージ名]で依存関係を確認
2. npm outdatedで古いパッケージを確認
3. 慎重にアップデート

---

最終更新: 2025-06-21