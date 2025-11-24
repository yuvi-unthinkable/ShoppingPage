import { Alert } from 'react-native';
import { columnExists, getDB } from './db';

export type ProfileInput = {
  userId: number;
  name: string;
  phone: string;
  email: string;
  height: number;

  address?: string;
  additionalText?: string;
  intrests?: string[];
  dob?: Date;
};

export type ProfileRow = {
  userId: number;
  name: string;
  phone: string;
  email: string;
  height: number;
  extra: string;
};

export const addProfileRecord = async (userId: number, dataString: string) => {
  try {
    const db = getDB();

    const query = `
      INSERT INTO profile (
        userId, userData
      )
      VALUES (?,?)
    `;

    const values = [userId, dataString];
    console.log('🚀 ~ addProfileRecord ~ values:', values);

    const result = await db.executeAsync(query, values);
    console.log('🚀 ~ addProfileRecord ~ result:', result);

    return result;
  } catch (error) {
    console.log('addProfileRecord error:', error);
  }
};

export const getProfileRecord = async (userId: number) => {
  const db = getDB();
  console.log('USER ID >>>>>>>>>>>>>>>>', userId);
  try {
    const result = await db.executeAsync(
      `SELECT * FROM profile WHERE userId = ?`,
      [userId],
    );
    console.log('🚀 ~ getProfileRecord ~ result:', result);

    if (result.rows.length === 0) return null;

    return result.rows._array;
  } catch (error) {
    console.log('getProfileRecord error:', error);
    return null;
  }
};

export const getRecordData = async (id: number): Promise<ProfileRow | null> => {
  const db = getDB();

  try {
    const result = await db.executeAsync(
      `
      SELECT * FROM profile WHERE id = ?
      `,
      [id],
    );
    console.log('🚀 ~ getRecordData ~ result:', result);
    if (result.rows.length === 0) return null;

    return result.rows._array?.[0] as ProfileRow;
  } catch (error) {
    console.log('getRecordData error:', error);
    return null;
  }
};

export const updateProfile = async (id: number, userData: string) => {
  try {
    const db = getDB();

    return await db.executeAsync(
      `UPDATE profile SET userData = ? WHERE id = ?`,
      [userData, id],
    );
  } catch (error) {
    console.log('updateProfile error:', error);
  }
};
