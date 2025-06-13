"use client"

import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Easing, Pressable } from "react-native"
import { useRouter } from "expo-router"
import { useState, useContext, useRef, useEffect } from "react"
import { ThemeContext } from "../context/ThemeContext"
import { UserContext } from "../context/UserContext"
import { signIn, signInWithOAuth2, logout, isVerified, getUserData } from "../../lib/appwrite"
import i18n from "../../i18n"
import { GoogleSignin, isSuccessResponse } from "@react-native-google-signin/google-signin"
import { Ionicons } from "@expo/vector-icons"
import { LinearGradient } from "expo-linear-gradient"
import TwoFAModal from "../../components/TwoFAModal"
import AsyncStorage from "@react-native-async-storage/async-storage" 

export default function LoginScreen() {
  const fadeAnimAlert = useRef(new Animated.Value(0)).current
  const router = useRouter()
  const { setUser } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"

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

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)

  const [show2FAModal, setShow2FAModal] = useState(false)
  const [tempUser, setTempUser] = useState(null)

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

  const handleForgotPassword = () => {
    router.push("/(auth)/forgot-password")
  }

  const handleResendVerification = () => {
    router.push("/resend-verification")
  }

  const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices()
      await GoogleSignin.signOut()
      const userInfo = await GoogleSignin.signIn()

      if (userInfo?.data === null || userInfo.type !== "success") return

      if (!isSuccessResponse(userInfo) || !userInfo.data.idToken) {
        throw new Error(i18n.t("login.google_token_fail"))
      }

      const idToken = userInfo.data.idToken
      const googleEmail = userInfo.data.user?.email
      if (!googleEmail) throw new Error(i18n.t("login.google_email_fail"))

      const session = await signInWithOAuth2(googleEmail, idToken, null, theme)
      if (!session) throw new Error(i18n.t("login.google_sign_up_failed"))

      const userData = await getUserData(session.$id)

      const trusted = await AsyncStorage.getItem("trustedDevice")
      if (userData?.TwoFA && trusted !== "true") {
        setTempUser(userData)
        setShow2FAModal(true)
      } else {
        setUser(userData)
        router.replace("/(tabs)/")
      }

    } catch (error) {
      console.error("Google Login Error:", error)
      showCustomAlert(error.message || i18n.t("login.error_generic"))
    }
  }

  const handleLogin = async () => {
    if (loading) return
    setLoading(true)
    try {
      const session = await signIn(email, password)
      if (session) {
        const verified = await isVerified()
        if (!verified) {
          showCustomAlert(i18n.t("login.email_not_verified"))
          setLoading(false)
          await logout()
          return
        }

        const userData = await getUserData(session.$id)

        const trusted = await AsyncStorage.getItem("trustedDevice");
        if (userData?.TwoFA && trusted !== "true") {
          setTempUser(userData);
          setShow2FAModal(true);
        } else {
          setUser(userData);
          router.replace("/(tabs)/");
        }

      }
    } catch (error) {
      console.log(error)
      showCustomAlert(error.message || i18n.t("login.error_title"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? "#121212" : "#f7f9fc" }]}>
      <Animated.View style={[styles.contentContainer, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <View style={styles.headerContainer}>
          <LinearGradient
            colors={isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.iconContainer}
          >
            <Ionicons name="log-in-outline" size={32} color="#fff" />
          </LinearGradient>
          <Text style={[styles.title, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>{i18n.t("login.title")}</Text>
        </View>

        {/* Email Input */}
        <View
          style={[
            styles.inputContainer,
            isDarkMode ? styles.darkInput : styles.lightInput,
            focusedInput === "email" && {
              borderColor: isDarkMode ? "#FFD700" : "#2E4BFF",
              shadowOpacity: 0.2,
            },
          ]}
        >
          <Ionicons name="mail-outline" size={20} color={focusedInput === "email" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder={i18n.t("login.email")}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
        </View>

        {/* Password Input */}
        <View
          style={[
            styles.inputContainer,
            isDarkMode ? styles.darkInput : styles.lightInput,
            focusedInput === "password" && {
              borderColor: isDarkMode ? "#FFD700" : "#2E4BFF",
              shadowOpacity: 0.2,
            },
          ]}
        >
          <Ionicons name="lock-closed-outline" size={20} color={focusedInput === "password" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: isDarkMode ? "#fff" : "#333" }]}
            placeholder={i18n.t("login.password")}
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={isDarkMode ? "#777" : "#aaa"}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />
          <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)}>
            <Ionicons name={showPassword ? "eye-outline" : "eye-off-outline"} size={20} color={focusedInput === "password" ? (isDarkMode ? "#FFD700" : "#2E4BFF") : "#aaa"} />
          </TouchableOpacity>
        </View>

        {/* Forgot + Resend */}
        <View style={styles.forgotContainer}>
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={[styles.forgotPasswordText, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
              {i18n.t("login.forgot-password")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleResendVerification}>
            <Text style={[styles.forgotPasswordText, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
              {i18n.t("login.resend_verification")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login */}
        <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.buttonContainer}>
          <LinearGradient
            colors={loading ? ["#ccc", "#aaa"] : isDarkMode ? ["#FFD700", "#FFA500"] : ["#4A6FFF", "#2E4BFF"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.loginButton}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <Ionicons name="refresh" size={20} color="#fff" style={styles.loadingIcon} />
                <Text style={styles.loginButtonText}>{i18n.t("login.loading")}</Text>
              </View>
            ) : (
              <Text style={styles.loginButtonText}>{i18n.t("login.login_button")}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={[styles.orText, { color: isDarkMode ? "#bbb" : "#666" }]}>{i18n.t("login.orlogin")}</Text>

        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}
            onPress={handleGoogleSignIn}
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

        <TouchableOpacity onPress={() => router.push("/(auth)/signup")} style={styles.registerContainer}>
          <Text style={[styles.registerText, { color: isDarkMode ? "#bbb" : "#666" }]}>
            {i18n.t("login.no_account")}{" "}
            <Text style={[styles.boldRegister, { color: isDarkMode ? "#FFD700" : "#2E4BFF" }]}>
              {i18n.t("login.register")}
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

      {show2FAModal && tempUser && (
        <TwoFAModal
          visible={show2FAModal}
          email={tempUser.email}
          onSuccess={() => {
            setUser(tempUser)
            setShow2FAModal(false)
            router.replace("/(tabs)/")
          }}
        />
      )}
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
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  lightInput: {
    backgroundColor: "#fff",
    borderColor: "#e0e0e0",
    shadowOpacity: 0,
  },
  darkInput: {
    backgroundColor: "#222",
    borderColor: "#333",
    shadowOpacity: 0,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  buttonContainer: {
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButton: {
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
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  orText: {
    marginVertical: 25,
    fontSize: 16,
    textAlign: "center",
  },
  googleButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
    alignSelf: "center",
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
  registerContainer: {
    marginTop: 25,
    alignItems: "center",
  },
  registerText: {
    fontSize: 16,
    textAlign: "center",
  },
  boldRegister: {
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
    width: "100%",
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
