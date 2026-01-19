'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="flex items-center gap-2 px-4 py-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
            </div>
        );
    }

    if (session) {
        return (
            <div className="flex items-center gap-3">
                {session.user?.image && (
                    <Image
                        src={session.user.image}
                        alt={session.user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                    />
                )}
                <button
                    onClick={() => signOut()}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                >
                    ログアウト
                </button>
            </div>
        );
    }

    return (
        <button
            onClick={() => signIn('google')}
            className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
            ログイン
        </button>
    );
}
