import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

const BuySchema = z.object({
    itemId: z.string().min(1)
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { itemId } = BuySchema.parse(body);

        // 1. Fetch Item Price
        const item = await notion.pages.retrieve({ page_id: itemId }) as any;
        const price = item.properties.Price?.number || 0;
        const isClaimed = item.properties.Checkbox?.checkbox || false;

        if (isClaimed) {
            return NextResponse.json({ error: 'Item already claimed' }, { status: 400 });
        }

        // 2. Fetch User Aura (Profile ID)
        const profile = await notion.pages.retrieve({ page_id: '207f2317-55ae-8153-9da3-ce5cfe4dd0c8' }) as any;
        const auraText = profile.properties['Aura']?.formula?.string || '';
        const totalMatch = auraText.match(/TOTAL\s*:\s*(\d+)/i);
        const userAura = totalMatch ? parseInt(totalMatch[1], 10) : 0;

        // 3. Verify enough Aura
        if (userAura < price) {
            return NextResponse.json({ error: 'Not enough Aura' }, { status: 400 });
        }

        // 4. Mark as Claimed & Set Date
        await notion.pages.update({
            page_id: itemId,
            properties: {
                Checkbox: {
                    checkbox: true
                }
            }
        });

        return NextResponse.json({ success: true, remainingAura: userAura - price });
    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
