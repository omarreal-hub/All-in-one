import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

const NoteSchema = z.object({
    message: z.object({
        text: z.string().min(1)
    })
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message } = NoteSchema.parse(body);

        // Create note in Notes Database
        const response = await notion.pages.create({
            parent: { database_id: '207f2317-55ae-8169-b1ba-fbdce796789a' },
            properties: {
                Name: {
                    title: [
                        { text: { content: message.text } }
                    ]
                },
                Status: {
                    status: { name: 'Inbox' }
                }
            }
        });

        return NextResponse.json({ success: true, id: response.id });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
