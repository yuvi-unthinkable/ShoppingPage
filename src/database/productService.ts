import { getDB } from './db';
import RNFS from 'react-native-fs';

// -------------------- ADD PRODUCT --------------------

export const addProduct = async (
  name: string,
  description: string,
  price: number,
  rating: number,
  image?: string | null, // ✅ optional image
) => {
  try {
    const db = getDB();
    if (!db) {
      console.error('❌ addProduct error: DB not initialized');
      return;
    }

    const result = await db.executeAsync(
      `INSERT INTO products (name, description, price, rating, image) VALUES (?, ?, ?, ?, ?);`,
      [name, description, price, rating, image ?? null],
    );

    console.log('✅ Product added:', { name, description, price, rating, image });
    return result;
  } catch (error) {
    console.error('❌ addProduct error:', error);
    throw error;
  }
};

// -------------------- GET PRODUCTS --------------------

export const getProducts = async (
  search = '',
  minPrice = 0,
  maxPrice = 1000,
  rating = 0,
  limit = 7,
  offset = 0,
) => {
  try {
    const db = getDB();
    if (!db) return [];

    const query = `
      SELECT * FROM products
      WHERE (
        LOWER(name) LIKE LOWER(?) OR 
        LOWER(description) LIKE LOWER(?) OR 
        CAST(price AS TEXT) LIKE ?
      )
      AND price BETWEEN ? AND ?
      AND rating >= ?
      ORDER BY id DESC
      LIMIT ? OFFSET ?;
    `;

    const result = await db.executeAsync(query, [
      `%${search}%`,
      `%${search}%`,
      `%${search}%`,
      minPrice,
      maxPrice,
      rating,
      limit,
      offset,
    ]);

    return result.rows?._array ?? [];
  } catch (error) {
    console.error('❌ getProducts error:', error);
    return [];
  }
};

// -------------------- DELETE PRODUCT --------------------

export const deleteProduct = async (id: number, imagePath?: string) => {
  try {
    const db = getDB();
    if (!db) return;

    await db.executeAsync('DELETE FROM products WHERE id = ?', [id]);
    console.log(`🗑️ Product deleted: ${id}`);

    if (imagePath) {
      try {
        const path = imagePath.startsWith('file://')
          ? imagePath.replace('file://', '')
          : imagePath;
        const exists = await RNFS.exists(path);
        if (exists) {
          await RNFS.unlink(path);
          console.log('🧹 Image file deleted:', path);
        }
      } catch (err) {
        console.warn('⚠️ Failed to delete image file:', err);
      }
    }
  } catch (error) {
    console.error('❌ deleteProduct error:', error);
  }
};
