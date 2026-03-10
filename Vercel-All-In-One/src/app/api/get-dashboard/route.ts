import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const todayStr = new Date().toISOString().split('T')[0];

        const [
            profileRes,
            habitsRes,
            projectsRes,
            tasksRes,
            shopRes,
            notesRes
        ] = await Promise.allSettled([
            // 1. Profile Data
            notion.pages.retrieve({ page_id: '207f2317-55ae-8153-9da3-ce5cfe4dd0c8' }),

            // 2. Habits (Today's habits)
            notion.databases.query({
                database_id: '207f2317-55ae-8147-8067-ecc96da80dbe',
                filter: {
                    property: 'Date', date: { equals: todayStr }
                }
            }),

            // 3. Projects (Active)
            notion.databases.query({
                database_id: '207f2317-55ae-8135-abf8-ea6150021c30',
                filter: { property: 'Status', status: { equals: 'In progress' } }
            }),

            // 4. Tasks (All except completed from past days)
            notion.databases.query({
                database_id: '207f2317-55ae-8141-9dba-c847715bc9e1',
                filter: {
                    and: [
                        { property: 'Due Date', date: { on_or_before: todayStr } },
                        {
                            or: [
                                { property: 'Status', status: { does_not_equal: 'Completed' } },
                                { property: 'Completed Date', date: { equals: todayStr } }
                            ]
                        }
                    ]
                }
            }),

            // 5. Shop Items
            notion.databases.query({
                database_id: '207f2317-55ae-815d-87ac-cd9367487ec1'
            }),

            // 6. Notes (Inbox)
            notion.databases.query({
                database_id: '207f2317-55ae-8169-b1ba-fbdce796789a',
                filter: {
                    and: [
                        { property: 'Status', status: { equals: 'Inbox' } },
                        { property: 'Archive', checkbox: { equals: false } }
                    ]
                }
            })
        ]);

        // Parse Profile
        let profileData = {
            name: 'Hero',
            avatar: '',
            points: { total: 0, today: 0 },
            level: { num: 1, bar: "0%" },
            time: { monthBar: "0%", yearBar: "0%" },
            overdue: { tasks: 0, projects: 0 },
            reviewNotes: { count: 0, items: [] as any[] }
        };

        if (profileRes.status === 'fulfilled') {
            const page = profileRes.value as any;
            const p = page.properties;

            // Extract Name
            profileData.name = p['Name']?.title?.[0]?.plain_text || 'Hero';

            // 1. Advanced Avatar Discovery
            // Check properties first (user-uploaded photos)
            const propertyAvatar = p['Files & media']?.files?.[0] || p['Photo']?.files?.[0] || p['Avatar']?.files?.[0] || p['Image']?.files?.[0];
            if (propertyAvatar) {
                profileData.avatar = propertyAvatar.type === 'file' ? propertyAvatar.file.url : propertyAvatar.external?.url;
            }
            // Fallback to Icon
            if (!profileData.avatar && page.icon) {
                profileData.avatar = page.icon.type === 'file' ? page.icon.file.url : page.icon.external?.url;
            }
            // Fallback to Cover
            if (!profileData.avatar && page.cover) {
                profileData.avatar = page.cover.type === 'file' ? page.cover.file.url : page.cover.external?.url;
            }
            // Final fallback to UI Avatars if missing or default gray
            if (!profileData.avatar || profileData.avatar.includes('user_gray.svg')) {
                profileData.avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.name)}&background=7c3aed&color=fff&size=256`;
            }

            // 2. Parse Aura (Points)
            // Try direct number properties first (more reliable)
            profileData.points.total = p['Total Aura']?.number || p['Total Aura']?.formula?.number || 0;
            profileData.points.today = p["Today's Aura"]?.number || p["Today's Aura"]?.formula?.number || 0;

            // Rollback to parsing the "Aura" text formula if needed
            const auraText = p['Aura']?.formula?.string || '';
            if (profileData.points.total === 0) {
                const totalMatch = auraText.match(/TOTAL\s*:\s*(\d+)/i);
                if (totalMatch) profileData.points.total = parseInt(totalMatch[1], 10);
            }
            if (profileData.points.today === 0) {
                const todayMatch = auraText.match(/TODAY\s*:\s*(\d+)/i);
                if (todayMatch) profileData.points.today = parseInt(todayMatch[1], 10);
            }

            // 3. Parse Level & Progress
            const levelStr = p['Level']?.formula?.string || '';
            const lvlNumMatch = levelStr.match(/LEVEL\s*:\s*(\d+)/i);
            const lvlPctMatch = levelStr.match(/(\d+)%/);

            profileData.level.num = p['Level Number']?.number || p['Aura Level']?.number || (lvlNumMatch ? parseInt(lvlNumMatch[1], 10) : 1);
            profileData.level.bar = lvlPctMatch ? lvlPctMatch[1] + "%" : "0%";

            // 4. Time Progress (Month/Year)
            const monthStr = p['MONTH']?.formula?.string || '';
            const yearStr = p['YEAR']?.formula?.string || '';
            const monthMatch = monthStr.match(/(\d+)%/);
            const yearMatch = yearStr.match(/(\d+)%/);
            profileData.time.monthBar = monthMatch ? monthMatch[1] + "%" : "0%";
            profileData.time.yearBar = yearMatch ? yearMatch[1] + "%" : "0%";

            // 5. Overdue counts
            const overdueProjStr = p['Overdue Projects']?.formula?.string || '';
            const overdueTaskStr = p['Overdue Tasks']?.formula?.string || '';
            const projMatch = overdueProjStr.match(/PROJECTS\s*:\s*(\d+)/i) || overdueProjStr.match(/(\d+)/);
            const taskMatch = overdueTaskStr.match(/TASKS\s*:\s*(\d+)/i) || overdueTaskStr.match(/(\d+)/);
            profileData.overdue.projects = projMatch ? parseInt(projMatch[1] || projMatch[0], 10) : 0;
            profileData.overdue.tasks = taskMatch ? parseInt(taskMatch[1] || taskMatch[0], 10) : 0;

            // 6. Review Notes Count
            profileData.reviewNotes.count = p['Notes to review']?.formula?.number || p['Notes to Review']?.formula?.number || 0;
        }

        // Process Notes Results
        if (notesRes.status === 'fulfilled') {
            profileData.reviewNotes.items = notesRes.value.results.map((note: any) => ({
                id: note.id,
                title: note.properties.Name?.title?.[0]?.plain_text ||
                    note.properties.title?.title?.[0]?.plain_text || 'Untitled Note',
                created_time: note.created_time
            }));
            // If the formula count was missing, use actual items count
            if (profileData.reviewNotes.count === 0) {
                profileData.reviewNotes.count = profileData.reviewNotes.items.length;
            }
        }

        // Map Habit Trackers
        const habits = habitsRes.status === 'fulfilled' ? habitsRes.value.results.map((h: any) => ({
            id: h.id,
            title: h.properties.Name?.title?.[0]?.plain_text || 'Untitled Habit',
            completed: h.properties.Done?.checkbox || false,
            aura: h.properties['Aura value']?.number || h.properties.Aura?.formula?.number || 0
        })) : [];

        // Map Standard Entities (Projects/Tasks)
        const mapStandard = (res: any) => res.status === 'fulfilled' ? res.value.results.map((r: any) => {
            const props = r.properties;
            const title = props['Project name']?.title?.[0]?.plain_text ||
                props['Task Name']?.title?.[0]?.plain_text ||
                props['Name']?.title?.[0]?.plain_text || 'Untitled';

            return {
                id: r.id,
                title,
                name: title,
                type: props.Type?.select?.name || 'Routine',
                importance: props.Importance?.select?.name || props.Urgency?.select?.name || 'Normal',
                aura: props.Aura?.formula?.number || props['Aura Value']?.number || 0,
                raw: props
            };
        }) : [];

        const projects = mapStandard(projectsRes);
        const tasks = mapStandard(tasksRes);

        // Map Shop Items (Separate Available and Claimed Today)
        const allShopResults = shopRes.status === 'fulfilled' ? shopRes.value.results : [];

        // Items available to buy (Not claimed)
        const shop = allShopResults
            .filter((s: any) => !s.properties.Claimed?.checkbox)
            .map((s: any) => ({
                id: s.id,
                title: s.properties.Name?.title?.[0]?.plain_text || 'Item',
                name: s.properties.Name?.title?.[0]?.plain_text || 'Item',
                price: s.properties.Price?.number || 0,
                claimed: false
            }));

        // Items claimed today (History)
        const recentPurchases = allShopResults
            .filter((s: any) => {
                const claimed = s.properties.Claimed?.checkbox;
                const dateVal = s.properties.Date?.date?.start || s.properties['Claimed Date']?.date?.start;
                return claimed && dateVal === todayStr;
            })
            .map((s: any) => ({
                id: s.id,
                title: s.properties.Name?.title?.[0]?.plain_text || 'Item',
                price: s.properties.Price?.number || 0,
                date: s.properties.Date?.date?.start || todayStr
            }));

        const auraSpentToday = recentPurchases.reduce((acc, curr) => acc + curr.price, 0);

        // Adjust profile earned (Net -> Gross)
        // Ensure Earned is at least 0 and doesn't include the negative impact of spending
        const auraEarnedToday = Math.max(0, profileData.points.today + auraSpentToday);

        return NextResponse.json({
            profile: {
                ...profileData,
                points: {
                    ...profileData.points,
                    today: auraEarnedToday,
                    spent: auraSpentToday
                },
                recentPurchases
            },
            habits,
            projects,
            tasks,
            shop
        });

    } catch (error) {
        console.error('Dashboard Error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard' }, { status: 500 });
    }
}
