import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

const BodySchema = z.object({
    noteId: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { noteId } = BodySchema.parse(body);

        // Update the 'Archive' property to true
        await notion.pages.update({
            page_id: noteId,
            properties: {
                Archive: { checkbox: true }
            }
        });

        return NextResponse.json({ success: true, archived: true });
    } catch (error) {
        console.error('Archive Note Error:', error);
        return NextResponse.json(
            { error: 'Failed to archive note', details: String(error) },
            { status: 500 }
        );
    }
}
