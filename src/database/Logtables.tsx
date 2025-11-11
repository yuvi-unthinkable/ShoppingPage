import { getDB } from './db';

export const LogTables = async () => {
  try {
    const db = getDB();
    const result = await db.executeAsync(
      `SELECT name FROM sqlite_master WHERE type='table';`
    );
    console.log('📋 Tables in DB:', result.rows);
  } catch (error) {
    console.error('❌ Error listing tables:', error);
  }
};
