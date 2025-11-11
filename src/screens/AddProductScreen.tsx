import React, { useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  View,
  Image,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/type';
import { launchImageLibrary } from 'react-native-image-picker';
import { insertProductInDb } from '../database/db';
import { copyToAppStorage } from '../../utils/fileHelper';

export default function AddProductScreen() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [rating, setRating] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);

  type NavigationProp = NativeStackNavigationProp<
    RootStackParamList,
    'AddProduct'
  >;
  const navigation = useNavigation<NavigationProp>();

  /**
   * Select an image and copy it to app's internal storage
   */
  const pickImage = async () => {
    try {
      const res = await launchImageLibrary({
        mediaType: 'photo',
        selectionLimit: 1,
        quality: 0.8,
      });

      if (res.didCancel) return;
      const asset = res.assets?.[0];
      if (!asset?.uri) return;

      const copiedUri = await copyToAppStorage(asset.uri);
      setImageUri(copiedUri);

      Alert.alert(
        '✅ Image Selected',
        'Image copied to app storage successfully.',
      );
    } catch (err) {
      console.error('Image picking error:', err);
      Alert.alert('Error', 'Could not pick image.');
    }
  };

  /**
   * Validate and insert product into SQLite
   */
  const handleAdd = async () => {
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    const numericPrice = parseFloat(price);
    const numericRating = parseInt(rating);

    // 🔍 Validation checks
    if (!trimmedName)
      return Alert.alert('Validation Error', 'Product name is required.');
    if (trimmedName.length > 50)
      return Alert.alert(
        'Validation Error',
        'Name cannot exceed 50 characters.',
      );
    if (trimmedDescription.length > 200)
      return Alert.alert(
        'Validation Error',
        'Description cannot exceed 200 characters.',
      );
    if (isNaN(numericPrice))
      return Alert.alert('Validation Error', 'Please enter a valid price.');
    if (numericPrice < 10 || numericPrice > 1000)
      return Alert.alert(
        'Validation Error',
        'Price must be between ₹10 and ₹1000.',
      );
    if (isNaN(numericRating))
      return Alert.alert('Validation Error', 'Please enter a valid rating.');
    if (numericRating < 1 || numericRating > 5)
      return Alert.alert('Validation Error', 'Rating must be between 1 and 5.');

    try {
      await insertProductInDb({
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        rating: numericRating,
        image: imageUri,
      });

      Alert.alert('✅ Success', 'Product added successfully!');
      navigation.replace('Products', { refresh: true } as never);
    } catch (err) {
      console.log('🚀 ~ handleAdd ~ err:', err);
      console.error('Error inserting product:', err);
      Alert.alert('Error', 'Failed to save product.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Add Product</Text>

        {/* --- Inputs --- */}
        <TextInput
          placeholder="Name (max 50 chars)"
          placeholderTextColor="#888"
          value={name}
          onChangeText={setName}
          style={styles.input}
          maxLength={50}
        />
        <TextInput
          placeholder="Description (max 200 chars)"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          maxLength={200}
        />
        <TextInput
          placeholder="Price (₹10 - ₹1000)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
          style={styles.input}
        />
        <TextInput
          placeholder="Rating (1–5)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={rating}
          onChangeText={setRating}
          style={styles.input}
        />

        {/* --- Image picker --- */}
        <View style={{ alignItems: 'center', marginVertical: 10, gap:6 }}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={{ width: 120, height: 120, borderRadius: 8 }}
            />
          ) : (
            <View
              style={{
                width: 120,
                height: 120,
                borderRadius: 8,
                backgroundColor: '#ddd',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text style={{ color: '#555' }}>No Image</Text>
            </View>
          )}
          <Button title="Pick Image" onPress={pickImage} />
        </View>

        {/* --- Save --- */}
        <TouchableOpacity style={styles.button} onPress={handleAdd}>
          <Text style={styles.buttonText}>Save Product</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    color: '#222',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
