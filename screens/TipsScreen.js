import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const farmingTips = [
  {
    title: 'मिट्टी की सेहत',
    description:
      'मिट्टी का नियमित परीक्षण करें और जैविक खाद का उपयोग करें ताकि मिट्टी की सेहत बनी रहे। फसल बदलने से मिट्टी में पोषक तत्वों का संतुलन रहता है।',
  },
  {
    title: 'सिंचाई (Irrigation)',
    description:
      'पानी की बचत के लिए ड्रिप सिंचाई का इस्तेमाल करें। बारिश के पानी को इकट्ठा करें और इससे सिंचाई करें।',
  },
  {
    title: 'कीट नियंत्रण',
    description:
      'कीटनाशकों के बजाय नीम के तेल और अन्य जैविक कीटनाशकों का इस्तेमाल करें। प्राकृतिक शिकारियों का उपयोग करें।',
  },
  {
    title: 'बीज का चयन',
    description:
      'हमेशा उच्च गुणवत्ता वाले बीज का चयन करें। स्थानीय प्रकार के बीजों का उपयोग करें, क्योंकि ये उस क्षेत्र की जलवायु के अनुकूल होते हैं।',
  },
  {
    title: 'उर्वरक (Fertilization)',
    description:
      'नाइट्रोजन, फास्फोरस और पोटाश का संतुलित उपयोग करें। जैविक खाद का उपयोग करके मिट्टी में पोषक तत्वों का स्तर बनाए रखें।',
  },
  {
    title: 'मौसम का ध्यान रखें',
    description:
      'कृषि कार्यों के लिए मौसम का ध्यान रखें और सही समय पर फसल की बुवाई और कटाई करें। जलवायु परिवर्तन के अनुसार खेती करें।',
  },
];

const FarmingTipsScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🌾 कृषि टिप्स</Text>

      {farmingTips.map((tip, index) => (
        <View key={index} style={styles.card}>
          <Text style={styles.tipTitle}>{tip.title}</Text>
          <Text style={styles.tipDescription}>{tip.description}</Text>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#0288d1',
  },
  card: {
    backgroundColor: '#bbdefb',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0d47a1',
    marginBottom: 8,
  },
  tipDescription: {
    fontSize: 14,
    color: '#1a237e',
  },
});

export default FarmingTipsScreen;
