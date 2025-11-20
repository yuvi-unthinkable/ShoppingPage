import { getDB } from './db';

export async function insertCartDb(cart: {
  productId: number;
  userId: number;
  wishlist?: number;
  cart?: number;
  quantity ?: Number;
}) {
  const db = await getDB();
  if (!db) {
    console.warn('⚠️ insertCartDb() called before DB initialized');
    return;
  }

  // Check if item already exists
  const check = await db.executeAsync(
    'SELECT id FROM cart WHERE productId = ? AND userId = ?;',
    [cart.productId, cart.userId],
  );

  if (check.rows?.length > 0) {
    console.log('⚠️ Product already exists in cart/wishlist.');
    return;
  }

  const sql = `
    INSERT INTO cart (productId, userId, wishlist, cart, quantity)
    VALUES (?, ?, ?, ?, ?);
  `;

  await db.executeAsync(sql, [
    cart.productId,
    cart.userId,
    cart.wishlist || 0,
    cart.cart || 0,
    cart.quantity ||0,
  ]);

  console.log('✅ Added to cart table');
}

export async function getCartDataForUser(userId: number) {
  const db = await getDB();
  if (!db) return [];

  const result = await db.executeAsync(
    `
      SELECT productId, wishlist, cart, quantity
      FROM cart
      WHERE userId = ?;
    `,
    [userId],
  );

  return result.rows?._array || [];
}

export async function insertOrUpdateCart(cart: {
  productId: number;
  userId: number;
  wishlist?: number;
  cart?: number;
  quantity ?: number;
}) {
  const db = await getDB();
  if (!db) return;

  // Check if product exists for this user
  const existing = await db.executeAsync(
    'SELECT * FROM cart WHERE productId = ? AND userId = ?',
    [cart.productId, cart.userId],
  );
  console.log("🚀 ~ insertOrUpdateCart ~ existing:", existing)

  // If row exists → update instead of skipping
  if (existing.rows.length > 0) {
    const row = existing.rows.item(0);

    const updatedWishlist =
      cart.wishlist !== undefined ? cart.wishlist : row.wishlist;

    const updatedCart = cart.cart !== undefined ? cart.cart : row.cart;

    await db.executeAsync(
      `
        UPDATE cart 
        SET wishlist = ?, cart = ?
        WHERE id = ?;
      `,
      [updatedWishlist, updatedCart, row.id],
    );

    console.log('🔄 Updated cart row');
    return;
  }

  // Insert new row if not found
  await db.executeAsync(
    `
      INSERT INTO cart (productId, userId, wishlist, cart, quantity)
      VALUES (?, ?, ?, ?, ?);
    `,
    [cart.productId, cart.userId, cart.wishlist || 0, cart.cart || 0, cart.quantity || 1],
  );

  console.log('✅ Inserted new cart row');
}

export async function getWishlistItems(userId: number) {
  const db = await getDB();
  if (!db) return [];

  const result = await db.executeAsync(
    `
      SELECT 
        cart.id AS cartId,
        cart.wishlist,
        products.*
      FROM cart
      INNER JOIN products ON cart.productId = products.id
      WHERE cart.userId = ? AND cart.wishlist = 1;
    `,
    [userId],
  );

  return result.rows?._array || [];
}

export async function getCartItems(userId: number) {
  const db = await getDB();
  if (!db) return [];

  const result = await db.executeAsync(
    `
      SELECT 
        quantity,
        cart.id AS cartId,
        cart.cart,
        products.*
      FROM cart
      INNER JOIN products ON cart.productId = products.id
      WHERE cart.userId = ? AND cart.cart = 1;
    `,
    [userId],
  );

  return result.rows?._array || [];
}

export async function getCartCount(userId: number, productId: number) {
  const db = await getDB();
  if (!db) return 0;

  const result = await db.executeAsync(
    `
            SELECT COUNT(*) AS count
            FROM cart
            WHERE userId = ? AND productId = ? AND cart = 1;
        `,
    [userId, productId],
  );
  return result.rows?.item(0)?.count ?? 0;
}

export async function decrementProductQty(producId: number) {
  const db = await getDB();
  await db.executeAsync(
    `UPDATE products SET availableQty = availableQty-1 WHERE id = ?;`,
    [producId],
  );
}
export async function incrementProductQty(producId: number) {
  const db = await getDB();
  await db.executeAsync(
    `UPDATE products SET availableQty = availableQty-+1 WHERE id = ?;`,
    [producId],
  );
}


export async function addQuantity(producId:number, userId : number,) {
    const db = await getDB();
    await db.executeAsync(
        `UPDATE cart SET quantity = quantity+1 WHERE userId = ? AND productId = ?`,
        [userId, producId]
    );
    
}
export async function subtractQuantity(producId:number, userId : number,) {
    const db = await getDB();
    await db.executeAsync(
        `UPDATE cart SET quantity = quantity-1 WHERE userId = ? AND productId = ?`,
        [userId, producId]
    );
    
}