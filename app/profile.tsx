import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    ScrollView,
    Dimensions,
    Alert,
} from "react-native";
import {
    Ionicons,
    MaterialCommunityIcons,
    FontAwesome5,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Swipeable } from 'react-native-gesture-handler';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
    const router = useRouter();
    const [userInfo, setUserInfo] = useState({
        name: "",
        email: "",
        userId: "",
    });
    const [bankAccounts, setBankAccounts] = useState<any[]>([]);
    const [linkedAccount, setLinkedAccount] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem("user");
            if (storedUser) {
                const parsed = JSON.parse(storedUser);
                // Generate a random 5-digit number and combine with "24" prefix
                const randomNum = Math.floor(10000 + Math.random() * 90000);
                const userId = `24${randomNum}`;
                
                // Update the user info in AsyncStorage with the new ID if it doesn't exist
                if (!parsed._id) {
                    const updatedUser = { ...parsed, _id: userId };
                    await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
                }

                setUserInfo({
                    name: parsed.name || "",
                    email: parsed.email || "",
                    userId: parsed._id || userId,
                });
            }

            // Load bank accounts
            const storedAccounts = await AsyncStorage.getItem("bankAccounts");
            if (storedAccounts) {
                setBankAccounts(JSON.parse(storedAccounts));
            }
        };

        loadUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            const fetchLinkedAccount = async () => {
                const linked = await AsyncStorage.getItem('linkedBankAccount');
                if (linked) setLinkedAccount(JSON.parse(linked));
                else setLinkedAccount(null);
            };
            fetchLinkedAccount();
        }, [])
    );

    const handleRemoveAccount = (index: number) => {
        Alert.alert(
            "Remove Account",
            "Are you sure you want to remove this account?",
            [
                { text: "No", style: "cancel" },
                {
                    text: "Yes",
                    style: "destructive",
                    onPress: async () => {
                        const updated = bankAccounts.filter((_, i) => i !== index);
                        setBankAccounts(updated);
                        await AsyncStorage.setItem("bankAccounts", JSON.stringify(updated));
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            {/* Header Section */}
            <View style={styles.header}>
                <Image
                    source={require("../assets/images/user.png")}
                    style={styles.avatar}
                    resizeMode="cover"
                />
                <View>
                    <Text style={styles.name}>{userInfo.name}</Text>
                    <Text style={styles.userId}>ID: {userInfo.userId}</Text>
                    <Text style={styles.userId}>Email: {userInfo.email}</Text>
                </View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Bank Accounts</Text>
                    {linkedAccount && (
                        <View style={[styles.bankAccountCard, { borderColor: '#6CC551', borderWidth: 2 }]}> 
                            <Text style={[styles.accountHolder, { color: '#6CC551' }]}>Linked Account</Text>
                            <Text style={styles.accountHolder}>{linkedAccount.accountHolder}</Text>
                            <Text style={styles.accountNumber}>****{linkedAccount.accountNumber?.slice(-4)}</Text>
                        </View>
                    )}
                    {bankAccounts.map((account, index) => (
                        <Swipeable
                            key={index}
                            renderRightActions={() => (
                                <TouchableOpacity
                                    style={styles.swipeDeleteBtn}
                                    onPress={() => handleRemoveAccount(index)}
                                >
                                    <Ionicons name="trash" size={26} color="white" />
                                    <Text style={styles.swipeDeleteText}>Remove</Text>
                                </TouchableOpacity>
                            )}
                        >
                            <View style={styles.bankAccountCard}>
                                <Text style={styles.accountHolder}>{account.accountHolder}</Text>
                                <Text style={styles.accountNumber}>****{account.accountNumber.slice(-4)}</Text>
                            </View>
                        </Swipeable>
                    ))}
                    <TouchableOpacity 
                        style={styles.addAccountButton}
                        onPress={() => router.push("/add-bank-account")}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#7A9E7E" />
                        <Text style={styles.addAccountText}>Add Bank Account</Text>
                    </TouchableOpacity>
                </View>

                {/* Settings Options */}
                <ScrollView style={styles.cardContainer}>
                    <Option
                        icon="settings-outline"
                        label="Settings"
                        onPress={() => router.push("/settings")}
                    />
                    <Option
                        icon="person-outline"
                        label="Profile"
                        onPress={() => router.push("/profile-detail")}
                    />
                    <Option
                        icon="information-outline"
                        label="Information Sector"
                        onPress={() => { }}
                    />
                    <Option
                        icon="file-pdf-box"
                        label="Export PDF"
                        onPress={() => { }}
                        iconLib="MaterialCommunityIcons"
                    />
                </ScrollView>
            </ScrollView>

            {/* Bottom Nav */}
            <View style={styles.bottomNav}>
                <TouchableOpacity onPress={() => router.push("/records")} style={styles.navItem}>
                    <Image 
                        source={require("../assets/icons/records.png")} 
                        style={[styles.navIcon, { tintColor: "#000" }]} 
                    />
                    <Text style={styles.navLabel}>Records</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/charts")} style={styles.navItem}>
                    <Image 
                        source={require("../assets/icons/charts.png")} 
                        style={[styles.navIcon, { tintColor: "#000" }]} 
                    />
                    <Text style={styles.navLabel}>Charts</Text>
                </TouchableOpacity>
                <View style={{ width: 70 }} />
                <TouchableOpacity onPress={() => router.push("/reports")} style={styles.navItem}>
                    <Image 
                        source={require("../assets/icons/reports.png")} 
                        style={[styles.navIcon, { tintColor: "#000" }]} 
                    />
                    <Text style={styles.navLabel}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push("/profile")} style={styles.navItem}>
                    <Ionicons name="person-outline" size={26} color="#87B56C" />
                    <Text style={[styles.navLabel, { color: "#87B56C" }]}>Me</Text>
                </TouchableOpacity>
            </View>

            {/* Add Button */}
            <TouchableOpacity style={[styles.addButton, { left: width / 2 - 35 }]} onPress={() => router.push("/addExpense")}>
                <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
        </View>
    );
}

const Option = ({ icon, label, onPress, iconLib = "Ionicons" }: any) => {
    const IconLib =
        iconLib === "MaterialCommunityIcons"
            ? MaterialCommunityIcons
            : iconLib === "FontAwesome5"
                ? FontAwesome5
                : Ionicons;

    return (
        <TouchableOpacity style={styles.optionRow} onPress={onPress}>
            <View style={styles.optionLeft}>
                <IconLib
                    name={icon}
                    size={20}
                    color="#6CC551"
                    style={{ marginRight: 10 }}
                />
                <Text style={styles.optionText}>{label}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderColor: "#eee",
        backgroundColor: "#f9f9f9",
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        marginRight: 15,
    },
    name: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    userId: {
        fontSize: 14,
        color: "#666",
    },
    content: {
        flex: 1,
    },
    section: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
        color: "#333",
    },
    bankAccountCard: {
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },
    accountHolder: {
        fontSize: 16,
        fontWeight: "600",
        color: "#333",
        marginBottom: 5,
    },
    accountNumber: {
        fontSize: 14,
        color: "#666",
    },
    addAccountButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderWidth: 1,
        borderColor: "#7A9E7E",
        borderRadius: 8,
        marginTop: 10,
    },
    addAccountText: {
        color: "#7A9E7E",
        fontSize: 16,
        fontWeight: "600",
        marginLeft: 8,
    },
    cardContainer: {
        flex: 1,
        paddingHorizontal: 20,
    },
    optionRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#eee",
    },
    optionLeft: {
        flexDirection: "row",
        alignItems: "center",
    },
    optionText: {
        fontSize: 16,
        color: "#333",
    },
    bottomNav: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingTop: 8,
        paddingBottom: 12,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        backgroundColor: "#fff",
    },
    navItem: {
        flex: 1,
        alignItems: "center",
    },
    navIcon: {
        width: 24,
        height: 24,
        marginBottom: 2,
    },
    navLabel: {
        fontSize: 12,
        color: "#333",
    },
    addButton: {
        position: "absolute",
        bottom: 20,
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: "#7A9E7E",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.2)",
        elevation: 4,
    },
    addButtonText: { 
        fontSize: 34, 
        color: "white" 
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
});
