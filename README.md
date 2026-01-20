# figle

LEGOミニフィグの検索・閲覧、およびコレクション管理を行うWebアプリケーション

## 機能

- ミニフィグ一覧表示（グリッド形式、無限スクロール対応）
- 発売年でのソート
- キーワード検索（名前、ID、テーマ）
- ミニフィグ詳細表示

## 技術スタック

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma ORM
- NextAuth.js（Google認証）

## セットアップ

```bash
npm install
```

### 環境変数

`.env.local`ファイルを作成し、以下の環境変数を設定:

```
DATABASE_URL=your_database_url
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) でアクセス

## データソース

ミニフィグデータは[Rebrickable](https://rebrickable.com/)から取得
