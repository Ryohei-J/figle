# CLAUDE.md

## プロジェクト概要

figle - LEGOミニフィグの検索・閲覧・コレクション管理Webアプリ

## 技術スタック

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS 4
- Prisma ORM / PostgreSQL (Neon)
- NextAuth.js (Google認証)

## コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # ビルド
npm run lint     # リント
```

## ディレクトリ構成

- `src/app/` - Next.js App Router
- `src/app/components/` - UIコンポーネント
- `src/app/api/` - APIルート
- `src/types/` - 型定義
- `public/data/minifigs.json` - ミニフィグデータ
- `docs/requirements.md` - 詳細な要件定義

## 開発フェーズ

- Phase 1: ミニフィグ閲覧機能（実装済み）
- Phase 2: コレクション管理機能（未着手）
- Phase 3: ソーシャル機能（未着手）
