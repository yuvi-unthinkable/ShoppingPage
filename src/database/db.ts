import { open } from 'react-native-quick-sqlite';

let db: any = null;

/**
 * Initialize SQLite database and ensure the table exists
 */
export const initDB = async () => {
  try {
    db = open({ name: 'productApp.db' });

    // ✅ Added image column
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        rating INTEGER,
        image TEXT
      );
    `);

    console.log('✅ products table ready');
  } catch (error) {
    console.error('❌ Error initializing DB:', error);
  }
};

/**
 * Insert a new product into the database
 */
export async function insertProductInDb(product: {
  name: string;
  price: number;
  description?: string;
  rating?: number;
  image?: string | null; // ✅ allow null explicitly
}) {
  const db = await getDB();
  if (!db) {
    console.warn('⚠️ insertProductInDb() called before DB initialized');
    return;
  }

  const sql = `
    INSERT INTO products (name, price, description, rating, image)
    VALUES (?, ?, ?, ?, ?);
  `;

  await db.executeAsync(sql, [
    product.name,
    product.price,
    product.description || '',
    product.rating || 0,
    product.image ?? null, // ✅ safe null fallback
  ]);

  console.log('✅ Product inserted successfully:', product.name);
}

/**
 * Retrieve all products
 */
export async function getAllProducts() {
  const db = await getDB();
  if (!db) return [];

  const result = await db.executeAsync(
    'SELECT * FROM products ORDER BY id DESC;',
  );
  return result.rows?._array || [];
}

/**
 * Get the active DB instance
 */
export const getDB = () => {
  if (!db) {
    console.warn('⚠️ getDB() called before initDB()');
  }
  return db;
};
