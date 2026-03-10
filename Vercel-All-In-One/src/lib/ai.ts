import { generateObject, type LanguageModelV1 } from 'ai';
import { google } from '@ai-sdk/google';
import { groq } from '@ai-sdk/groq';
import { z } from 'zod';

export const TaskGenerationSchema = z.object({
    project: z.object({
        name: z.string(),
        importance: z.enum(['Important', 'Not Important', 'high']).describe("Map 'urgent' to 'Important'. Map 'not urgent' to 'Not Important'."),
        urgency: z.enum(['Urgent', 'Not Urgent', 'high']).describe("Map 'urgent' to 'Urgent'. Map 'not urgent' to 'Not Urgent'."),
        type: z.enum(['Special Missions', 'QUEST']).describe("Category type of this project."),
        aura_value: z.number().describe("Integer reward value for completion."),
        zone_name: z.string().describe("The life zone this project belongs to (e.g. 'Business', 'Health')."),
        start_date: z.string().describe("ISO 8601 YYYY-MM-DD"),
        final_due_date: z.string().describe("ISO 8601 YYYY-MM-DD")
    }),
    tasks: z.array(z.object({
        name: z.string(),
        do_date: z.string().describe("ISO 8601 YYYY-MM-DD"),
        status: z.enum(['Not started', 'In progress', 'Completed']).default('Not started'),
        importance: z.enum(['Important', 'Not Important']).default('Not Important'),
        urgency: z.enum(['Urgent', 'Not Urgent']).default('Not Urgent')
    }))
});

export type GeneratedTaskPlan = z.infer<typeof TaskGenerationSchema>;

export async function generatePlanWithAI(
    prompt: string,
    modelId: string = 'smart',
    primaryModelId: string = 'google:gemini-2.5-flash',
    fallbackModelId: string = 'groq:llama3-8b-8192'
): Promise<GeneratedTaskPlan> {
    const systemMessage = `
    You are an expert AI Life Coach and Task Architect.
    Break user input into exactly ONE master Project and a list of actionable Tasks.
    Today is ${new Date().toISOString().split('T')[0]}. Use YYYY-MM-DD for all dates.
  `;

    if (modelId === 'smart' || modelId === 'primary') {
        try {
            return await _generate(getModelById(primaryModelId), systemMessage, prompt, `Primary (${primaryModelId})`);
        } catch (error) {
            console.error(`Primary model (${primaryModelId}) failed. Falling back...`, error);
            return await _generate(getModelById(fallbackModelId), systemMessage, prompt, `Fallback (${fallbackModelId})`);
        }
    }

    const model = getModelById(modelId === 'fallback' ? fallbackModelId : modelId);
    return await _generate(model, systemMessage, prompt, `Explicit (${modelId})`);
}

function getModelById(id: string): LanguageModelV1 {
    if (id.startsWith('groq:')) return groq(id.replace('groq:', ''));
    if (id.startsWith('google:')) return google(id.replace('google:', ''));
    return google('gemini-2.5-flash');
}

async function _generate(model: LanguageModelV1, system: string, prompt: string, modelNameLog: string) {
    console.log(`[AI Triggering] Using ${modelNameLog}...`);
    const { object } = await generateObject({ model, schema: TaskGenerationSchema, system, prompt, mode: 'json' });
    return object;
}
