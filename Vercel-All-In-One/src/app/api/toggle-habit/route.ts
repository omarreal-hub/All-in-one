import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

const ToggleSchema = z.object({
  habit_id: z.string().min(1),
  action: z.literal('toggle')
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { habit_id } = ToggleSchema.parse(body);

    const page = await notion.pages.retrieve({ page_id: habit_id }) as any;
    const currentValue = page.properties.Done?.checkbox || false;

    await notion.pages.update({
      page_id: habit_id,
      properties: {
        Done: {
          checkbox: !currentValue
        }
      }
    });

    return NextResponse.json({ success: true, newStatus: !currentValue });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}