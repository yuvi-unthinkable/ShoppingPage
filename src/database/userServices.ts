import { Alert } from 'react-native';
import { getDB } from './db';

export async function registerUser(
  firstName: string,
  lastName: string,
  email: string,
  password: string,
) {
  const db = await getDB();

  try {
    // 🔍 Check if email already exists
    const existing = await db.executeAsync(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?);',
      [email.trim()],
    );

    const existingUser =
      existing.rows?.length > 0 ||
      (existing.rows?._array && existing.rows._array.length > 0);

    if (existingUser) {
      console.log("'Email is already registered.'");
      Alert.alert('Error', 'Email is already registered.');
      console.warn('⚠️ Duplicate email found, registration blocked');
      return null;
    } else {
      // ✅ Insert new user
      const result = await db.executeAsync(
        'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?);',
        [firstName.trim(), lastName.trim(), email.trim(), password.trim()],
      );

      Alert.alert('Success', 'Registration successful!');
      console.log('✅ User registered successfully:', result);
      return result;
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Something went wrong';
    Alert.alert('Error', message);
    console.error('❌ registerUser error:', err);
  }
}

export async function loginUser(email: string, password: string) {
  const db = await getDB();
  console.log('🔍 Checking login credentials...');

  const result = await db.executeAsync(
    'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1;',
    [email.trim(), password.trim()],
  );
  console.log('🚀 ~ loginUser ~ result:', result);

  const user = result.rows?.item(0) || null;
  console.log('✅ loginUser result:', user);
  return user;
}

export const getAllUsers = async () => {
  const db = await getDB();
  const res = await db.executeAsync('SELECT * FROM users;');
  return res?.rows?._array || [];
};
