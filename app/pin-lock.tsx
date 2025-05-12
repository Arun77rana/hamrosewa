import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";

export default function PinLockScreen() {
    const [pin, setPin] = useState(["", "", "", ""]);
    const [attempts, setAttempts] = useState(3);
    const router = useRouter();
    const inputRefs = useRef<(TextInput | null)[]>([]);

    useEffect(() => {
        const checkPinSetup = async () => {
            try {
                const isPinSet = await SecureStore.getItemAsync("isPinSet");
                const token = await SecureStore.getItemAsync("token");
                
                if (!token) {
                    router.replace("/loginscreen");
                    return;
                }

                if (isPinSet !== "true") {
                    router.replace("/home");
                    return;
                }

                setPin(["", "", "", ""]);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } catch (error) {
                console.error("Error checking PIN setup:", error);
                router.replace("/loginscreen");
            }
        };

        checkPinSetup();
    }, []);

    const handleChange = (value: string, index: number) => {
        if (/^\d?$/.test(value)) {
            const updated = [...pin];
            updated[index] = value;
            setPin(updated);

            if (value && index < 3) {
                inputRefs.current[index + 1]?.focus();
            } else if (value && index === 3) {
                handleUnlock();
            }
        }
    };

    const handleUnlock = async () => {
        const enteredPin = pin.join("");
        if (enteredPin.length < 4) {
            return;
        }

        try {
            const storedPin = await SecureStore.getItemAsync("userPIN");
            
            if (storedPin === enteredPin) {
                router.replace("/home");
            } else {
                const remainingAttempts = attempts - 1;
                setAttempts(remainingAttempts);
                
                if (remainingAttempts > 0) {
                    Alert.alert(
                        "Invalid PIN",
                        `Incorrect PIN. ${remainingAttempts} attempt${remainingAttempts === 1 ? '' : 's'} remaining.`
                    );
                    setPin(["", "", "", ""]);
                    inputRefs.current[0]?.focus();
                } else {
                    Alert.alert(
                        "Too Many Attempts",
                        "You've exceeded the maximum number of attempts. Please login again.",
                        [
                            {
                                text: "OK",
                                onPress: async () => {
                                    await SecureStore.deleteItemAsync("token");
                                    router.replace("/loginscreen");
                                }
                            }
                        ]
                    );
                }
            }
        } catch (error) {
            console.error("Error verifying PIN:", error);
            Alert.alert("Error", "Failed to verify PIN. Please try again.");
            setPin(["", "", "", ""]);
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Enter Your PIN</Text>
                <Text style={styles.attemptsText}>
                    {attempts} attempt{attempts === 1 ? '' : 's'} remaining
                </Text>
                <View style={styles.pinContainer}>
                    {pin.map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={1}
                            secureTextEntry
                            value={digit}
                            onChangeText={(val) => handleChange(val, index)}
                        />
                    ))}
                </View>
                <TouchableOpacity style={styles.unlockButton} onPress={handleUnlock}>
                    <Text style={styles.unlockText}>Unlock</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#e6e6e6",
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        backgroundColor: "#fff",
        paddingVertical: 30,
        paddingHorizontal: 20,
        borderRadius: 12,
        width: "85%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 6,
        elevation: 5,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 10,
    },
    attemptsText: {
        fontSize: 14,
        color: "#666",
        marginBottom: 25,
    },
    pinContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "80%",
        marginBottom: 25,
    },
    input: {
        borderBottomWidth: 2,
        borderColor: "#000",
        fontSize: 22,
        textAlign: "center",
        padding: 5,
        width: 40,
    },
    unlockButton: {
        backgroundColor: "#6CC551",
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
    },
    unlockText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});
