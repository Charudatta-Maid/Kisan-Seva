// contexts/LanguageContext.js
import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLang = await AsyncStorage.getItem('appLanguage');
      if (savedLang) {
        i18n.changeLanguage(savedLang);
        setLanguage(savedLang);
      }
    };
    loadLanguage();
  }, []);

  const switchLanguage = async (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    await AsyncStorage.setItem('appLanguage', lng);
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
