import React, { useContext, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, SafeAreaView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LanguageContext } from '../contexts/LanguageContext';
import i18n from '../i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function HomeScreen() {
  const navigation = useNavigation();
  const { switchLanguage, language } = useContext(LanguageContext);
  const [userName, setUserName] = useState('');

  useEffect(() => { i18n.locale = language; }, [language]);

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        const { userName } = JSON.parse(profileData);
        setUserName(userName || '');
      }
    };
    loadProfile();
    const unsubscribe = navigation.addListener('focus', loadProfile);
    return unsubscribe;
  }, [navigation]);

  // Logout with backend
  const handleLogout = async () => {
    await signOut(auth);
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.scrollContainer} style={Platform.OS === 'web' ? { flex: 1 } : null} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <View style={styles.triToggleWrapper}>
            {['en', 'hi', 'mr'].map((lng) => (
              <TouchableOpacity
                key={lng}
                style={[styles.toggleItem, language === lng && styles.toggleItemActive]}
                onPress={() => switchLanguage(lng)}
              >
                <Text style={[styles.toggleText, language === lng && styles.toggleTextActive]}>
                  {lng.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.welcomeText}>
            {i18n.t('welcome')}, {userName ? userName : i18n.t('farmer')}!
          </Text>
          <Image source={require('../assets/farm.png')} style={styles.image} />
          <View style={styles.grid}>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Crops')}>
              <Text style={styles.cardIcon}>🌾</Text>
              <Text style={styles.cardText}>{i18n.t('manageCrops')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Weather')}>
              <Text style={styles.cardIcon}>🌦</Text>
              <Text style={styles.cardText}>{i18n.t('weatherInfo')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Tips')}>
              <Text style={styles.cardIcon}>📋</Text>
              <Text style={styles.cardText}>{i18n.t('farmingTips')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Schemes')}>
              <Text style={styles.cardIcon}>🧾</Text>
              <Text style={styles.cardText}>{i18n.t('govSchemes')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Help')}>
              <Text style={styles.cardIcon}>📞</Text>
              <Text style={styles.cardText}>{i18n.t('helpCenter')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.card, styles.logoutButton]} onPress={handleLogout}>
              <Text style={styles.cardIcon}>🚪</Text>
              <Text style={styles.cardText}>{i18n.t('logout')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ...same as your latest HomeScreen styles...
  scrollContainer: { flexGrow: 1 },
  container: { padding: 20, backgroundColor: '#f0fdf4', minHeight: '100%', position: 'relative' },
  triToggleWrapper: { flexDirection: 'row', alignSelf: 'center', backgroundColor: '#e0e0e0', borderRadius: 30, marginBottom: 20, padding: 4, marginTop: 10 },
  toggleItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 25, marginHorizontal: 4 },
  toggleItemActive: { backgroundColor: '#ffffff', elevation: 3 },
  toggleText: { fontSize: 14, color: '#555' },
  toggleTextActive: { fontWeight: 'bold', color: '#2e7d32' },
  welcomeText: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', textAlign: 'center', marginBottom: 20, marginTop: 40, letterSpacing: 0.5 },
  image: { width: 120, height: 120, alignSelf: 'center', marginBottom: 24, borderRadius: 24, backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#43a047' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10 },
  card: { backgroundColor: '#ffffff', padding: 22, borderRadius: 16, marginBottom: 18, alignItems: 'center', width: '47%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginHorizontal: 2 },
  cardIcon: { fontSize: 36, marginBottom: 10, color: '#4caf50' },
  cardText: { fontSize: 17, fontWeight: '600', color: '#333', textAlign: 'center' },
  logoutButton: { backgroundColor: '#e74c3c', shadowColor: '#e74c3c' },
});