import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

export default function AddBankAccountScreen() {
    const router = useRouter();
    const [accountHolder, setAccountHolder] = useState("");
    const [accountNumber, setAccountNumber] = useState("");
    const [selectedBank, setSelectedBank] = useState("");
    const nepaliBanks = [
        "Nabil Bank",
        "NIC Asia Bank",
        "Global IME Bank",
        "Nepal Investment Bank",
        "Himalayan Bank",
        "Prabhu Bank",
        "Siddhartha Bank",
        "Kumari Bank",
        "Machhapuchchhre Bank",
        "NMB Bank",
        "Sanima Bank",
        "Citizens Bank",
        "Sunrise Bank",
        "Laxmi Sunrise Bank",
        "Everest Bank",
        "Other"
    ];

    const handleSave = async () => {
        if (!selectedBank) {
            Alert.alert("Error", "Please select a bank");
            return;
        }
        if (!accountHolder.trim() || !accountNumber.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        try {
            // Get existing accounts
            const existingAccounts = await AsyncStorage.getItem("bankAccounts");
            const accounts = existingAccounts ? JSON.parse(existingAccounts) : [];

            // Add new account
            const newAccount = {
                bankName: selectedBank,
                accountHolder: accountHolder.trim(),
                accountNumber: accountNumber.trim(),
                dateAdded: new Date().toISOString(),
            };

            // Save updated accounts
            await AsyncStorage.setItem("bankAccounts", JSON.stringify([...accounts, newAccount]));
            
            Alert.alert("Success", "Bank account added successfully", [
                {
                    text: "OK",
                    onPress: () => router.back()
                }
            ]);
        } catch (error) {
            console.error("Error saving bank account:", error);
            Alert.alert("Error", "Failed to save bank account");
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={26} color="black" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Bank Account</Text>
                <View style={{ width: 26 }} />
            </View>

            <View style={styles.form}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Select Bank</Text>
                    <View style={{ borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9' }}>
                        <Picker
                            selectedValue={selectedBank}
                            onValueChange={(itemValue) => setSelectedBank(itemValue)}
                        >
                            <Picker.Item label="Select a bank..." value="" />
                            {nepaliBanks.map((bank) => (
                                <Picker.Item key={bank} label={bank} value={bank} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Holder Name</Text>
                    <TextInput
                        style={styles.input}
                        value={accountHolder}
                        onChangeText={setAccountHolder}
                        placeholder="Enter account holder name"
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Account Number</Text>
                    <TextInput
                        style={styles.input}
                        value={accountNumber}
                        onChangeText={setAccountNumber}
                        placeholder="Enter account number"
                        placeholderTextColor="#666"
                        keyboardType="numeric"
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity 
                        style={[styles.button, styles.cancelButton]} 
                        onPress={() => router.back()}
                    >
                        <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, styles.saveButton]} 
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        backgroundColor: "#97B77B",
        paddingTop: 60,
        paddingBottom: 20,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
        color: "black",
    },
    form: {
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
    button: {
        flex: 1,
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
        marginHorizontal: 5,
    },
    cancelButton: {
        backgroundColor: "#FFBABA",
    },
    saveButton: {
        backgroundColor: "#7A9E7E",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});
