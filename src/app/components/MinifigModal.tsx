'use client';

import { useEffect } from 'react';
import { Minifig } from '@/types/minifig';

interface MinifigModalProps {
    minifig: Minifig;
    onClose: () => void;
}

export default function MinifigModal({ minifig, onClose }: MinifigModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-zinc-900 rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 z-10 p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        aria-label="閉じる"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-zinc-600 dark:text-zinc-400"
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
                    <div className="aspect-square bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                        <img
                            src={minifig.img_url}
                            alt={minifig.name}
                            className="w-full h-full object-contain"
                        />
                    </div>
                </div>
                <div className="p-6">
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
                        {minifig.name}
                    </h2>
                    <dl className="space-y-3">
                        <div className="flex justify-between">
                            <dt className="text-sm text-zinc-500 dark:text-zinc-400">ID</dt>
                            <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {minifig.fig_num}
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-zinc-500 dark:text-zinc-400">発売年</dt>
                            <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {minifig.year}年
                            </dd>
                        </div>
                        <div className="flex justify-between">
                            <dt className="text-sm text-zinc-500 dark:text-zinc-400">テーマ</dt>
                            <dd className="text-sm font-medium text-zinc-900 dark:text-zinc-100 text-right max-w-[60%]">
                                {minifig.theme}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
        </div>
    );
}
