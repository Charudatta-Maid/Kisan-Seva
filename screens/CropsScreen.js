import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet,
  Alert, Modal, Image, ScrollView, Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { db } from '../firebase';
import {
  collection, addDoc, onSnapshot, updateDoc, doc, deleteDoc
} from 'firebase/firestore';

const commonCrops = [
  "Wheat", "Rice", "Maize", "Barley", "Sugarcane", "Cotton", "Soybean", "Potato", "Tomato", "Onion", "Mustard", "Groundnut",
  "Chickpea", "Pea", "Lentil", "Jowar", "Bajra", "Sunflower", "Pigeon Pea", "Sesame", "Cabbage", "Cauliflower", "Carrot", "Spinach",
  "Garlic", "Ginger", "Turmeric", "Brinjal", "Okra", "Pumpkin", "Radish", "Turnip", "Sweet Potato", "Apple", "Banana", "Mango",
  "Papaya", "Guava", "Grapes", "Orange", "Lemon", "Pomegranate", "Watermelon", "Muskmelon", "Peach", "Pear", "Plum", "Strawberry"
];

const commonSeasons = [
  "Rabi", "Kharif", "Zaid", "Summer", "Winter", "Monsoon"
];

const commonFertilizers = [
  "Urea", "DAP", "MOP", "Compost", "Vermicompost", "NPK", "Cow Manure", "Green Manure"
];

const commonPesticides = [
  "Neem Oil", "Chlorpyrifos", "Imidacloprid", "Malathion", "Carbaryl", "Bordeaux Mixture"
];

const ManageCropsScreen = () => {
  const [cropName, setCropName] = useState('');
  const [notes, setNotes] = useState('');
  const [season, setSeason] = useState('');
  const [area, setArea] = useState('');
  const [variety, setVariety] = useState('');
  const [sowingDate, setSowingDate] = useState('');
  const [harvestDate, setHarvestDate] = useState('');
  const [fertilizer, setFertilizer] = useState('');
  const [pesticide, setPesticide] = useState('');
  const [expectedYield, setExpectedYield] = useState('');
  const [marketPrice, setMarketPrice] = useState('');
  const [cropList, setCropList] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCropId, setSelectedCropId] = useState(null);
  const [expenseAmount, setExpenseAmount] = useState('');
  const [billImage, setBillImage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [incomeAmount, setIncomeAmount] = useState('');
  const [activeCrop, setActiveCrop] = useState(null);
  const [view, setView] = useState('list');

  // Real-time Firestore listener for crops
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "crops"), (snapshot) => {
      const crops = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCropList(crops);
    });
    return unsubscribe;
  }, []);

  const addCrop = async () => {
    if (!cropName.trim()) {
      Alert.alert('Please enter crop name');
      return;
    }
    await addDoc(collection(db, "crops"), {
      name: cropName,
      notes,
      season,
      area,
      variety,
      sowingDate,
      harvestDate,
      fertilizer,
      pesticide,
      expectedYield,
      marketPrice,
      expenses: [],
      income: 0,
    });
    setCropName('');
    setNotes('');
    setSeason('');
    setArea('');
    setVariety('');
    setSowingDate('');
    setHarvestDate('');
    setFertilizer('');
    setPesticide('');
    setExpectedYield('');
    setMarketPrice('');
  };

  const removeCrop = (id) => {
    Alert.alert('Delete Crop?', 'Are you sure you want to delete this crop?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await deleteDoc(doc(db, "crops", id));
          if (activeCrop?.id === id) {
            setActiveCrop(null);
            setView('list');
          }
        }
      }
    ]);
  };

  const openExpenseModal = (cropId, index = null) => {
    setSelectedCropId(cropId);
    setExpenseAmount('');
    setIncomeAmount('');
    setBillImage(null);
    setIsEditing(index !== null);
    setEditingExpenseIndex(index);
    if (index !== null) {
      const expense = cropList.find(c => c.id === cropId)?.expenses[index];
      if (expense) {
        setExpenseAmount(expense.amount.toString());
        setBillImage(expense.bill);
      }
    }
    setModalVisible(true);
  };

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled && result.assets?.[0]) {
      setBillImage(result.assets[0].uri);
    }
  };

  // Save expense/income to Firestore
  const saveTransaction = async () => {
    const crop = cropList.find(c => c.id === selectedCropId);
    if (!crop) return;

    let updatedExpenses = [...(crop.expenses || [])];
    if (isEditing && editingExpenseIndex !== null) {
      updatedExpenses[editingExpenseIndex] = {
        ...updatedExpenses[editingExpenseIndex],
        amount: parseFloat(expenseAmount),
        bill: billImage,
      };
    } else if (expenseAmount) {
      updatedExpenses.push({
        id: Date.now().toString(),
        amount: parseFloat(expenseAmount),
        bill: billImage,
      });
    }

    const newIncome = crop.income + (parseFloat(incomeAmount) || 0);

    await updateDoc(doc(db, "crops", selectedCropId), {
      expenses: updatedExpenses,
      income: newIncome,
    });

    setModalVisible(false);
    setIsEditing(false);
    setEditingExpenseIndex(null);
  };

  // Delete expense from Firestore
  const deleteExpense = async (cropId, index) => {
    const crop = cropList.find(c => c.id === cropId);
    if (!crop) return;
    const updated = [...crop.expenses];
    updated.splice(index, 1);
    await updateDoc(doc(db, "crops", cropId), {
      expenses: updated,
    });
  };

  // PDF export function
  const exportCropReportPDF = async (crop) => {
    let expensesHtml = '';
    if (crop.expenses && crop.expenses.length > 0) {
      expensesHtml = crop.expenses.map((exp, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>₹${exp.amount.toFixed(2)}</td>
          <td>${exp.bill ? `<img src="${exp.bill}" width="80" />` : 'N/A'}</td>
        </tr>
      `).join('');
    } else {
      expensesHtml = `<tr><td colspan="3">No Expenses</td></tr>`;
    }

    const html = `
      <html>
        <body>
          <h2 style="color:#2e7d32;">Crop Report - ${crop.name}</h2>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
            <tr><td><b>Notes</b></td><td>${crop.notes || 'N/A'}</td></tr>
            <tr><td><b>Season</b></td><td>${crop.season || 'N/A'}</td></tr>
            <tr><td><b>Area</b></td><td>${crop.area || 'N/A'}</td></tr>
            <tr><td><b>Variety</b></td><td>${crop.variety || 'N/A'}</td></tr>
            <tr><td><b>Sowing Date</b></td><td>${crop.sowingDate || 'N/A'}</td></tr>
            <tr><td><b>Harvest Date</b></td><td>${crop.harvestDate || 'N/A'}</td></tr>
            <tr><td><b>Fertilizer</b></td><td>${crop.fertilizer || 'N/A'}</td></tr>
            <tr><td><b>Pesticide</b></td><td>${crop.pesticide || 'N/A'}</td></tr>
            <tr><td><b>Expected Yield</b></td><td>${crop.expectedYield || 'N/A'}</td></tr>
            <tr><td><b>Market Price</b></td><td>${crop.marketPrice || 'N/A'}</td></tr>
            <tr><td><b>Income</b></td><td>₹${crop.income?.toFixed(2) || '0.00'}</td></tr>
          </table>
          <h3 style="color:#388e3c;">Expenses & Bills</h3>
          <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;">
            <tr>
              <th>#</th>
              <th>Amount</th>
              <th>Bill</th>
            </tr>
            ${expensesHtml}
          </table>
        </body>
      </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Share Crop Report PDF' });
  };

  const renderDetails = () => {
    const totalExpenses = activeCrop.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
    const profit = activeCrop.income - totalExpenses;

    return (
      <View>
        <Text style={styles.title}>{activeCrop.name}</Text>
        <Text style={styles.metricText}>Notes: {activeCrop.notes || 'N/A'}</Text>
        <Text style={styles.metricText}>Season: {activeCrop.season || 'N/A'}</Text>
        <Text style={styles.metricText}>Area: {activeCrop.area || 'N/A'}</Text>
        <Text style={styles.metricText}>Variety: {activeCrop.variety || 'N/A'}</Text>
        <Text style={styles.metricText}>Sowing Date: {activeCrop.sowingDate || 'N/A'}</Text>
        <Text style={styles.metricText}>Harvest Date: {activeCrop.harvestDate || 'N/A'}</Text>
        <Text style={styles.metricText}>Fertilizer: {activeCrop.fertilizer || 'N/A'}</Text>
        <Text style={styles.metricText}>Pesticide: {activeCrop.pesticide || 'N/A'}</Text>
        <Text style={styles.metricText}>Expected Yield: {activeCrop.expectedYield || 'N/A'}</Text>
        <Text style={styles.metricText}>Market Price: {activeCrop.marketPrice || 'N/A'}</Text>
        <Text style={styles.metricText}>Income: ₹{activeCrop.income?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.metricText}>Expenses: ₹{totalExpenses.toFixed(2)}</Text>
        <Text style={styles.metricText}>{profit >= 0 ? 'Profit' : 'Loss'}: ₹{profit.toFixed(2)}</Text>

        <Text style={[styles.metricText, { marginTop: 10, fontWeight: 'bold' }]}>Expenses:</Text>
        {activeCrop.expenses?.map((exp, idx) => (
          <View key={idx} style={styles.expenseItem}>
            <Text>₹{exp.amount.toFixed(2)}</Text>
            {exp.bill && <Image source={{ uri: exp.bill }} style={styles.billThumb} />}
            <TouchableOpacity onPress={() => openExpenseModal(activeCrop.id, idx)}>
              <Text style={styles.editText}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => deleteExpense(activeCrop.id, idx)}>
              <Text style={styles.editText}>❌</Text>
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#1976d2' }]} onPress={() => exportCropReportPDF(activeCrop)}>
          <Text style={styles.addButtonText}>📄 Export PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addButton} onPress={() => setView('list')}>
          <Text style={styles.addButtonText}>🔙 Back</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSuggestions = (input, suggestions, setValue) => {
    if (!input) return null;
    const filtered = suggestions.filter(item =>
      item.toLowerCase().includes(input.toLowerCase())
    ).slice(0, 5);
    if (filtered.length === 0) return null;
    return (
      <View style={styles.suggestionBox}>
        {filtered.map((suggestion) => (
          <TouchableOpacity
            key={suggestion}
            onPress={() => setValue(suggestion)}
            style={styles.suggestionItem}
          >
            <Text style={styles.suggestionText}>{suggestion}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderCrop = ({ item }) => {
    const expenses = item.expenses || [];
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const profit = item.income - total;

    return (
      <View style={styles.cropCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cropName}>{item.name}</Text>
          <TouchableOpacity onPress={() => removeCrop(item.id)}>
            <Text style={styles.deleteIcon}>❌</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.metricText}>Notes: {item.notes || 'None'}</Text>
        <Text style={styles.metricText}>Season: {item.season || 'N/A'}</Text>
        <Text style={styles.metricText}>Area: {item.area || 'N/A'}</Text>
        <Text style={styles.metricText}>Variety: {item.variety || 'N/A'}</Text>
        <Text style={styles.metricText}>Sowing Date: {item.sowingDate || 'N/A'}</Text>
        <Text style={styles.metricText}>Harvest Date: {item.harvestDate || 'N/A'}</Text>
        <Text style={styles.metricText}>Fertilizer: {item.fertilizer || 'N/A'}</Text>
        <Text style={styles.metricText}>Pesticide: {item.pesticide || 'N/A'}</Text>
        <Text style={styles.metricText}>Expected Yield: {item.expectedYield || 'N/A'}</Text>
        <Text style={styles.metricText}>Market Price: {item.marketPrice || 'N/A'}</Text>
        <Text style={styles.metricText}>💰 Income: ₹{item.income?.toFixed(2) || '0.00'}</Text>
        <Text style={styles.metricText}>💸 Expenses: ₹{total.toFixed(2)}</Text>
        <Text style={styles.metricText}>{profit >= 0 ? '📈 Profit' : '📉 Loss'}: ₹{profit.toFixed(2)}</Text>

        <TouchableOpacity style={styles.weatherButton} onPress={() => Linking.openURL('https://www.accuweather.com/')}>
          <Text style={styles.weatherText}>🌦 Check Weather</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity style={styles.addExpenseButton} onPress={() => openExpenseModal(item.id)}>
            <Text style={styles.addExpenseText}>➕ Entry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addExpenseButton} onPress={() => { setActiveCrop(item); setView('details'); }}>
            <Text style={styles.addExpenseText}>📊 View</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#1976d2', marginTop: 8 }]}
          onPress={() => exportCropReportPDF(item)}
        >
          <Text style={styles.addButtonText}>📄 Export PDF</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Manage Crops</Text>
      {/* FORM CARD START */}
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Add New Crop</Text>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Crop Name *"
            value={cropName}
            onChangeText={text => setCropName(text)}
          />
          {renderSuggestions(cropName, commonCrops, setCropName)}
        </View>
        <TextInput style={styles.input} placeholder="Notes" value={notes} onChangeText={setNotes} />
        <View>
          <TextInput
            style={styles.input}
            placeholder="Season (e.g. Rabi/Kharif)"
            value={season}
            onChangeText={setSeason}
          />
          {renderSuggestions(season, commonSeasons, setSeason)}
        </View>
        <TextInput style={styles.input} placeholder="Area (acre/hectare)" value={area} onChangeText={setArea} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Crop Variety" value={variety} onChangeText={setVariety} />
        <TextInput style={styles.input} placeholder="Sowing Date (DD/MM/YYYY)" value={sowingDate} onChangeText={setSowingDate} />
        <TextInput style={styles.input} placeholder="Harvest Date (DD/MM/YYYY)" value={harvestDate} onChangeText={setHarvestDate} />
        <View>
          <TextInput
            style={styles.input}
            placeholder="Fertilizer Used"
            value={fertilizer}
            onChangeText={setFertilizer}
          />
          {renderSuggestions(fertilizer, commonFertilizers, setFertilizer)}
        </View>
        <View>
          <TextInput
            style={styles.input}
            placeholder="Pesticide Used"
            value={pesticide}
            onChangeText={setPesticide}
          />
          {renderSuggestions(pesticide, commonPesticides, setPesticide)}
        </View>
        <TextInput style={styles.input} placeholder="Expected Yield (kg/acre)" value={expectedYield} onChangeText={setExpectedYield} keyboardType="numeric" />
        <TextInput style={styles.input} placeholder="Market Price (₹/kg)" value={marketPrice} onChangeText={setMarketPrice} keyboardType="numeric" />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <TouchableOpacity style={[styles.addButton, { flex: 1, marginRight: 5 }]} onPress={addCrop}>
            <Text style={styles.addButtonText}>Add Crop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#d32f2f', flex: 1, marginLeft: 5 }]}
            onPress={() => {
              setCropName('');
              setNotes('');
              setSeason('');
              setArea('');
              setVariety('');
              setSowingDate('');
              setHarvestDate('');
              setFertilizer('');
              setPesticide('');
              setExpectedYield('');
              setMarketPrice('');
            }}
          >
            <Text style={styles.addButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>
      </View>
      {/* FORM CARD END */}

      {view === 'details' && activeCrop ? (
        renderDetails()
      ) : (
        <FlatList
          data={cropList}
          keyExtractor={(item) => item.id}
          renderItem={renderCrop}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Expense' : 'Add Transaction'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Income (optional)"
              keyboardType="numeric"
              value={incomeAmount}
              onChangeText={setIncomeAmount}
            />
            <TextInput
              style={styles.input}
              placeholder="Expense (optional)"
              keyboardType="numeric"
              value={expenseAmount}
              onChangeText={setExpenseAmount}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleImagePick}>
              <Text style={styles.addButtonText}>Upload Bill</Text>
            </TouchableOpacity>
            {billImage && <Image source={{ uri: billImage }} style={styles.billThumb} />}
            <TouchableOpacity style={styles.addButton} onPress={saveTransaction}>
              <Text style={styles.addButtonText}>{isEditing ? 'Update' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f4fff8',
    flexGrow: 1,
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1b5e20',
    marginBottom: 8,
    letterSpacing: 1,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: '#b2dfdb',
    borderWidth: 1,
    fontSize: 16,
  },
  suggestionBox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderColor: '#b2dfdb',
    borderWidth: 1,
    marginBottom: 8,
    marginTop: -8,
    zIndex: 10,
    elevation: 3,
  },
  suggestionItem: {
    padding: 12,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  suggestionText: {
    color: '#388e3c',
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#43a047',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
    elevation: 2,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 0.5,
  },
  cropCard: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 14,
    marginBottom: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    alignItems: 'center',
  },
  cropName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2e7d32',
    letterSpacing: 0.5,
  },
  deleteIcon: {
    fontSize: 20,
    color: '#d32f2f',
    padding: 4,
  },
  metricText: {
    color: '#388e3c',
    marginBottom: 3,
    fontSize: 15,
  },
  weatherButton: {
    backgroundColor: '#b2dfdb',
    padding: 8,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
    elevation: 1,
  },
  weatherText: {
    textAlign: 'center',
    color: '#00695c',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addExpenseButton: {
    flex: 1,
    backgroundColor: '#66bb6a',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
    marginHorizontal: 2,
    elevation: 1,
  },
  addExpenseText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 24,
    width: '92%',
    borderRadius: 16,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 14,
    color: '#2e7d32',
  },
  closeModal: {
    textAlign: 'center',
    color: '#d32f2f',
    marginTop: 14,
    fontWeight: 'bold',
    fontSize: 16,
  },
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 5,
    backgroundColor: '#f1f8e9',
    borderRadius: 6,
    padding: 6,
  },
  editText: {
    fontSize: 18,
    color: '#388e3c',
    marginHorizontal: 2,
  },
  billThumb: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    marginHorizontal: 2,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 22,
    marginBottom: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.13,
    shadowRadius: 6,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default ManageCropsScreen;