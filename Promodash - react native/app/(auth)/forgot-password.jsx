"use client"

import React, { useState, useContext } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native"
import { useRouter } from "expo-router"
import { resetPassword } from "../../lib/appwrite"
import { LinearGradient } from "expo-linear-gradient"
import i18n from "../../i18n"
import { ThemeContext } from "../context/ThemeContext" // Context pentru temă
import { Ionicons } from "@expo/vector-icons"

export default function ForgotPasswordScreen() {
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current
  const slideAnim = React.useRef(new Animated.Value(50)).current

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start()
  }, [])

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert(i18n.t("forgot_password.error"), i18n.t("forgot_password.missing_email"))
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      Alert.alert(i18n.t("forgot_password.success"), i18n.t("forgot_password.success_message"))
      router.replace("/(auth)/login")
    } catch (error) {
      Alert.alert(i18n.t("forgot_password.error"), i18n.t("forgot_password.fail_message"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f7f9fc" }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : -500}
    >
      <Animated.View
        style={[
          styles.inner,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <LinearGradient
            colors={isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconContainer}
          >
            <Ionicons name="lock-open-outline" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
            {i18n.t("forgot_password.title")}
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? "#bbb" : "#666" }]}>
            Enter your email to reset your password
          </Text>
        </View>

        {/* Input pentru Email */}
        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: isDarkMode ? "#222" : "#fff",
              borderColor: inputFocused ? (isDarkMode ? "#FFD700" : "#2E4BFF") : isDarkMode ? "#333" : "#e0e0e0",
              shadowOpacity: inputFocused ? 0.2 : 0,
            },
          ]}
        >
          <Ionicons
            name="mail-outline"
            size={20}
            color={inputFocused ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
            style={styles.icon}
          />
          <TextInput
            style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder={i18n.t("forgot_password.enter")}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </View>

        {/* Buton Reset Password */}
        <TouchableOpacity
          onPress={handleResetPassword}
          disabled={loading}
          activeOpacity={0.8}
          style={styles.buttonContainer}
        >
          <LinearGradient
            colors={loading ? ["#ccc", "#aaa"] : isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                <Text style={styles.buttonText}>{i18n.t("forgot_password.sending")}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{i18n.t("forgot_password.send")}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color={isDarkMode ? "#FFD700" : "#2E4BFF"}
            style={styles.backIcon}
          />
          <Text style={[styles.linkText, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
            {i18n.t("forgot_password.back_to_login")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    maxWidth: "80%",
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 55,
    width: "100%",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  icon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  buttonContainer: {
    width: "100%",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  button: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingIcon: {
    marginRight: 8,
    transform: [{ rotate: "0deg" }],
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    padding: 10,
  },
  backIcon: {
    marginRight: 5,
  },
  linkText: {
    fontSize: 16,
    fontWeight: "600",
  },
})
