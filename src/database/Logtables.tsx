import { getDB } from './db';

export const LogTables = async () => {
  try {
    const db = getDB();
    const result = await db.executeAsync(
      `SELECT name FROM sqlite_master WHERE type='table';`,
    );
    console.log('📋 Tables in DB:', result);
  } catch (error) {
    console.error('❌ Error listing tables:', error);
  }
};

export const ProductTable = async () => {
  try {
    const db = await getDB(); // ✅ ensure async call
    const result = await db.executeAsync('SELECT * FROM products;');
    console.log('📋 Data in products table:', result.rows?._array || []);
    return result.rows?._array || [];
  } catch (error) {
    console.error('❌ Error listing products:', error);
  }
};
export const Profiletable = async () => {
  try {
    const db = await getDB(); // ✅ ensure async call
    const result = await db.executeAsync('SELECT * FROM profile;');
    console.log('📋 Data in profile table:', result.rows?._array || []);
    return result.rows?._array || [];
  } catch (error) {
    console.error('❌ Error listing profile:', error);
  }
};
