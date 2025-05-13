// screens/bank-accounts.tsx
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Swipeable } from 'react-native-gesture-handler';

export default function BankAccountsScreen() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [newAccount, setNewAccount] = useState({
        bankName: "",
        accountNumber: "",
        accountHolder: "",
        ifsc: "",
    });

    useEffect(() => {
        (async () => {
            const stored = await AsyncStorage.getItem("bankAccounts");
            if (stored) setAccounts(JSON.parse(stored));
        })();
    }, []);

    const saveAccounts = async (data: any[]) => {
        setAccounts(data);
        await AsyncStorage.setItem("bankAccounts", JSON.stringify(data));
    };

    const addAccount = () => {
        if (!newAccount.bankName || !newAccount.accountNumber) return;
        const updated = [...accounts, newAccount];
        saveAccounts(updated);
        setNewAccount({ bankName: "", accountNumber: "", accountHolder: "", ifsc: "" });
    };

    const removeAccount = (index: number) => {
        Alert.alert(
            "Remove Account",
            "Are you sure you want to remove this account?",
            [
                {
                    text: "No",
                    style: "cancel",
                },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: () => {
                        const updated = accounts.filter((_, i) => i !== index);
                        saveAccounts(updated);
                    },
                },
            ]
        );
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.back} onPress={() => router.back()}>
                <Ionicons name="arrow-back" size={24} color="black" />
            </TouchableOpacity>

            <Text style={styles.header}>Bank Accounts</Text>

            {accounts.map((acc, index) => (
                <Swipeable
                    key={index}
                    renderRightActions={() => (
                        <TouchableOpacity
                            style={styles.swipeDeleteBtn}
                            onPress={() => removeAccount(index)}
                        >
                            <Ionicons name="trash" size={26} color="white" />
                            <Text style={styles.swipeDeleteText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                >
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                'Link Bank Account',
                                'Do you want to link this bank account?',
                                [
                                    { text: 'No', style: 'cancel' },
                                    {
                                        text: 'Yes',
                                        onPress: async () => {
                                            await AsyncStorage.setItem('linkedBankAccount', JSON.stringify(acc));
                                            Alert.alert('Success', 'Bank account linked successfully!');
                                        },
                                    },
                                ]
                            );
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={styles.card}>
                            <Text style={styles.label}>Bank: {acc.bankName}</Text>
                            <Text style={styles.label}>Account No: {acc.accountNumber}</Text>
                            <Text style={styles.label}>Holder: {acc.accountHolder}</Text>
                            <Text style={styles.label}>IFSC: {acc.ifsc}</Text>
                        </View>
                    </TouchableOpacity>
                </Swipeable>
            ))}

            <Text style={styles.subHeader}>Add New Account</Text>
            {(Object.keys(newAccount) as (keyof typeof newAccount)[]).map((key) => (
                <TextInput
                    key={key}
                    placeholder={key.replace(/([A-Z])/g, " $1")}
                    style={styles.input}
                    value={newAccount[key]}
                    onChangeText={(text) =>
                        setNewAccount((prev) => ({ ...prev, [key]: text }))
                    }
                />
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={addAccount}>
                <Text style={styles.addText}>Add Account</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20, paddingTop: 50, backgroundColor: "#fff", flexGrow: 1 },
    back: { position: "absolute", top: 50, left: 20 },
    header: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
    subHeader: { fontSize: 18, fontWeight: "bold", marginVertical: 15 },
    card: {
        padding: 15,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        marginBottom: 12,
        backgroundColor: "#f9f9f9",
        position: "relative",
    },
    swipeDeleteBtn: {
        backgroundColor: '#D9534F',
        justifyContent: 'center',
        alignItems: 'center',
        width: 100,
        height: '90%',
        marginVertical: 8,
        borderRadius: 10,
        flexDirection: 'column',
    },
    swipeDeleteText: {
        color: 'white',
        fontWeight: 'bold',
        marginTop: 4,
        fontSize: 15,
    },
    label: { fontSize: 14, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginBottom: 10,
    },
    addBtn: {
        backgroundColor: "#6CC551",
        padding: 14,
        alignItems: "center",
        borderRadius: 8,
    },
    addText: { color: "white", fontSize: 16, fontWeight: "bold" },
});
