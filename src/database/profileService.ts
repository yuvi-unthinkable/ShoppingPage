import { Alert } from 'react-native';
import { columnExists, getDB } from './db';

export type ProfileInput = {
  userId: number;
  label: string;
  name: string;
  phone: string;
  email: string;
  height: number;

  address?: string;
  additionalText?: string;
  label2?: string;
  intrests?: string[];
  dob?: Date;
};

export type ProfileRow = {
  userId: number;
  label: string;
  name: string;
  phone: string;
  email: string;
  height: number;
  extra: string;
};

export const addProfileRecord = async (props: ProfileInput) => {
  try {
    const db = getDB();

    const {
      userId,
      label,
      name,
      phone,
      email,
      height,
      address,
      additionalText,
      label2,
      intrests,
      dob,
    } = props;
    console.log('🚀 ~ addProfileRecord ~ props:', props);

    // 🔍 Check if label already exists
    const existing = await db.executeAsync(
      'SELECT label FROM profile WHERE LOWER(label) = LOWER(?);',
      [label.trim()],
    );

    const extraObj: any = {};
    console.log('🚀 ~ addProfileRecord ~ extraObj:', extraObj);
    if (address) extraObj.address = address;
    if (additionalText) extraObj.additionalText = additionalText;
    if (label2) extraObj.label2 = label2;
    if (intrests) extraObj.intrests = intrests;
    if (dob) extraObj.dob = dob.toISOString();

    const extraJSON = JSON.stringify(extraObj);

    const query = `
      INSERT INTO profile (
        userId, label, name, phone, email, height, extra
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      userId,
      label.trim(),
      name.trim(),
      phone.toString(),
      email.trim(),
      height,
      extraJSON,
    ];
    console.log('🚀 ~ addProfileRecord ~ values:', values);

    const result = await db.executeAsync(query, values);
    console.log('🚀 ~ addProfileRecord ~ result:', result);

    return result;
  } catch (error) {
    console.log('addProfileRecord error:', error);
  }
};

export const getProfileRecord = async (
  userId: number,
): Promise<ProfileRow | null> => {
  const db = getDB();
  try {
    const result = await db.executeAsync(
      `SELECT * FROM profile WHERE userId = ?`,
      [userId],
    );
    console.log('🚀 ~ getProfileRecord ~ result:', result);

    if (result.rows.length === 0) return null;

    return result.rows._array as ProfileRow;
  } catch (error) {
    console.log('getProfileRecord error:', error);
    return null;
  }
};

export const updateProfile = async (
  userId: number,
  address?: string,
  additionalText?: string,
  label2?: string,
  intrests?: string[],
  dob?: Date,
) => {
  try {
    const db = getDB();

    const row = await getProfileRecord(userId);
    if (!row) return null;

    const extraObj = row.extra ? JSON.parse(row.extra) : {};

    if (address !== undefined) extraObj.address = address;
    if (additionalText !== undefined) extraObj.additionalText = additionalText;
    if (label2 !== undefined) extraObj.label2 = label2;
    if (intrests !== undefined) extraObj.intrests = intrests;
    if (dob !== undefined) extraObj.dob = dob.toISOString();

    const extraJSON = JSON.stringify(extraObj);

    return await db.executeAsync(
      `UPDATE profile SET extra = ? WHERE userId = ?`,
      [extraJSON, userId],
    );
  } catch (error) {
    console.log('updateProfile error:', error);
  }
};
