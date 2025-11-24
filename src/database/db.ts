import { open } from 'react-native-quick-sqlite';

let db: any = null;

/**
 * Initialize SQLite database and ensure the table exists
 */
export const initDB = async () => {
  try {
    db = open({ name: 'productApp.db' });

    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL,
        rating INTEGER,
        image TEXT,
        availableQty INTEGER
      );
    `);

    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        firstName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        lastName TEXT NOT NULL,
        password TEXT NOT NULL
      );
   `);
    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        wishlist INTEGER DEFAULT 0,
        cart INTEGER DEFAULT 0,
        quantity INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (productId) REFERENCES products(id),
        FOREIGN KEY (userId) REFERENCES users(id)
      );
   `);

    await db.executeAsync(`
      CREATE TABLE IF NOT EXISTS profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId NUMBER NOT NULL,
          userData TEXT NOT NULL
      )
      
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
  image?: string | null;
  availableQty?: number;
}) {
  const db = await getDB();
  if (!db) {
    console.warn('⚠️ insertProductInDb() called before DB initialized');
    return;
  }

  await db.executeAsync(
    `
    INSERT INTO products (name, price, description, rating, image,availableQty)
    VALUES (?, ?, ?, ?, ?,?);
  `,
    [
      product.name,
      product.price,
      product.description || '',
      product.rating || 0,
      product.image ?? null,
      product.availableQty,
    ],
  );

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

export const getDB = () => {
  if (!db) {
    console.warn('⚠️ getDB() called before initDB()');
  }
  return db;
};

export async function columnExists(columnName: string) {
  const db = getDB();
  const result = await db.executeAsync(`PRAGMA table_info(profile);`);

  const columns = result.rows?._array || [];
  return columns.some((col: any) => col.name === columnName);
}
