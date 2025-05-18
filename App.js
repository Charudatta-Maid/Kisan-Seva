import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { LanguageProvider } from './contexts/LanguageContext';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import ProfileScreen from './screens/ProfileScreen';
import HomeScreen from './screens/HomeScreen';
import CropsScreen from './screens/CropsScreen';
import WeatherScreen from './screens/WeatherScreen';
import TipsScreen from './screens/TipsScreen';
import HelpScreen from './screens/HelpScreen';
import SchemesScreen from './screens/SchemesScreen';
import { TouchableOpacity, Text, View, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const Stack = createStackNavigator();

// Center: Logo + App Name
function AppHeaderTitle() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Image
        source={require('./assets/farm.png')}
        style={{ width: 32, height: 32, marginRight: 8 }}
        resizeMode="contain"
      />
      <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#2e7d32' }}>
        Kisan Seva
      </Text>
    </View>
  );
}

// Left: Back Arrow + Screen Name (shows arrow except on Login)
function ScreenNameLeft({ name, canGoBack }) {
  const navigation = useNavigation();
  if (!canGoBack) {
    return (
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32', marginLeft: 16 }}>
        {name}
      </Text>
    );
  }
  return (
    <TouchableOpacity
      style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8 }}
      onPress={() => navigation.goBack()}
    >
      <Text style={{ fontSize: 22, color: '#2e7d32', marginRight: 4 }}>←</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#2e7d32' }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

// Right: Profile Photo for Home (updates after profile change)
function HomeHeaderRight() {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const [profilePicture, setProfilePicture] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const profileData = await AsyncStorage.getItem('profile');
      if (profileData) {
        const { profilePicture } = JSON.parse(profileData);
        setProfilePicture(profilePicture);
      } else {
        setProfilePicture(null);
      }
    };
    loadProfile();
  }, [isFocused]);

  return (
    <TouchableOpacity
      style={{
        marginRight: 16,
        padding: 4,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#43a047',
      }}
      onPress={() => navigation.navigate('Profile')}
      activeOpacity={0.8}
    >
      <Image
        source={
          profilePicture
            ? { uri: profilePicture }
            : require('./assets/prof.png')
        }
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: '#e0e0e0',
        }}
      />
    </TouchableOpacity>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Login" canGoBack={false} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Signup"
            component={SignupScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Signup" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Home" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerRight: () => <HomeHeaderRight />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Profile" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Crops"
            component={CropsScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Crops" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Weather"
            component={WeatherScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Weather" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Tips"
            component={TipsScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Tips" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Help"
            component={HelpScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Help" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
          <Stack.Screen
            name="Schemes"
            component={SchemesScreen}
            options={{
              headerLeft: () => <ScreenNameLeft name="Schemes" canGoBack={true} />,
              headerTitle: () => <AppHeaderTitle />,
              headerTitleAlign: 'center',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </LanguageProvider>
  );
}