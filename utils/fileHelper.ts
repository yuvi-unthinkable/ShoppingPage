// fileHelpers.ts
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

export async function copyToAppStorage(sourceUri: string, destFileName?: string) {
  const name = destFileName ?? `product_${Date.now()}.jpg`;
  const destPath = `${RNFS.DocumentDirectoryPath}/${name}`;

  // On Android content:// URIs sometimes need to be read via RNFS.copyFile
  // RNFS.copyFile supports file:// and content:// (RNFS >= supported). If you hit issues,
  // use react-native-blob-util to read streams. Try RNFS.copyFile first.
  const normalizedSrc = sourceUri.startsWith('file://') ? sourceUri.replace('file://', '') : sourceUri;

  // For RNFS.copyFile, pass paths without file:// on Android
  const srcForCopy = Platform.OS === 'android' && normalizedSrc.startsWith('/') ? normalizedSrc : sourceUri;

  try {
    // If sourceUri is content:// it may still work with RNFS.copyFile
    await RNFS.copyFile(srcForCopy, destPath);
    return `file://${destPath}`; // store this in DB
  } catch (err) {
    console.error('copyToAppStorage copy error', err);
    // fallback: try readFile + writeFile (base64)
    try {
      const base64 = await RNFS.readFile(srcForCopy, 'base64');
      await RNFS.writeFile(destPath, base64, 'base64');
      return `file://${destPath}`;
    } catch (err2) {
      console.error('copyToAppStorage read/write fallback failed', err2);
      throw err2;
    }
  }
}
