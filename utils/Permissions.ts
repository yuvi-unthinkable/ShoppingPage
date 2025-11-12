import { Platform } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

// Request camera permission
export const RequestCameraPermission = async () => {
  try {
    const permission =
      Platform.OS === 'android'
        ? PERMISSIONS.ANDROID.CAMERA
        : PERMISSIONS.IOS.CAMERA;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED:
        console.log('Camera permission granted');
        return true;
      case RESULTS.DENIED:
        console.log('Camera permission denied');
        break;
      case RESULTS.BLOCKED:
        console.log('Camera permission permanently denied');
        break;
    }

    return false;
  } catch (err) {
    console.warn('Camera permission error:', err);
    return false;
  }
};

// Request media/images permission
export const RequestMediaImagesPermission = async () => {
  try {
    const permission =
      Platform.OS === 'android'
        ? Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE
        : PERMISSIONS.IOS.PHOTO_LIBRARY;

    const result = await request(permission);

    switch (result) {
      case RESULTS.GRANTED:
        console.log('Media permission granted');
        return true;
      case RESULTS.DENIED:
        console.log('Media permission denied');
        break;
      case RESULTS.BLOCKED:
        console.log('Media permission permanently denied');
        break;
    }

    return false;
  } catch (err) {
    console.warn('Media permission error:', err);
    return false;
  }
};

// Combined check & request
export const checkAndRequestPermissions = async () => {
  try {
    if (Platform.OS === 'android') {
      const cameraStatus = await check(PERMISSIONS.ANDROID.CAMERA);
      const mediaStatus = await check(
        Platform.Version >= 33
          ? PERMISSIONS.ANDROID.READ_MEDIA_IMAGES
          : PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
      );

      const cameraGranted =
        cameraStatus === RESULTS.GRANTED
          ? true
          : await RequestCameraPermission();

      const mediaGranted =
        mediaStatus === RESULTS.GRANTED
          ? true
          : await RequestMediaImagesPermission();

      return cameraGranted && mediaGranted;
    }

    // For iOS
    const cameraGranted = await RequestCameraPermission();
    const mediaGranted = await RequestMediaImagesPermission();
    return cameraGranted && mediaGranted;
  } catch (err) {
    console.warn('Permission check error:', err);
    return false;
  }
};
