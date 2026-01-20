import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { Minifig, SortOrder } from '@/types/minifig';

let cachedData: Minifig[] | null = null;

async function getMinifigs(): Promise<Minifig[]> {
    if (cachedData) {
        return cachedData;
    }
    const filePath = join(process.cwd(), 'public', 'data', 'minifigs.json');
    const content = await readFile(filePath, 'utf-8');
    cachedData = JSON.parse(content) as Minifig[];
    return cachedData;
}

function parseYear(year: string): number {
    const parsed = parseInt(year);
    return isNaN(parsed) ? 0 : parsed;
}

function sortMinifigs(items: Minifig[], sort: SortOrder): Minifig[] {
    const sorted = [...items];
    switch (sort) {
        case 'year_asc':
            return sorted.sort((a, b) => parseYear(a.year) - parseYear(b.year));
        case 'year_desc':
            return sorted.sort((a, b) => parseYear(b.year) - parseYear(a.year));
        default:
            return sorted;
    }
}

function searchMinifigs(items: Minifig[], query: string): Minifig[] {
    const lowerQuery = query.toLowerCase();
    return items.filter(item =>
        item.name.toLowerCase().includes(lowerQuery) ||
        item.fig_num.toLowerCase().includes(lowerQuery) ||
        item.theme.toLowerCase().includes(lowerQuery)
    );
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);
        const sort = (searchParams.get('sort') || 'year_desc') as SortOrder;
        const query = searchParams.get('q') || '';

        let items = await getMinifigs();

        // 検索フィルタ
        if (query) {
            items = searchMinifigs(items, query);
        }

        // ソート
        items = sortMinifigs(items, sort);

        // ページネーション
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = items.slice(startIndex, endIndex);
        const hasMore = endIndex < items.length;

        return NextResponse.json({
            items: paginatedItems,
            page,
            limit,
            total: items.length,
            hasMore,
        });
    } catch (error) {
        console.error('Error reading JSON file:', error);
        return NextResponse.json(
            { error: 'Failed to read JSON file' },
            { status: 500 }
        );
    }
}
