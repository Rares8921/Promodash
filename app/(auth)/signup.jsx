"use client"

import { useState, useContext, useRef, useEffect } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Pressable,
  Easing,
} from "react-native"
import { useRouter, useLocalSearchParams } from "expo-router"
import { createUser, checkUserExists, signInWithOAuth2, getUserData } from "../../lib/appwrite"
import { UserContext } from "../context/UserContext"
import validator from "validator"
import { LinearGradient } from "expo-linear-gradient"
import i18n from "../../i18n"
import { ThemeContext } from "../context/ThemeContext"
import { GoogleSignin } from "@react-native-google-signin/google-signin"
import { Ionicons } from "@expo/vector-icons"

export default function SignUpScreen() {
  const fadeAnimAlert = useRef(new Animated.Value(0)).current
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const { setUser } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"

  // Animation values
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

    // Start pulsing animation for Google button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    theme,
  })

  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [googleSignUp, setGoogleSignUp] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)

  const router = useRouter()
  const { inviteCode } = useLocalSearchParams() // ex "?inviteCode=abc123"

  const showCustomAlert = (message) => {
    setAlertMessage(message)
    setAlertVisible(true)

    Animated.timing(fadeAnimAlert, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start()

    setTimeout(() => {
      hideCustomAlert()
    }, 3000)
  }

  const hideCustomAlert = () => {
    Animated.timing(fadeAnimAlert, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setAlertVisible(false))
  }

  const handleGoogleSignUp = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      await GoogleSignin.signOut()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo?.data === null || userInfo.type !== "success") {
        return // user a anulat
      }

      if (!userInfo?.data?.idToken) {
        throw new Error(i18n.t("signup.google_idtoken_fail"))
      }

      const idToken = userInfo.data.idToken
      const googleEmail = userInfo.data.user?.email
      if (!googleEmail) {
        throw new Error(i18n.t("signup.google_email_fail"))
      }

      const session = await signInWithOAuth2(googleEmail, idToken, inviteCode || "", theme)
      if (!session) {
        throw new Error(i18n.t("login.google_sign_up_failed"))
      }

      const userData = await getUserData(session.$id)
      setUser(userData)

      router.replace("/(tabs)/")
    } catch (error) {
      console.error("Google Sign-Up Error:", error)
      showCustomAlert(error.message || i18n.t("signup.error_generic"))
    }
  }

  const submit = async () => {
    if (!form.email || !form.password || !form.confirmPassword) {
      return showCustomAlert(i18n.t("signup.error_fill_all_fields"))
    }
    if (form.password !== form.confirmPassword) {
      return showCustomAlert(i18n.t("signup.error_password_mismatch"))
    }

    if (await checkUserExists(form.email)) {
      return showCustomAlert(i18n.t("signup.error_email_in_use"))
    }

    const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
    if (!passwordRegex.test(form.password)) {
      return showCustomAlert(i18n.t("signup.password_fail"))
    }

    setSubmitting(true)
    try {
      const sanitizedEmail = validator.normalizeEmail(form.email)
      const sanitizedPassword = validator.escape(form.password)

      const result = await createUser(
        sanitizedEmail,
        sanitizedPassword,
        inviteCode || "",
        i18n.locale.toString(),
        form.theme,
        googleSignUp,
      )

      if (!result) {
        throw new Error(i18n.t("signup.error_creation_failed"))
      }

      if (!googleSignUp) {
        showCustomAlert(i18n.t("signup.check_email"))
        await fetch("https://promodash.vercel.app/api/send_verification_email_webhook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sanitizedEmail }),
        })
      } else {
        showCustomAlert(i18n.t("signup.google_account_created_successfully"))
      }

      router.replace("/(auth)/login")
    } catch (error) {
      showCustomAlert(error.message || i18n.t("signup.error_generic"))
    } finally {
      setSubmitting(false)
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
            <Ionicons name="person-add-outline" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>{i18n.t("signup.title")}</Text>
          <Text style={[styles.subtitle, { color: isDarkMode ? "#bbb" : "#666" }]}>{i18n.t("signup.subtitle")}</Text>
        </View>

        {/* Form */}
        <View style={styles.inputContainer}>
          {/* Email */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDarkMode ? "#222" : "#fff",
                borderColor:
                  focusedInput === "email" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : isDarkMode ? "#333" : "#e0e0e0",
                shadowOpacity: focusedInput === "email" ? 0.2 : 0,
              },
            ]}
          >
            <Ionicons
              name="mail-outline"
              size={20}
              color={focusedInput === "email" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
              placeholder={i18n.t("signup.email")}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!googleSignUp}
              value={form.email}
              onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
              placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Password */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDarkMode ? "#222" : "#fff",
                borderColor:
                  focusedInput === "password" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : isDarkMode ? "#333" : "#e0e0e0",
                shadowOpacity: focusedInput === "password" ? 0.2 : 0,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedInput === "password" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
              placeholder={i18n.t("signup.password")}
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
              placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons
                name={showPassword ? "eye" : "eye-off"}
                size={20}
                color={focusedInput === "password" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
              />
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
          <View
            style={[
              styles.inputWrapper,
              {
                backgroundColor: isDarkMode ? "#222" : "#fff",
                borderColor:
                  focusedInput === "confirmPassword"
                    ? isDarkMode
                      ? "#FFD700"
                      : "#2E4BFF"
                    : isDarkMode
                      ? "#333"
                      : "#e0e0e0",
                shadowOpacity: focusedInput === "confirmPassword" ? 0.2 : 0,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={focusedInput === "confirmPassword" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
              style={styles.icon}
            />
            <TextInput
              style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
              placeholder={i18n.t("signup.confirm_password")}
              secureTextEntry={!showConfirmPassword}
              value={form.confirmPassword}
              onChangeText={(text) => setForm((prev) => ({ ...prev, confirmPassword: text }))}
              placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Ionicons
                name={showConfirmPassword ? "eye" : "eye-off"}
                size={20}
                color={focusedInput === "confirmPassword" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Buton Sign Up */}
        <TouchableOpacity onPress={submit} style={styles.buttonContainer} disabled={submitting}>
          <LinearGradient
            colors={submitting ? ["#ccc", "#aaa"] : isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.button}
          >
            {submitting ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>{i18n.t("signup.signup_button")}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Or sign up with google */}
        <Text style={[styles.orText, { color: isDarkMode ? "#bbb" : "#666" }]}>{i18n.t("signup.orlogin")}</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            onPress={handleGoogleSignUp}
            style={[styles.googleButton, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}
          >
            <LinearGradient
              colors={["#EA4335", "#FBBC05", "#34A853", "#4285F4"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.googleGradientBorder}
            >
              <View style={[styles.googleButtonInner, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
                <Ionicons name="logo-google" size={24} color="#EA4335" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

        {/* Already have an account? => login */}
        <TouchableOpacity onPress={() => router.push("/(auth)/login")} style={styles.loginLinkContainer}>
          <Text style={[styles.loginText, { color: isDarkMode ? "#bbb" : "#666" }]}>
            {i18n.t("signup.already_account")}{" "}
            <Text style={[styles.boldLink, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
              {i18n.t("signup.login")}
            </Text>
          </Text>
        </TouchableOpacity>

        {alertVisible && (
          <Pressable style={styles.alertContainer} onPress={hideCustomAlert}>
            <Animated.View
              style={[
                styles.alertBox,
                isDarkMode ? styles.darkAlert : styles.lightAlert,
                {
                  opacity: fadeAnimAlert,
                  transform: [
                    {
                      translateY: fadeAnimAlert.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons
                name="information-circle-outline"
                size={24}
                color={isDarkMode ? "#FFD700" : "#2E4BFF"}
                style={styles.alertIcon}
              />
              <Text style={[styles.alertText, isDarkMode ? { color: "#fff" } : { color: "#333" }]}>{alertMessage}</Text>
            </Animated.View>
          </Pressable>
        )}
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
    marginBottom: 30,
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
    width: "100%",
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 15,
    height: 55,
    marginBottom: 15,
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
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    marginTop: 25,
    marginBottom: 15,
    fontSize: 16,
  },
  googleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  googleGradientBorder: {
    padding: 2,
    borderRadius: 30,
    width: "100%",
    height: "100%",
  },
  googleButtonInner: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 28,
    width: "100%",
    height: "100%",
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },
  loginLinkContainer: {
    marginTop: 25,
  },
  loginText: {
    fontSize: 16,
  },
  boldLink: {
    fontWeight: "bold",
  },
  alertContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  alertBox: {
    width: "85%",
    padding: 15,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    elevation: 5,
  },
  alertIcon: {
    marginRight: 10,
  },
  lightAlert: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  darkAlert: {
    backgroundColor: "#222",
    borderColor: "#444",
    borderWidth: 1,
  },
  alertText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },
})
