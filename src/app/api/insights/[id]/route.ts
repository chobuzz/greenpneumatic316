
import { NextResponse } from 'next/server';
import { syncToGoogleSheet } from '@/lib/sheets';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        await syncToGoogleSheet('insight', { ...body, id }, 'update');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update insight' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await syncToGoogleSheet('insight', { id }, 'delete');
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete insight' }, { status: 500 });
    }
}
