import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const limit = parseInt(searchParams.get('limit') || '20', 10);

        const filePath = join(process.cwd(), 'public', 'data', 'minifigs.json');
        const content = await readFile(filePath, 'utf-8');
        const data = JSON.parse(content);

        // JSONの最初の配列を取得（users配列など）
        const allItems = Array.isArray(data) ? data : Object.values(data)[0];
        const itemsArray = Array.isArray(allItems) ? allItems : [allItems];

        // ページネーション
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedItems = itemsArray.slice(startIndex, endIndex);
        const hasMore = endIndex < itemsArray.length;

        return NextResponse.json({
            items: paginatedItems,
            page,
            limit,
            total: itemsArray.length,
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
