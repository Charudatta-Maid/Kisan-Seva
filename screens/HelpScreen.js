import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';

// HelpFaQs
const faqs = [
  {
    question: 'कैसे फसल की बुवाई शुरू करें?',
    answer: 'आपको पहले उचित बीज का चयन करना चाहिए, फिर खेत की तैयारी करनी चाहिए, और अंत में बुवाई करनी चाहिए। बुवाई के लिए सही समय का चयन करें।',
  },
  {
    question: 'कीटनाशक का उपयोग कैसे करें?',
    answer: 'प्राकृतिक कीटनाशकों का उपयोग करें जैसे नीम का तेल और तंबाकू का अर्क। रासायनिक कीटनाशकों का प्रयोग बहुत कम करें और प्राकृतिक उपायों को प्राथमिकता दें।',
  },
  {
    question: 'फसल में पानी की कितनी आवश्यकता होती है?',
    answer: 'विभिन्न फसलों को अलग-अलग मात्रा में पानी की आवश्यकता होती है। सिंचाई के लिए ड्रिप सिस्टम का उपयोग करें ताकि पानी की बचत हो सके।',
  },
];

// Contact us
const contactInfo = {
  phone: '1800-123-4567',
  email: 'support@kisanseva.com',
  website: 'www.kisanseva.com',
};

const HelpCenterScreen = () => {
  
  const handleFAQPress = (answer) => {
    Alert.alert('उत्तर', answer); // FAQ पर क्लिक करने पर उत्तर दिखाने के लिए
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🆘 हेल्प सेंटर</Text>

      {/* FAQs Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>❓ सामान्य प्रश्न (FAQs)</Text>
        {faqs.map((faq, index) => (
          <TouchableOpacity
            key={index}
            style={styles.faqItem}
            onPress={() => handleFAQPress(faq.answer)} // FAQ पर क्लिक करने पर उत्तर दिखाना
          >
            <Text style={styles.faqQuestion}>{faq.question}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Contact Us Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📞 संपर्क करें</Text>
        <Text style={styles.contactInfo}>फोन: {contactInfo.phone}</Text>
        <Text style={styles.contactInfo}>ईमेल: {contactInfo.email}</Text>
        <Text style={styles.contactInfo}>वेबसाइट: {contactInfo.website}</Text>
      </View>

      {/* Troubleshooting Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔧 ट्रबलशूटिंग</Text>
        <Text style={styles.troubleshootText}>
          यदि आपको ऐप में कोई समस्या आ रही है, तो कृपया ऐप को रीस्टार्ट करें। अगर समस्या बनी रहती है, तो हमें संपर्क करें।
        </Text>
      </View>

      {/* General Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ℹ️ सामान्य जानकारी</Text>
        <Text style={styles.generalInfo}>
          इस ऐप में कृषि से संबंधित सभी जानकारी दी जाती है। आप मौसम, फसल, और कृषि योजनाओं के बारे में जानकारी पा सकते हैं।
        </Text>
      </View>
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
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1565c0',
  },
  faqItem: {
    backgroundColor: '#bbdefb',
    padding: 16,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0d47a1',
  },
  contactInfo: {
    fontSize: 16,
    color: '#0d47a1',
    marginBottom: 6,
  },
  troubleshootText: {
    fontSize: 14,
    color: '#1a237e',
  },
  generalInfo: {
    fontSize: 14,
    color: '#1a237e',
  },
});

export default HelpCenterScreen;
