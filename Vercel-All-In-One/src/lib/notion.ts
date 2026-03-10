import { Client } from '@notionhq/client';

export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

export const DATABASE_IDS = {
  ZONES: '207f2317-55ae-8137-a815-d5e30b51abf8',
  PROJECTS: '207f2317-55ae-8135-abf8-ea6150021c30',
  TASKS: '207f2317-55ae-8141-9dba-c847715bc9e1',
  TEMPLATE: '207f2317-55ae-8003-87a1-f1dc5fb32991', // Solo levelling your life
  LEVELING_SYSTEM: '207f2317-55ae-8143-8672-ddbd333aa0c0'
};

/**
 * Validates connectivity and retrieves database properties
 */
export async function getDatabaseSchema(databaseId: string) {
  try {
    const response = await notion.databases.retrieve({ database_id: databaseId });
    return response;
  } catch (error) {
    console.error(`Notion API Error retrieving database ${databaseId}:`, error);
    throw new Error(`Failed to map database schema. Please check your Notion integration and share database with it.`);
  }
}
