import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  Text,
  Alert,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import I18n from '../i18n';
import { LanguageContext } from '../contexts/LanguageContext';

export default function LoginScreen({ navigation }) {
  const { language } = useContext(LanguageContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    I18n.locale = language;
  }, [language]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(I18n.t('error'), I18n.t('emailPasswordRequired'));
      return;
    }
    setLoading(true);
    try {
      // Firebase Auth login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Fetch user profile from Firestore (backend)
      const userDoc = await getDoc(doc(db, 'profiles', email));
      let userName = '';
      if (userDoc.exists()) {
        userName = userDoc.data().userName || '';
      }

      setLoading(false);
      Alert.alert(I18n.t('loginSuccess'));
      navigation.navigate('Home', { name: userName, email });
    } catch (error) {
      setLoading(false);
      let errorMessage = error.message;
      if (error.code === 'auth/invalid-email') {
        errorMessage = I18n.t('invalidEmail');
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = I18n.t('userNotFound');
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = I18n.t('wrongPassword');
      }
      Alert.alert(I18n.t('loginFailed'), errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Image source={require('../assets/farm.png')} style={styles.logo} />
          <Text style={styles.title}>{I18n.t('login')}</Text>

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

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{I18n.t('login')}</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>
              {I18n.t('noAccount')}{' '}
              <Text style={styles.signupLink}>{I18n.t('signUp')}</Text>
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
    width: 110,
    height: 110,
    alignSelf: 'center',
    marginBottom: 18,
    borderRadius: 24,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#43a047',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1b5e20',
    letterSpacing: 1,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
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
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  signupText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#555',
    marginTop: 2,
  },
  signupLink: {
    color: '#43a047',
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});