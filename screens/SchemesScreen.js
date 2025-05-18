import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function SchemesScreen() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch schemes from Firestore
  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'schemes'));
      if (snap.empty) {
        // fallback to local if Firestore is empty
        setSchemes(localSchemes);
      } else {
        setSchemes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    } catch {
      setSchemes(localSchemes);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const openSchemeLink = (url) => {
    Linking.canOpenURL(url)
      .then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'यह लिंक नहीं खोला जा सकता');
        }
      })
      .catch(() => {
        Alert.alert('Error', 'कोई समस्या हुई');
      });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧾 सरकारी योजनाएं</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#1565c0" style={{ marginTop: 40 }} />
      ) : schemes.length === 0 ? (
        <Text style={styles.emptyText}>कोई योजना उपलब्ध नहीं है।</Text>
      ) : (
        <FlatList
          data={schemes}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSchemes(); }} />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => openSchemeLink(item.url)}
              activeOpacity={0.85}
            >
              <Text style={styles.schemeName}>{item.name}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

// Local fallback schemes (used if Firestore is empty or fails)
const localSchemes = [
  {
    id: '1',
    name: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    description: 'हर eligible किसान को ₹6000 प्रति वर्ष की आर्थिक सहायता।',
    url: 'https://pmkisan.gov.in',
  },
  {
    id: '2',
    name: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    description: 'फसल नुकसान पर बीमा सुरक्षा।',
    url: 'https://pmfby.gov.in',
  },
  {
    id: '3',
    name: 'कृषि यंत्र सब्सिडी योजना',
    description: 'कृषि उपकरणों पर सरकार से सब्सिडी।',
    url: 'https://agrimachinery.nic.in',
  },
  {
    id: '4',
    name: 'ई-नाम (eNAM)',
    description: 'किसानों के लिए एक unified online मंडी।',
    url: 'https://enam.gov.in',
  },
  {
    id: '5',
    name: 'राष्ट्रीय कृषि विकास योजना (RKVY)',
    description: 'राज्यों को कृषि क्षेत्र में समग्र विकास के लिए वित्तीय सहायता।',
    url: 'https://rkvy.nic.in/',
  },
  {
    id: '6',
    name: 'सीमांत और लघु कृषकों के लिए ऋण माफी योजना',
    description: 'लघु किसानों के लिए कर्ज माफी और राहत।',
    url: 'https://agricoop.nic.in/en/Marginal-Farmers-Relief',
  },
  {
    id: '7',
    name: 'कृषि बीमा पोर्टल',
    description: 'बीमा विवरण, दावे और farmer enrollment के लिए पोर्टल।',
    url: 'https://agri-insurance.gov.in/',
  },
  {
    id: '8',
    name: 'मृदा स्वास्थ्य कार्ड योजना',
    description: 'मिट्टी की गुणवत्ता के लिए कार्ड — सही उर्वरक सुझाव सहित।',
    url: 'https://soilhealth.dac.gov.in/',
  },
  {
    id: '9',
    name: 'राष्ट्रीय बागवानी मिशन',
    description: 'फल, सब्जी और फूलों की खेती को बढ़ावा देने के लिए योजना।',
    url: 'https://nhm.dac.gov.in/',
  },
  {
    id: '10',
    name: 'डेयरी उद्यमिता विकास योजना (DEDS)',
    description: 'डेयरी व्यवसाय शुरू करने के लिए अनुदान और सहायता।',
    url: 'https://nabard.org/content.aspx?id=572&catid=23',
  },
];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e3f2fd', padding: 16 },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#1565c0',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    borderLeftWidth: 6,
    borderLeftColor: '#1976d2',
  },
  schemeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 4,
  },
  description: {
    fontSize: 15,
    color: '#263238',
    marginBottom: 6,
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 30,
  },
});