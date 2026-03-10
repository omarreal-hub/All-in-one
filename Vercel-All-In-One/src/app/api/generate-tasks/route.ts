import { NextRequest, NextResponse } from 'next/server';
import { generatePlanWithAI } from '@/lib/ai';
import { notion, DATABASE_IDS } from '@/lib/notion';
import { normalizeImportance, normalizeUrgency, validateOrProvideDefaultDate } from '@/lib/utils';
import { z } from 'zod';

const RequestSchema = z.object({
    prompt: z.string().min(3),
    modelId: z.string().optional().default('smart'),
    primaryModelId: z.string().optional(),
    fallbackModelId: z.string().optional()
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { prompt, modelId, primaryModelId, fallbackModelId } = RequestSchema.parse(body);

        console.log(`[API] Received task request with model: ${modelId}`);

        // 1. Generate the master plan via Gemini (with Groq fallback) or explicitly requested model
        const plan = await generatePlanWithAI(prompt, modelId, primaryModelId, fallbackModelId);

        // 2. We need to grab the exact Notion ID for the Zone based on the AI's "zone_name". 
        //    For now, we'll retrieve all zones and try to math the name, otherwise we fallback to null (or a default).
        console.log("NOTION CLIENT KEYS:", Object.keys(notion || {}));
        if (notion) console.log("DATABASES:", notion.databases);
        const zonesResponse = await notion.databases.query({ database_id: DATABASE_IDS.ZONES });
        let matchedZoneId = null;

        for (const page of zonesResponse.results) {
            // @ts-ignore
            const titleProp = page.properties['Name']?.title?.[0]?.plain_text;
            if (titleProp && titleProp.toLowerCase().includes(plan.project.zone_name.toLowerCase())) {
                matchedZoneId = page.id;
                break;
            }
        }

        if (!matchedZoneId) {
            console.warn(`[API] Could not strictly match AI Zone label '${plan.project.zone_name}' to any existing Notion Life Zone. The Relation property will be left empty.`);
        }

        // 3. Create the Parent Project
        console.log(`[API] Injecting new Project into Notion: ${plan.project.name}`);
        const projectResponse = await notion.pages.create({
            parent: { database_id: DATABASE_IDS.PROJECTS },
            properties: {
                'Name': { title: [{ text: { content: plan.project.name } }] },
                'Importance': { select: { name: normalizeImportance(plan.project.importance) } },
                'Urgency': { select: { name: normalizeUrgency(plan.project.urgency) } },
                'Type': { select: { name: plan.project.type } }, // Assumes exact match 'Special Missions' | 'QUEST'
                'Aura Value': { number: plan.project.aura_value },
                'start date': { date: { start: validateOrProvideDefaultDate(plan.project.start_date) } },
                'Due Date': { date: { start: validateOrProvideDefaultDate(plan.project.final_due_date) } },
                // Safely conditionally append the Zone relation only if it was successfully matched against Notion
                ...(matchedZoneId ? { 'Zones': { relation: [{ id: matchedZoneId }] } } : {})
            }
        });

        const projectId = projectResponse.id;

        // 4. Create the Child Tasks linked to the Project
        console.log(`[API] Parent Project created (${projectId}). Bootstrapping ${plan.tasks.length} child Tasks...`);

        const taskResults = [];
        for (const task of plan.tasks) {
            console.log(`[API] Injecting Task: ${task.name}`);
            const taskRes = await notion.pages.create({
                parent: { database_id: DATABASE_IDS.TASKS },
                properties: {
                    'Task Name': { title: [{ text: { content: task.name } }] },
                    'Importance': { select: { name: normalizeImportance(task.importance) } },
                    'Urgency': { select: { name: normalizeUrgency(task.urgency) } },
                    'Status': { status: { name: task.status } },
                    'Due Date': { date: { start: validateOrProvideDefaultDate(task.do_date) } },
                    'Project': { relation: [{ id: projectId }] } // Bind task to parent project
                }
            });
            taskResults.push(taskRes.id);
        }

        console.log(`[API] Task Generation completely successful! ${taskResults.length} tasks injected.`);
        return NextResponse.json({
            success: true,
            project_id: projectId,
            tasks_created: taskResults.length,
            ai_plan: plan
        });

    } catch (error: any) {
        console.error('[API ERROR]', error);

        // Distinguish Zod param errors from 500 serverless errors
        if (error instanceof z.ZodError) {
            return NextResponse.json({ success: false, error: 'Invalid Payload', details: error.errors }, { status: 400 });
        }

        return NextResponse.json({
            success: false,
            error: error.message || 'Internal Server Error',
            debug_notion_keys: Object.keys(notion || {}),
            debug_notion_db_keys: notion ? Object.keys(notion.databases || {}) : null,
            debug_notion_typeof: typeof notion,
            suggestion: 'Ensure NOTION_API_KEY, GOOGLE_GENERATIVE_AI_API_KEY, and GROQ_API_KEY are properly configured in .env.local.'
        }, { status: 500 });
    }
}
