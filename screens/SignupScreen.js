// screens/SignupScreen.js
import React, { useState, useContext, useEffect } from 'react';
import {
  View, TextInput, Text, Alert, TouchableOpacity,
  StyleSheet, Image, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import I18n from '../i18n';
import { LanguageContext } from '../contexts/LanguageContext';

export default function SignupScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    I18n.locale = language;
  }, [language]);

  const handleSignup = async () => {
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert(I18n.t('error'), I18n.t('allFieldsRequired'));
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(I18n.t('error'), I18n.t('passwordMismatch'));
      return;
    }

    try {
      // Firebase Auth create user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Firestore backend: Save user profile
      await setDoc(doc(db, 'profiles', email), {
        userName: `${firstName} ${lastName}`,
        userEmail: email,
        profilePicture: null,
      });

      Alert.alert(I18n.t('signupSuccess'));
      navigation.navigate('Home', { name: `${firstName} ${lastName}`, email });
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-email') {
        errorMessage = I18n.t('invalidEmail');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = I18n.t('weakPassword');
      }
      Alert.alert(I18n.t('signupFailed'), errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : null}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Image source={require('../assets/farm.png')} style={styles.logo} />
          <Text style={styles.title}>{I18n.t('signUp')}</Text>

          <Text style={styles.label}>{I18n.t('firstName')}</Text>
          <TextInput
            style={styles.input}
            placeholder={I18n.t('enterFirstName')}
            value={firstName}
            onChangeText={setFirstName}
            placeholderTextColor="#b2b2b2"
          />

          <Text style={styles.label}>{I18n.t('lastName')}</Text>
          <TextInput
            style={styles.input}
            placeholder={I18n.t('enterLastName')}
            value={lastName}
            onChangeText={setLastName}
            placeholderTextColor="#b2b2b2"
          />

          <Text style={styles.label}>{I18n.t('email')}</Text>
          <TextInput
            style={styles.input}
            placeholder={I18n.t('emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#b2b2b2"
          />

          <Text style={styles.label}>{I18n.t('password')}</Text>
          <TextInput
            style={styles.input}
            placeholder={I18n.t('passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#b2b2b2"
          />

          <Text style={styles.label}>{I18n.t('confirmPassword')}</Text>
          <TextInput
            style={styles.input}
            placeholder={I18n.t('reenterPassword')}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#b2b2b2"
          />

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>{I18n.t('signUp')}</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginText}>
              {I18n.t('alreadyHaveAccount')} <Text style={styles.loginLink}>{I18n.t('login')}</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#e8f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 28,
    width: '100%',
    maxWidth: 400,
    elevation: 8,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 20,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#43a047',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1b5e20',
    letterSpacing: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#388e3c',
    fontWeight: 'bold',
    marginLeft: 2,
    alignSelf: 'flex-start',
  },
  input: {
    height: 48,
    borderColor: '#b2dfdb',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: '#f9f9f9',
    fontSize: 16,
    color: '#222',
    marginBottom: 16,
    width: '100%',
    elevation: 2,
  },
  button: {
    backgroundColor: '#43a047',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 18,
    width: '100%',
    elevation: 3,
    shadowColor: '#388e3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  loginText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  loginLink: {
    color: '#43a047',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});