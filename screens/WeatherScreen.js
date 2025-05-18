import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import * as Location from 'expo-location';

// --- Firebase imports for cloud alerts ---
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// OpenWeatherMap API key
const API_KEY = '457537c577335bfa01741272469648c6';

export default function WeatherScreen() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locationName, setLocationName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  // --- Cloud-based weather alerts state ---
  const [alerts, setAlerts] = useState([]);

  // Fetch weather alerts from Firestore (free, no billing)
  const fetchAlerts = useCallback(async () => {
    try {
      const snap = await getDocs(collection(db, 'alerts'));
      setAlerts(snap.docs.map(doc => doc.data()));
    } catch {
      setAlerts([]);
    }
  }, []);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Location permission denied.');
      setLoading(false);
      setRefreshing(false);
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = loc.coords;

    // Get city name from coordinates
    let city = '';
    try {
      let rev = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (rev && rev[0]) {
        city = rev[0].city || rev[0].district || rev[0].region || '';
        setLocationName(`${city}${rev[0].country ? ', ' + rev[0].country : ''}`);
      }
    } catch {
      setLocationName('Your Location');
    }

    try {
      // Current weather
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await res.json();
      setWeather(data);

      // 3-day forecast
      const res2 = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data2 = await res2.json();
      // Get next 3 days at 12:00
      const daily = [];
      const seen = {};
      data2.list.forEach(item => {
        const date = item.dt_txt.split(' ')[0];
        if (!seen[date] && item.dt_txt.includes('12:00:00')) {
          daily.push(item);
          seen[date] = true;
        }
      });
      setForecast(daily.slice(0, 3));
    } catch (e) {
      setWeather(null);
      setForecast([]);
      setErrorMsg('Unable to fetch weather data.');
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchWeather();
    fetchAlerts();
  }, [refreshCount]);

  const getWeatherIcon = (icon) => {
    switch (icon) {
      case '01d': return '🌞';
      case '01n': return '🌙';
      case '02d': case '02n': return '⛅';
      case '03d': case '03n': return '☁️';
      case '04d': case '04n': return '☁️';
      case '09d': case '09n': return '🌧️';
      case '10d': case '10n': return '🌦️';
      case '11d': case '11n': return '⛈️';
      case '13d': case '13n': return '❄️';
      case '50d': case '50n': return '🌫️';
      default: return '';
    }
  };

  // Filter alerts based on current weather
  const getValidAlerts = () => {
    if (!weather) return [];
    const main = weather.weather?.[0]?.main?.toLowerCase() || '';
    return alerts.filter(alert => {
      if (!alert.type) return true; // Always show if no type
      if (alert.type === 'rain' && main.includes('rain')) return true;
      if (alert.type === 'storm' && (main.includes('storm') || main.includes('thunder'))) return true;
      if (alert.type === 'heatwave' && weather.main?.temp > 38) return true;
      // Add more types as needed
      return false;
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshCount(c => c + 1);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />
      }
    >
      <Text style={styles.title}>🌦 Weather Updates</Text>
      {/* Cloud-based weather alerts (filtered by weather) */}
      {getValidAlerts().length > 0 && (
        <View style={{ marginBottom: 12 }}>
          {getValidAlerts().map((alert, idx) => (
            <Text key={idx} style={styles.alertBox}>
              ⚠️ {alert.message}
            </Text>
          ))}
        </View>
      )}
      {locationName ? (
        <Text style={styles.locationText}>📍 {locationName}</Text>
      ) : null}
      {loading ? (
        <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 40 }} />
      ) : errorMsg ? (
        <Text style={styles.errorMsg}>{errorMsg}</Text>
      ) : weather ? (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>
              Now: {weather.weather?.[0]?.main} {getWeatherIcon(weather.weather?.[0]?.icon)}
            </Text>
            <Text style={styles.bigTemp}>{weather.main?.temp}°C</Text>
            <Text style={styles.info}>Feels like: {weather.main?.feels_like}°C</Text>
            <Text style={styles.info}>Humidity: {weather.main?.humidity}%</Text>
            <Text style={styles.info}>Wind: {weather.wind?.speed} m/s</Text>
            <Text style={styles.info}>Pressure: {weather.main?.pressure} hPa</Text>
          </View>
          <Text style={styles.subtitle}>Next 3 Days Forecast</Text>
          {forecast.map((item, idx) => (
            <View style={styles.card} key={idx}>
              <Text style={styles.label}>
                {new Date(item.dt_txt).toLocaleDateString(undefined, { weekday: 'long' })}: {item.weather?.[0]?.main} {getWeatherIcon(item.weather?.[0]?.icon)}
              </Text>
              <Text style={styles.bigTemp}>{item.main?.temp}°C</Text>
              <Text style={styles.info}>Humidity: {item.main?.humidity}%</Text>
              <Text style={styles.info}>Rain Chance: {item.pop ? Math.round(item.pop * 100) : 0}%</Text>
            </View>
          ))}
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={onRefresh}
            accessibilityLabel="Refresh weather"
          >
            <Text style={styles.refreshText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.errorMsg}>Unable to fetch weather data.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#e3f2fd',
    minHeight: '100%',
  },
  title: {
    fontSize: 30,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
    color: '#1565c0',
    letterSpacing: 1.5,
    textShadowColor: '#90caf9',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 4,
  },
  alertBox: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
    borderLeftWidth: 5,
    borderLeftColor: '#ff9800',
    elevation: 2,
  },
  locationText: {
    textAlign: 'center',
    color: '#388e3c',
    fontSize: 18,
    marginBottom: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    backgroundColor: '#e8f5e9',
    padding: 8,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 140,
    elevation: 2,
  },
  subtitle: {
    fontSize: 20,
    color: '#1976d2',
    fontWeight: 'bold',
    marginTop: 22,
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.7,
  },
  card: {
    backgroundColor: '#fff',
    padding: 22,
    borderRadius: 18,
    marginBottom: 18,
    elevation: 5,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.13,
    shadowRadius: 8,
    alignItems: 'center',
    borderLeftWidth: 6,
    borderLeftColor: '#1976d2',
  },
  label: {
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: 8,
    color: '#1976d2',
    letterSpacing: 0.5,
  },
  bigTemp: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 8,
    textShadowColor: '#bbdefb',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  info: {
    fontSize: 16,
    color: '#333',
    marginBottom: 2,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  errorMsg: {
    color: '#d32f2f',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 17,
    fontWeight: 'bold',
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  refreshBtn: {
    backgroundColor: '#1976d2',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 36,
    alignSelf: 'center',
    width: 150,
    elevation: 3,
    shadowColor: '#1976d2',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 4,
  },
  refreshText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});