import React, { useState, useRef } from "react";
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

export default function PinSetupScreen() {
    const router = useRouter();
    const [pin, setPin] = useState(["", "", "", ""]);
    const [confirmPin, setConfirmPin] = useState(["", "", "", ""]);
    const [isConfirming, setIsConfirming] = useState(false);
    const inputRefs = useRef<(TextInput | null)[]>([]);

    const handleChange = (value: string, index: number) => {
        if (/^\d?$/.test(value)) {
            const currentPin = isConfirming ? confirmPin : pin;
            const updatedPin = [...currentPin];
            updatedPin[index] = value;
            
            if (isConfirming) {
                setConfirmPin(updatedPin);
            } else {
                setPin(updatedPin);
            }

            if (value && index < 3) {
                inputRefs.current[index + 1]?.focus();
            } else if (value && index === 3 && !isConfirming) {
                setIsConfirming(true);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            }
        }
    };

    const handleCancel = () => {
        router.back();
    };

    const handleConfirm = async () => {
        const finalPin = pin.join("");
        const finalConfirmPin = confirmPin.join("");

        if (isConfirming) {
            if (finalPin === finalConfirmPin) {
                try {
                    await SecureStore.setItemAsync("userPIN", finalPin);
                    await SecureStore.setItemAsync("isPinSet", "true");
                    Alert.alert("Success", "PIN saved successfully.", [
                        {
                            text: "OK",
                            onPress: () => router.back()
                        }
                    ]);
                } catch (error) {
                    console.error("Error saving PIN:", error);
                    Alert.alert("Error", "Failed to save PIN.");
                }
            } else {
                Alert.alert("Error", "PINs do not match. Please try again.");
                setConfirmPin(["", "", "", ""]);
                inputRefs.current[0]?.focus();
            }
        } else {
            if (finalPin.length === 4) {
                setIsConfirming(true);
                setTimeout(() => {
                    inputRefs.current[0]?.focus();
                }, 100);
            } else {
                Alert.alert("Incomplete", "Please enter all 4 digits.");
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>
                    {isConfirming ? "Confirm your PIN" : "Enter 4 digit PIN"}
                </Text>
                <View style={styles.pinContainer}>
                    {(isConfirming ? confirmPin : pin).map((digit, index) => (
                        <TextInput
                            key={index}
                            ref={(ref) => (inputRefs.current[index] = ref)}
                            style={styles.input}
                            keyboardType="numeric"
                            maxLength={1}
                            value={digit}
                            onChangeText={(value) => handleChange(value, index)}
                        />
                    ))}
                </View>
                <View style={styles.buttonContainer}>
                    <TouchableOpacity onPress={handleCancel}>
                        <Text style={styles.cancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleConfirm}>
                        <Text style={styles.confirm}>Confirm</Text>
                    </TouchableOpacity>
                </View>
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
        fontSize: 16,
        fontWeight: "500",
        marginBottom: 20,
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
        fontSize: 20,
        textAlign: "center",
        padding: 5,
        width: 40,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "60%",
    },
    cancel: {
        color: "#6CC551",
        fontWeight: "600",
        fontSize: 16,
    },
    confirm: {
        color: "#6CC551",
        fontWeight: "600",
        fontSize: 16,
    },
});
