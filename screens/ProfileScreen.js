import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import I18n from '../i18n';
import { LanguageContext } from '../contexts/LanguageContext';

export default function ProfileScreen({ route, navigation }) {
  const { language } = useContext(LanguageContext);
  const { name, email } = route.params || {
    name: I18n.t('welcome'),
    email: 'example@example.com',
  };

  const [userName, setUserName] = useState(name);
  const [userEmail, setUserEmail] = useState(email);
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    I18n.locale = language;
    const loadProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem('profile');
        if (profileData) {
          const { userName, userEmail, profilePicture } = JSON.parse(profileData);
          setUserName(userName);
          setUserEmail(userEmail);
          setProfilePicture(profilePicture);
        }
      } catch (error) {
        console.log('Failed to load profile:', error);
      }
    };
    loadProfile();
  }, [language]);

  const getPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need permission to access your gallery.');
      return false;
    }
    return true;
  };

  const handleSelectPicture = async () => {
    const hasPermission = await getPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      setProfilePicture(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!userName || !userEmail) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const profileData = { userName, userEmail, profilePicture };
      await AsyncStorage.setItem('profile', JSON.stringify(profileData));
      Alert.alert('Profile Updated', 'Your profile has been saved successfully.');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{I18n.t('profile') || 'Profile'}</Text>

        <TouchableOpacity onPress={handleSelectPicture} style={styles.avatarWrapper}>
          <Image
            source={profilePicture ? { uri: profilePicture } : require('../assets/prof.png')}
            style={styles.profilePicture}
          />
          <View style={styles.cameraIconWrapper}>
            <Text style={styles.cameraIcon}>📷</Text>
          </View>
        </TouchableOpacity>
        <Text style={styles.changePictureText}>{I18n.t('changePhoto') || 'Change Profile Picture'}</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{I18n.t('name') || 'Name'}</Text>
          <TextInput
            style={styles.input}
            value={userName}
            onChangeText={setUserName}
            placeholder={I18n.t('name') || 'Enter your name'}
            placeholderTextColor="#b2b2b2"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{I18n.t('email') || 'Email'}</Text>
          <TextInput
            style={styles.input}
            value={userEmail}
            onChangeText={setUserEmail}
            placeholder={I18n.t('email') || 'Enter your email'}
            keyboardType="email-address"
            placeholderTextColor="#b2b2b2"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>{I18n.t('save') || 'Save'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
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
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#1b5e20',
    letterSpacing: 1,
  },
  avatarWrapper: {
    alignSelf: 'center',
    marginBottom: 8,
    position: 'relative',
  },
  profilePicture: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
    borderWidth: 3,
    borderColor: '#43a047',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 6,
  },
  cameraIconWrapper: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    elevation: 3,
  },
  cameraIcon: {
    fontSize: 20,
    color: '#43a047',
  },
  changePictureText: {
    textAlign: 'center',
    color: '#388e3c',
    fontSize: 15,
    marginBottom: 18,
    fontWeight: 'bold',
    letterSpacing: 0.3,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#388e3c',
    fontWeight: 'bold',
    marginLeft: 2,
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
    elevation: 2,
  },
  button: {
    backgroundColor: '#43a047',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 18,
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
});