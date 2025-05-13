import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

const LoginScreen = () => {
    const router = useRouter();
    const [hidePassword, setHidePassword] = useState(true); // Changed to match second code's initial state
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");

    const handleLogin = async () => {
        // Clear previous errors
        setEmailError("");
        setPasswordError("");
        setLoginError("");
        setIsLoading(true);

        // Validate email
        if (!email) {
            setEmailError("Email is required");
            setIsLoading(false);
            return;
        }

        // Validate password
        if (!password) {
            setPasswordError("Password is required");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("https://expenses-tracker-8k6o.onrender.com/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                await SecureStore.setItemAsync("token", data.token);
                await SecureStore.setItemAsync("userEmail", email);
                router.replace("/home");
            } else {
                setLoginError(data.msg || "Invalid credentials");
            }
        } catch (err) {
            setLoginError("Failed to connect to server");
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <View style={styles.container}>
            <View style={{ position: 'absolute', top: 50, left: 20, zIndex: 20 }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={28} color="white" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>Expense Tracker App</Text>
            <Image source={require("../assets/images/pig.png")} style={styles.image} />

            <Text style={styles.label}>Enter your email</Text>
            <TextInput
                placeholder=""
                keyboardType="email-address"
                style={styles.input}
                value={email}
                onChangeText={text => { setEmail(text); setEmailError(""); setLoginError(""); }}
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <Text style={styles.label}>Enter your password</Text>
            <View style={styles.inputWrapper}>
                <TextInput
                    placeholder=""
                    secureTextEntry={hidePassword}
                    style={styles.input}
                    value={password}
                    onChangeText={text => { setPassword(text); setPasswordError(""); setLoginError(""); }}
                />
                <TouchableOpacity style={styles.eyeIcon} onPress={() => setHidePassword(!hidePassword)}>
                    <Ionicons
                        name={hidePassword ? "eye-off-outline" : "eye-outline"}
                        size={22}
                        color="#333"
                    />
                </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}

            <TouchableOpacity
                style={{ alignSelf: "flex-end", marginBottom: 20 }}
                onPress={() => router.push("/forgetpassword")}
            >
                <Text style={styles.forgot}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#87B56C" />
                </View>
            )}
        </View>
    );
};

export default LoginScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#87B56C",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    image: {
        width: 160,
        height: 160,
        resizeMode: "contain",
        marginBottom: 10,
    },
    title: {
        fontSize: 24,
        color: "white",
        fontWeight: "bold",
        marginBottom: 30,
    },
    label: {
        color: "white",
        fontSize: 18,
        alignSelf: "flex-start",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#E5E4E2",
        width: "100%",
        borderRadius: 15,
        padding: 14,
        paddingRight: 40,
        marginBottom: 15,
    },
    inputWrapper: {
        width: "100%",
        position: "relative",
        justifyContent: "center",
    },
    eyeIcon: {
        position: "absolute",
        right: 15,
        top: 15,
    },
    forgot: {
        color: "white",
        fontSize: 13,
    },
    loginButton: {
        backgroundColor: "#D9D9D9",
        borderRadius: 20,
        paddingVertical: 15,
        width: "60%",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    loginText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black",
    },
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginBottom: 8,
        alignSelf: 'flex-start',
    },
});