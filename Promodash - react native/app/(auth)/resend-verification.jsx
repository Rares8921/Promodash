"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Easing, Keyboard } from "react-native"
import { useRouter } from "expo-router"
import { ThemeContext } from "../context/ThemeContext"
import i18n from "../../i18n"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import RecaptchaWebView from "../../components/RecaptchaWebView"

export default function ResendVerificationScreen() {
  const router = useRouter()
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [showCaptcha, setShowCaptcha] = useState(false)

  const fadeAnim = useRef(new Animated.Value(0)).current
  const slideAnim = useRef(new Animated.Value(30)).current
  const pulseAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
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

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start()
  }, [])

  const handleResendVerification = async (tokenOverride = null) => {
    Keyboard.dismiss()

    if (!email) {
      Alert.alert(i18n.t("resend_verification.error_title"), i18n.t("resend_verification.enter_email"))
      return
    }

    const tokenToUse = tokenOverride || recaptchaToken
    if (!tokenToUse) {
      setShowCaptcha(true)
      return
    }

    setRecaptchaToken(null)
    setLoading(true)

    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const response = await fetch("https://promodash.vercel.app/api/send_verification_email_webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail, recaptchaToken: tokenToUse }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to resend verification email.")
      }

      Alert.alert(i18n.t("resend_verification.success_title"), i18n.t("resend_verification.email_sent"))
      router.replace("/(auth)/login")
    } catch (error) {
      const msg = error.message?.toLowerCase() || ""
      if (msg.includes("captcha")) {
        setShowCaptcha(true)
        Alert.alert(i18n.t("general.error"), i18n.t("general.captcha"))
      } else {
        Alert.alert(i18n.t("resend_verification.error_title"), error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f7f9fc" }]}>
      {showCaptcha && (
        <View style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: isDarkMode ? "rgba(0,0,0,0.7)" : "rgba(255,255,255,0.8)",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 999,
        }}>
          <RecaptchaWebView
            onVerify={(token) => {
              setRecaptchaToken(token)
              setShowCaptcha(false)
              setTimeout(() => handleResendVerification(token), 100)
            }}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconContainer}
          >
            <Ionicons name="mail-unread-outline" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
            {i18n.t("resend_verification.title")}
          </Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? "#bbb" : "#666" }]}>
            {i18n.t("resend_verification.subtitle")}
          </Text>
        </View>

        <View
          style={[
            styles.inputContainer,
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
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder={i18n.t("resend_verification.email_placeholder")}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </View>

        <Animated.View style={{ transform: [{ scale: pulseAnim }], width: "100%" }}>
          <TouchableOpacity onPress={() => handleResendVerification()} disabled={loading} style={styles.buttonContainer}>
            <LinearGradient
              colors={loading ? ["#ccc", "#aaa"] : isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.resendButton}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                  <Text style={styles.resendButtonText}>{i18n.t("resend_verification.sending")}</Text>
                </View>
              ) : (
                <Text style={styles.resendButtonText}>{i18n.t("resend_verification.button")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.backContainer}>
          <Ionicons
            name="arrow-back-outline"
            size={18}
            color={isDarkMode ? "#FFD700" : "#2E4BFF"}
            style={styles.backIcon}
          />
          <Text style={[styles.backToLogin, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
            {i18n.t("resend_verification.back_to_login")}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  contentContainer: {
    width: "100%",
    maxWidth: 400,
  },
  headerContainer: {
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 25,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  buttonContainer: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  resendButton: {
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  resendButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  backContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 30,
    padding: 10,
  },
  backIcon: {
    marginRight: 5,
  },
  backToLogin: {
    fontSize: 16,
    fontWeight: "600",
  },
})
