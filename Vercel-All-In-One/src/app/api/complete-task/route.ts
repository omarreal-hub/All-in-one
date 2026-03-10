import { NextRequest, NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

const RequestSchema = z.object({
    page_id: z.string().min(5, "A valid Notion page_id is required."),
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { page_id } = RequestSchema.parse(body);

        console.log(`[API] Received request to complete task: ${page_id}`);

        // 1. Fetch current status to toggle
        const page = await notion.pages.retrieve({ page_id: page_id }) as any;
        const currentStatus = page.properties.Status?.status?.name;
        const isCompleted = currentStatus === 'Completed';

        // 2. Toggle status
        const response = await notion.pages.update({
            page_id: page_id,
            properties: {
                'Status': { status: { name: isCompleted ? 'In progress' : 'Completed' } },
                'Completed Date': isCompleted ? { date: null } : { date: { start: new Date().toISOString() } }
            }
        });

        console.log(`[API] Successfully toggled task: ${response.id} to ${isCompleted ? 'In progress' : 'Completed'}`);

        return NextResponse.json({
            success: true,
            message: `Task successfully marked as ${isCompleted ? 'In progress' : 'Completed'}.`,
            page_id: response.id,
            newStatus: isCompleted ? 'In progress' : 'Completed'
        });

    } catch (error: any) {
        console.error('[API ERROR completing task]', error);

        // Distinguish Zod validation error
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Invalid Payload', details: (error as any).errors }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}
