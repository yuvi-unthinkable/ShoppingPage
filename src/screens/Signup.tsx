import {
  Alert,
  Button,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useState } from 'react';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigators/type';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../database/userServices';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'SignUp'>;

export default function Signup() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<NavigationProp>();

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password) {
      return Alert.alert('Error', 'All fields are required');
    }

    // ------ Added Validations (No logic changed) --------
    const trimmedFirst = firstName.trim();
    const trimmedLast = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPass = password.trim();

    if (trimmedFirst.length < 2) {
      return Alert.alert(
        'Validation Error',
        'First name must be at least 2 characters.',
      );
    }

    if (trimmedLast.length < 2) {
      return Alert.alert(
        'Validation Error',
        'Last name must be at least 2 characters.',
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return Alert.alert(
        'Validation Error',
        'Please enter a valid email address.',
      );
    }

    if (trimmedPass.length < 6) {
      return Alert.alert(
        'Validation Error',
        'Password must be at least 6 characters long.',
      );
    }
    // ----------------------------------------------------

    try {
      const result = await registerUser(
        trimmedFirst,
        trimmedLast,
        trimmedEmail,
        trimmedPass,
      );

      if (!result) {
        return;
      }

      Alert.alert('Success', 'User Registered Successfully');
      navigation.navigate('Login');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Something went wrong';
      Alert.alert('Error', message);
      console.error('❌ handleSignup error:', err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Product Listing</Text>

      <View style={styles.formContainer}>
        <Text style={styles.heading}>Welcome here 👋</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>First Name</Text>
          <TextInput
            placeholder="Enter your firstName"
            placeholderTextColor="#888"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />

          <Text style={styles.label}>Last Name</Text>
          <TextInput
            placeholder="Enter your lastName"
            placeholderTextColor="#888"
            value={lastName}
            onChangeText={setLastName}
            style={styles.input}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            placeholder="Enter your email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
        </View>

        <TouchableOpacity style={styles.signpBtn} onPress={handleSignup}>
          <Text style={styles.signpBtnText}>Signup</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupContainer}
          onPress={() => navigation.navigate('Login')}
        >
          <Text style={styles.signupText}>
            Registered Already? <Text style={styles.signupLink}>Login</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------ STYLES (unchanged) ------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1a73e8',
    textAlign: 'center',
    marginBottom: 20,
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginTop: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: '#555',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fafafa',
  },
  signpBtn: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#1a73e8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  signpBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  signupContainer: {
    marginTop: 18,
    alignItems: 'center',
  },
  signupText: {
    fontSize: 15,
    color: '#555',
  },
  signupLink: {
    color: '#1a73e8',
    fontWeight: '600',
  },
});
