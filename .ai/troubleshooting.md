# トラブルシューティング履歴

このドキュメントは、プロジェクト開発中に発生した問題と解決策を記録します。

## 2025-06-21

### prismjsビルドエラー
**エラーメッセージ:**
```
Cannot find module 'prismjs/components/prism-javascript'
```

**発生状況:**
- Viteでビルド実行時
- prismjsをインポートしようとした際

**原因:**
- prismjsのモジュール解決がViteと互換性がない
- ESモジュールとCommonJSの混在問題

**解決方法:**
```bash
# prismjsをアンインストール
npm uninstall prismjs @types/prismjs

# prism-react-rendererをインストール
npm install prism-react-renderer
```

**予防策:**
- Viteプロジェクトではprism-react-rendererを使用
- ビルドツールとの互換性を事前確認

---

### WSL環境でのlocalhost接続問題
**問題:**
- WSL環境でnpm run devを実行
- ブラウザからhttp://localhost:5173にアクセスできない

**原因:**
- WSLのネットワーク設定
- Viteのデフォルトホスト設定が127.0.0.1

**解決方法:**
```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
```

**予防策:**
- WSL環境では常にhost: '0.0.0.0'を設定
- ネットワークURLも確認可能に

---

### TypeScriptの型エラー (useLocalStorage)
**エラーメッセージ:**
```
Type 'Memo[]' is not assignable to type 'never[]'
```

**発生状況:**
- useLocalStorageフックを使用時
- ジェネリック型の推論エラー

**解決方法:**
```typescript
// 明示的に型を指定
export function useMemosStorage() {
  return useLocalStorage<Memo[]>(STORAGE_KEY, []);
}
```

**予防策:**
- カスタムフックでは明示的な型指定
- ジェネリック型の正しい使用

---

### marked.jsの非同期処理エラー
**エラーメッセージ:**
```
Type 'string | Promise<string>' is not assignable to type 'string'
```

**発生状況:**
- marked(markdown)の返り値の型エラー

**解決方法:**
```typescript
const result = marked(markdown);
return typeof result === 'string' ? result : markdown;
```

**予防策:**
- ライブラリのAPIドキュメントを確認
- 返り値の型を適切に処理

---

### ESLintエラー: no-explicit-any
**エラーメッセージ:**
```
Unexpected any. Specify a different type  @typescript-eslint/no-explicit-any
```

**解決方法:**
- 具体的な型を定義
- やむを得ない場合はunknownを使用
- 型推論に任せる

**予防策:**
- tsconfig.jsonでstrictモードを有効化
- 型定義を徹底

---

### ESLintエラー: no-prototype-builtins
**エラーメッセージ:**
```
Do not access Object.prototype method 'hasOwnProperty' from target object
```

**解決方法:**
```typescript
// 修正前
if (localStorage.hasOwnProperty(key))

// 修正後
if (Object.prototype.hasOwnProperty.call(localStorage, key))
```

**予防策:**
- プロトタイプメソッドの直接呼び出しを避ける
- ESLint推奨パターンに従う

---

### Git認証エラー
**エラーメッセージ:**
```
fatal: could not read Username for 'https://github.com': No such device or address
```

**発生状況:**
- git pushコマンド実行時
- WSL環境での認証問題

**解決方法:**
1. Personal Access Token (PAT)を作成
2. git config --global credential.helper store
3. 手動でgit pushして認証情報を入力

**予防策:**
- GitHub CLIの使用を検討
- SSH認証の設定
- 認証情報の安全な管理

---

### CSS @importの警告
**警告メッセージ:**
```
@import must precede all other statements (besides @charset or empty @layer)
```

**発生状況:**
- Viteビルド時の警告
- Tailwind CSSの後に@importを配置

**解決方法:**
- 警告は機能に影響なし（現状維持）
- 必要に応じてPostCSS設定で対応

**予防策:**
- CSSの@import順序に注意
- PostCSSプラグインの活用

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