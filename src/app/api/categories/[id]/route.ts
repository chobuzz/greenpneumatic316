
import { NextResponse } from 'next/server';
import { syncToGoogleSheet } from '@/lib/sheets';

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const id = (await params).id;
    await syncToGoogleSheet('category', { id }, 'delete');
    return NextResponse.json({ success: true });
}
