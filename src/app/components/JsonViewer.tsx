'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

interface JsonResponse {
    items: any[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}

export default function JsonViewer() {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [total, setTotal] = useState(0);
    const observerTarget = useRef<HTMLDivElement>(null);

    const loadItems = useCallback(async (pageNum: number, append: boolean = false) => {
        if (append) {
            setLoadingMore(true);
        } else {
            setLoading(true);
        }

        try {
            const response = await fetch(`/api/json?page=${pageNum}&limit=20`);
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
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    }, []);

    useEffect(() => {
        loadItems(1, false);
    }, [loadItems]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadItems(page + 1, true);
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
    }, [hasMore, loadingMore, loading, page, loadItems]);

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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {items.map((item, index) => (
                    <div
                        key={`${item.fig_num || item.id || index}-${index}`}
                        className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                    >
                        {item.img_url && (
                            <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                                <img
                                    src={item.img_url}
                                    alt={item.name || `Item ${index + 1}`}
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
                            {item.name && (
                                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                                    {item.name}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {hasMore && (
                <div ref={observerTarget} className="flex items-center justify-center p-8">
                    {loadingMore && (
                        <div className="text-lg text-zinc-600 dark:text-zinc-400">読み込み中...</div>
                    )}
                </div>
            )}

            {!hasMore && items.length > 0 && (
                <div className="flex items-center justify-center p-8">
                    <div className="text-sm text-zinc-500 dark:text-zinc-400">
                        すべてのデータを表示しました
                    </div>
                </div>
            )}
        </div>
    );
}
