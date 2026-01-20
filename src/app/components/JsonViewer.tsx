'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Minifig, SortOrder } from '@/types/minifig';
import MinifigModal from './MinifigModal';

interface JsonResponse {
    items: Minifig[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

export default function JsonViewer() {
    const [items, setItems] = useState<Minifig[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const [sortOrder, setSortOrder] = useState<SortOrder>('year_desc');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [selectedMinifig, setSelectedMinifig] = useState<Minifig | null>(null);
    const observerTarget = useRef<HTMLDivElement>(null);
    const debounceTimer = useRef<NodeJS.Timeout | null>(null);

    const loadItems = useCallback(async (pageNum: number, append: boolean = false, sort: SortOrder, query: string) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const params = new URLSearchParams({
                page: pageNum.toString(),
                limit: '20',
                sort,
            });
            if (query) {
                params.set('q', query);
            }
            const response = await fetch(`/api/json?${params}`);
            const data: JsonResponse = await response.json();

            if (append) {
                setItems((prev) => [...prev, ...data.items]);
            } else {
                setItems(data.items);
            }

            setPage(data.page);
            setHasMore(data.hasMore);
            setTotal(data.total);
            setError(null);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'エラーが発生しました');
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    // 検索クエリのデバウンス
    useEffect(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        debounceTimer.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, [searchQuery]);

    // 初回ロードとソート・検索変更時のリロード
    useEffect(() => {
        loadItems(1, false, sortOrder, debouncedQuery);
    }, [loadItems, sortOrder, debouncedQuery]);

    // 無限スクロール
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadItems(page + 1, true, sortOrder, debouncedQuery);
                }
            },
            { threshold: 0.1 }
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) {
            observer.observe(currentTarget);
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget);
            }
        };
    }, [hasMore, loadingMore, loading, page, loadItems, sortOrder, debouncedQuery]);

    const handleSortChange = (newSort: SortOrder) => {
        setSortOrder(newSort);
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
            </div>
        );
    }

    if (error && items.length === 0) {
        return (
            <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400">
                エラー: {error}
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* 検索・ソートコントロール */}
            <div className="mb-6 space-y-4">
                {/* 検索バー */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="ミニフィグを検索..."
                        className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-full transition-colors"
                            aria-label="検索をクリア"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 text-zinc-400"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    )}
                </div>

                {/* ソート・件数表示 */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400">
                        {total.toLocaleString()}件
                        {debouncedQuery && ` (「${debouncedQuery}」で検索)`}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-600 dark:text-zinc-400">並び替え:</span>
                        <select
                            value={sortOrder}
                            onChange={(e) => handleSortChange(e.target.value as SortOrder)}
                            className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="year_desc">発売年: 新しい順</option>
                            <option value="year_asc">発売年: 古い順</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* グリッド表示 */}
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-4">
                {items.map((item, index) => (
                    <div
                        key={`${item.fig_num}-${index}`}
                        onClick={() => setSelectedMinifig(item)}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                        {item.img_url && (
                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                <img
                                    src={item.img_url}
                                    alt={item.name}
                                    className="w-full h-full object-contain"
                                    loading="lazy"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                        <div className="p-3">
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                {item.name}
                            </div>
                            <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                                {item.year}年
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* 検索結果なし */}
            {!loading && items.length === 0 && debouncedQuery && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-lg text-zinc-600 dark:text-zinc-400">
                        「{debouncedQuery}」に一致するミニフィグが見つかりませんでした
                    </div>
                </div>
            )}

            {/* 無限スクロールトリガー */}
            {hasMore && (
                <div ref={observerTarget} className="flex items-center justify-center p-8">
                    {loadingMore && (
                        <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
                    )}
                </div>
            )}

            {/* 全件表示完了 */}
            {!hasMore && items.length > 0 && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        すべてのデータを表示しました
                    </div>
                </div>
            )}

            {/* 詳細モーダル */}
            {selectedMinifig && (
                <MinifigModal
                    minifig={selectedMinifig}
                    onClose={() => setSelectedMinifig(null)}
                />
            )}

            {/* トップへ戻るボタン */}
            <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="fixed bottom-6 right-6 p-3 bg-zinc-800 dark:bg-zinc-700 text-white rounded-full shadow-lg hover:bg-zinc-700 dark:hover:bg-zinc-600 transition-colors"
                aria-label="トップへ戻る"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 15l7-7 7 7"
                    />
                </svg>
            </button>
        </div>
    );
}
