/**
 * Settings Screen Component
 * 
 * Provides user interface for managing application settings including:
 * - User profile (name, email)
 * - Application theme
 * - Security settings (2FA, PIN, biometric)
 * - Notifications
 * - Language preferences
 * - Active promo code management
 */
import { useState, useEffect, useContext, useCallback } from "react";
import {
  Alert,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Switch,
  Pressable,
  Animated,
  Easing,
  ScrollView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { updateUserData, getPromoDetails } from "../../lib/appwrite";
import i18n from "../../i18n";
import { LanguageContext } from "../context/LanguageContext";
import {
  isBiometricAvailable,
  getSupportedBiometricType,
  saveBiometricPreference,
  loadBiometricPreference
} from "../../lib/biometricUtils";

export default function SettingsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  
  // Context hooks
  const { user, setUser, loading, reloadUser } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage } = useContext(LanguageContext);

  // User settings state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [appTheme, setAppTheme] = useState("Light");
  const [notifications, setNotifications] = useState(false);
  
  // Biometric authentication state
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState(null);

  // PIN management state
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [hasPin, setHasPin] = useState(false);
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [tempPin, setTempPin] = useState("");
  const [tempPinConfirm, setTempPinConfirm] = useState("");

  // Active promo code state
  const [activeCodeDetails, setActiveCodeDetails] = useState(null);

  // Custom alert state and animation
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fadeAnimAlert = useState(new Animated.Value(0))[0];
  
  // Header animation
  const fadeAnimHeader = useState(new Animated.Value(0))[0];

  // Derived state
  const shouldShowChangePin = hasPin;
  const shouldShowSetPin = !hasPin;
  const isExpired = activeCodeDetails && new Date(activeCodeDetails.expirationDate) < new Date();

  /**
   * Initialize user data and animations when user data is available
   */
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAppTheme(user.theme || "Light");
      setNotifications(user.notifications || false);
      
    }

    setHasPin(!!user?.pin);

    // Animate header with fade-in effect
    Animated.timing(fadeAnimHeader, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start();

    // Initialize biometric authentication
    const initBiometrics = async () => {
      const available = await isBiometricAvailable();
      if (!available) return;
      
      const type = await getSupportedBiometricType();
      const stored = await loadBiometricPreference();
      
      setBiometricEnabled(stored.enabled ?? false);
      setBiometricType(type);
    };

    initBiometrics();
  }, [user, theme, toggleTheme, fadeAnimHeader]);

  /**
   * Update PIN status when user data changes
   */
  useEffect(() => {
    setHasPin(!!user?.pin);
  }, [user]);

  /**
   * Fetch active promo code details when code changes
   */
  useEffect(() => {
    const fetchActiveCodeDetails = async () => {
      if (!user?.Active_Code) return;

      try {
        const promo = await getPromoDetails(user.Active_Code);
        if (promo) setActiveCodeDetails(promo);
      } catch (error) {
        console.error("Failed to fetch promo details:", error);
      }
    };

    fetchActiveCodeDetails();
  }, [user?.Active_Code]);

  /**
   * Display a custom alert message with animation
   * @param {string} message - The message to display
   */
  const showCustomAlert = useCallback((message) => {
    // Capitalize first letter of message
    const formattedMessage = message.charAt(0).toUpperCase() + message.slice(1);
    
    setAlertMessage(formattedMessage);
    setAlertVisible(true);
    fadeAnimAlert.setValue(0);

    Animated.timing(fadeAnimAlert, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    // Auto-hide after delay
    setTimeout(() => hideCustomAlert(), 3000);
  }, [fadeAnimAlert]);

  /**
   * Hide the custom alert with animation
   */
  const hideCustomAlert = useCallback(() => {
    Animated.timing(fadeAnimAlert, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setAlertVisible(false));
  }, [fadeAnimAlert]);

  /**
   * Validate email format
   * @param {string} emailValue - Email to validate
   * @returns {boolean} - Whether email is valid
   */
  const validateEmail = useCallback((emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailValue);
  }, []);

  /**
   * Format ISO date to DD.MM.YYYY format
   * @param {string} isoDate - ISO date string
   * @returns {string} - Formatted date
   */
  const formatDate = useCallback((isoDate) => {
    const date = new Date(isoDate);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }, []);

  /**
   * Update user data field
   * @param {string} field - Field name to update
   * @param {any} value - New value
   */
  const handleUpdate = useCallback(async (field, value) => {
    // Validate input
    if (field === "Name" && value.length < 3) {
      showCustomAlert(i18n.t("settings.alerts.name_too_short"));
      return;
    }
    
    if (field === "email" && !validateEmail(value)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"));
      return;
    }

    try {
      // Update backend data
      const success = await updateUserData(field, value);
      
      if (success) {
        // Update local state
        setUser((prevUser) => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            [field.toLowerCase()]: value
          };
        });

        showCustomAlert(
          i18n.t("settings.alerts.update_success", {
            field: i18n.t(`settings.${field.toLowerCase()}`)
          })
        );
      }
    } catch (error) {
      console.error(`Failed to update ${field}:`, error);
      showCustomAlert(i18n.t("settings.alerts.generic_error"));
    }
  }, [setUser, showCustomAlert, validateEmail]);

  /**
   * Toggle between light and dark theme
   */
  const handleThemeChange = useCallback(() => {
    const newTheme = appTheme === "Light" ? "Dark" : "Light";
    toggleTheme(newTheme);
    handleUpdate("Theme", newTheme);
  }, [appTheme, handleUpdate, toggleTheme]);

  /**
   * Toggle notification settings
   */
  const handleNotificationsChange = useCallback(() => {
    const newNotificationStatus = !notifications;
    setNotifications(newNotificationStatus);
    handleUpdate("Notifications", newNotificationStatus);
  }, [notifications, handleUpdate]);

  /**
   * Toggle between available languages
   */
  const handleLanguageChange = useCallback(async () => {
    const newLanguage = language === "en" ? "ro" : "en";
    changeLanguage(newLanguage);
    i18n.locale = newLanguage;

    showCustomAlert(
      i18n.t("settings.alerts.update_success", { field: i18n.t("settings.language") })
    );
  }, [language, changeLanguage, showCustomAlert]);

  /**
   * Send email change confirmation
   */
  const handleUpdateEmail = useCallback(async () => {
    if (!validateEmail(email)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"));
      return;
    }
      
    try {
      const response = await fetch(
        "https://promodash.vercel.app/api/send_email_change_confirmation_current_webhook", 
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            currentEmail: user.email,
            newEmail: email
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        showCustomAlert("Email de confirmare trimis către adresa curentă.");
      } else {
        showCustomAlert("Eroare la trimiterea emailului de confirmare.");
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      showCustomAlert("Eroare la trimiterea emailului de confirmare.");
    }
  }, [email, user?.email, validateEmail, showCustomAlert]);

  /**
   * Toggle biometric authentication
   */
  const toggleBiometric = useCallback(async () => {
    const newValue = !biometricEnabled;

    if (newValue || hasPin) {
      setHasPin(!!user?.pin);
      setShowPinPrompt(true);
    }

    setBiometricEnabled(newValue);
    await saveBiometricPreference(newValue, biometricType);
    
    showCustomAlert(
      newValue
        ? i18n.t("extra_authentication.biometric_option") + " " + i18n.t("extra_authentication.active")
        : i18n.t("extra_authentication.biometric_option") + " " + i18n.t("extra_authentication.non_active")
    );
  }, [biometricEnabled, biometricType, hasPin, user?.pin, showCustomAlert]);

  /**
   * Delete the active promo code
   */
  const handleDeleteActiveCode = useCallback(() => {
    if (!user?.Active_Code) return;

    Alert.alert(
      i18n.t("settings.confirm_delete_active_code"),
      "",
      [
        {
          text: i18n.t("settings.cancel"),
          style: "cancel"
        },
        {
          text: i18n.t("settings.delete"),
          style: theme === "Dark" ? "destructive" : "default",
          onPress: async () => {
            try {
              const success = await updateUserData("Active_Code", "");
              if (success) {
                await reloadUser();
                showCustomAlert(i18n.t("settings.active_code_deleted"));
              } else {
                showCustomAlert(i18n.t("settings.alerts.generic_error"));
              }
            } catch (error) {
              console.error("Failed to delete active code:", error);
              showCustomAlert(i18n.t("settings.alerts.generic_error"));
            }
          }
        }
      ],
      { cancelable: true }
    );
  }, [user?.Active_Code, theme, reloadUser, showCustomAlert]);

  /**
   * Confirm PIN and enable biometric authentication
   */
  const confirmAndEnableBiometric = useCallback(async () => {
    // Validate current PIN if user has one
    if (hasPin && pin !== user.pin) {
      showCustomAlert(i18n.t("extra_authentication.pin_wrong"));
      return;
    }

    // Validate PIN length
    if (tempPin.length !== 6 || (!hasPin && tempPinConfirm.length !== 6)) {
      showCustomAlert(i18n.t("extra_authentication.pin_invalid_length"));
      return;
    }

    // Validate PIN confirmation matches
    if (!hasPin && tempPin !== tempPinConfirm) {
      showCustomAlert(i18n.t("extra_authentication.pin_not_match"));
      return;
    }

    try {
      // Update PIN in backend
      const success = await updateUserData("pin", tempPin);
      
      if (success) {
        await reloadUser();
        setUser((prev) => ({ ...prev, pin: tempPin }));
        setHasPin(true);
        
        // Reset PIN fields
        setPin("");
        setTempPin("");
        setTempPinConfirm("");
        setShowPinPrompt(false);
        
        // Enable biometric authentication
        setBiometricEnabled(true);
        await saveBiometricPreference(true, biometricType);

        showCustomAlert(i18n.t("extra_authentication.pin_saved_success"));
      } else {
        showCustomAlert(i18n.t("extra_authentication.pin_saved_error"));
      }
    } catch (error) {
      console.error("Failed to update PIN:", error);
      showCustomAlert(i18n.t("extra_authentication.pin_saved_error"));
    }
  }, [
    hasPin, 
    pin, 
    user?.pin, 
    tempPin, 
    tempPinConfirm, 
    biometricType, 
    reloadUser, 
    setUser, 
    showCustomAlert
  ]);

  // Show loading state while user data is being fetched
  if (loading) {
    return (
      <View
        style={[
          styles.container,
          theme === "Dark" && { backgroundColor: "#121212" }
        ]}
      >
        <Text
          style={{
            textAlign: "center",
            marginTop: 20,
            color: theme === "Dark" ? "#fff" : "#000"
          }}
        >
          {i18n.t("settings.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}> 
        {/* Header with animated fade-in effect */}
        <Animated.View style={{ opacity: fadeAnimHeader }}>
          <LinearGradient
            colors={theme === "Dark" ? ["#121212", "#1E1E1E"] : ["#2575fc", "#4c8bf5"]}
            style={styles.header}
          >
            <TouchableOpacity 
              onPress={() => navigation.goBack()} 
              style={styles.backButton}
              accessibilityLabel={i18n.t("accessibility.back")}
            >
              <Ionicons name="arrow-back" size={26} color={"#fff"} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {i18n.t("settings.title")}
            </Text>

            <TouchableOpacity 
              onPress={() => {}} 
              style={styles.settingsButton}
              accessibilityLabel={i18n.t("accessibility.settings")}
            >
              <Ionicons name="settings-outline" size={24} color={"#fff"} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* User Profile Section */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.label, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.name")}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                theme === "Dark" && { color: "#fff", borderColor: "#444" }
              ]}
              value={name}
              onChangeText={setName}
              accessibilityLabel={i18n.t("accessibility.name_input")}
            />
            <TouchableOpacity 
              style={styles.changeButton} 
              onPress={() => handleUpdate("Name", name)}
              accessibilityLabel={i18n.t("accessibility.save_name")}
            >
              <Text
                style={[
                  styles.changeButtonText,
                  { color: theme === "Dark" ? "#FFD700" : "#2575fc" }
                ]}
              >
                {i18n.t("settings.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Email Section */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.label, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.email")}
          </Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                theme === "Dark" && { color: "#fff", borderColor: "#444" }
              ]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              accessibilityLabel={i18n.t("accessibility.email_input")}
            />
            <TouchableOpacity 
              style={styles.changeButton} 
              onPress={handleUpdateEmail}
              accessibilityLabel={i18n.t("accessibility.save_email")}
            >
              <Text
                style={[
                  styles.changeButtonText,
                  { color: theme === "Dark" ? "#FFD700" : "#2575fc" }
                ]}
              >
                {i18n.t("settings.save")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Promo Code Section */}
        {user?.Active_Code && (
          <View
            style={[
              styles.section,
              theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
            ]}
          >
            <Text style={[
              styles.sectionTitle,
              { color: theme === "Dark" ? "#FFD700" : "#2575fc", marginBottom: 6 }
            ]}>
              {i18n.t("settings.active_code")}
            </Text>

            {activeCodeDetails?.expirationDate && (
              <Text style={{ color: theme === "Dark" ? "#ccc" : "#666", marginBottom: 12 }}>
                {i18n.t("settings.expires_at")}: {formatDate(activeCodeDetails.expirationDate)}
              </Text>
            )}

            <Text style={{ color: theme === "Dark" ? "#fff" : "#000", marginBottom: 12 }}>
              {user.Active_Code}
            </Text>

            <TouchableOpacity
              onPress={handleDeleteActiveCode}
              style={{
                backgroundColor: theme === "Dark" ? "#333" : "#eee",
                padding: 10,
                borderRadius: 8,
                alignItems: "center"
              }}
              disabled={!isExpired}
              accessibilityLabel={i18n.t("accessibility.delete_code")}
              accessibilityState={{ disabled: !isExpired }}
            >
              <Text style={{
                color: theme === "Dark" ? "#FFD700" : "#d11a2a",
                fontWeight: "bold"
              }}>
                {i18n.t("settings.delete_current_code")}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Theme Selection Section */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.app_settings")}
          </Text>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleThemeChange}
            accessibilityLabel={i18n.t("accessibility.toggle_theme")}
            accessibilityRole="button"
          >
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.theme")}
            </Text>
            <Text style={[styles.optionValue, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
              {appTheme}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Security Section - 2FA */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.security")}
          </Text>

          <View style={styles.optionItem}>
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.enable_2fa")}
            </Text>
            <Switch
              value={user?.TwoFA ?? false}
              onValueChange={async (value) => {
                try {
                  await AsyncStorage.setItem("last2FAChange", Date.now().toString());
                  await updateUserData("TwoFA", value);
                  setUser((prev) => ({ ...prev, TwoFA: value }));
                  showCustomAlert(
                    i18n.t(value ? "settings.2fa_enabled" : "settings.2fa_disabled")
                  );
                } catch (e) {
                  console.error("Failed to update 2FA:", e);
                  showCustomAlert("Failed to update 2FA.");
                } finally {
                  // Clean up temporary storage
                  setTimeout(() => {
                    AsyncStorage.removeItem("last2FAChange");
                  }, 2500);
                }
              }}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={user?.TwoFA ? "#2575fc" : "#f4f3f4"}
              accessibilityLabel={i18n.t("accessibility.toggle_2fa")}
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* Notifications Section */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.notifications")}
          </Text>
          <View style={styles.optionItem}>
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.enable_notifications")}
            </Text>
            <Switch
              value={notifications}
              onValueChange={handleNotificationsChange}
              trackColor={{ false: "#767577", true: "#81b0ff" }}
              thumbColor={notifications ? "#2575fc" : "#f4f3f4"}
              accessibilityLabel={i18n.t("accessibility.toggle_notifications")}
              accessibilityRole="switch"
            />
          </View>
        </View>

        {/* Language Section */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.language")}
          </Text>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={handleLanguageChange}
            accessibilityLabel={i18n.t("accessibility.change_language")}
            accessibilityRole="button"
          >
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.language")}
            </Text>
            <Text style={[styles.optionValue, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
              {language === "en" ? i18n.t("settings.english") : i18n.t("settings.romanian")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password Reset Section */}
        <TouchableOpacity
          style={[
            styles.section,
            styles.resetButton,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
          onPress={() => {
            router.push("/(auth)/forgot-password");
          }}
          accessibilityLabel={i18n.t("accessibility.reset_password")}
          accessibilityRole="button"
        >
          <Text style={[styles.resetButtonText, theme === "Dark" && { color: "#FFD700" }]}>
            {i18n.t("settings.reset_password")}
          </Text>
        </TouchableOpacity>

        {/* Custom Alert Component */}
        {alertVisible && (
          <Pressable 
            style={styles.alertContainer} 
            onPress={hideCustomAlert}
            accessibilityLabel={i18n.t("accessibility.dismiss_alert")}
          >
            <Animated.View
              style={[
                styles.alertBox,
                theme === "Dark" ? styles.darkAlert : styles.lightAlert,
                { opacity: fadeAnimAlert }
              ]}
            >
              <Text
                style={[
                  styles.alertText,
                  theme === "Dark" ? { color: "#fff" } : { color: "#000" }
                ]}
              >
                {alertMessage}
              </Text>
            </Animated.View>
          </Pressable>
        )}

        {/* Biometric Authentication Section */}
        {biometricType && (
          <View
            style={[
              styles.section,
              theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
            ]}
          >
            <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
              {i18n.t("extra_authentication.biometric_option")}
            </Text>
            <View style={styles.optionItem}>
              <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
                {biometricType === "face" ? "Face ID" : "Fingerprint"}
              </Text>
              <Switch
                value={biometricEnabled}
                onValueChange={toggleBiometric}
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={biometricEnabled ? "#2575fc" : "#f4f3f4"}
                accessibilityLabel={i18n.t("accessibility.toggle_biometric")}
                accessibilityRole="switch"
              />
            </View>

            {/* PIN Management Section */}
            {(biometricEnabled || hasPin) && (
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.sectionTitle, {
                  color: theme === "Dark" ? "#FFD700" : "#2575fc",
                  marginBottom: 10
                }]}>
                  {hasPin
                    ? i18n.t("extra_authentication.change_pin_title")
                    : i18n.t("extra_authentication.set_pin_title")}
                </Text>

                {/* Current PIN Input (for changing existing PIN) */}
                {hasPin && (
                  <TextInput
                    placeholder={i18n.t("extra_authentication.enter_current_pin")}
                    keyboardType="numeric"
                    maxLength={6}
                    secureTextEntry
                    value={pin}
                    onChangeText={setPin}
                    style={[
                      styles.input,
                      { marginBottom: 10 },
                      theme === "Dark" && {
                        backgroundColor: "#1E1E1E",
                        color: "#fff",
                        borderColor: "#444"
                      }
                    ]}
                    placeholderTextColor={theme === "Dark" ? "#888" : "#aaa"}
                    accessibilityLabel={i18n.t("accessibility.current_pin")}
                  />
                )}

                {/* New PIN Input */}
                <TextInput
                  placeholder={i18n.t("extra_authentication.enter_new_pin")}
                  keyboardType="numeric"
                  maxLength={6}
                  secureTextEntry
                  value={tempPin}
                  onChangeText={setTempPin}
                  style={[
                    styles.input,
                    { marginBottom: shouldShowSetPin ? 10 : 0 },
                    theme === "Dark" && {
                      backgroundColor: "#1E1E1E",
                      color: "#fff",
                      borderColor: "#444"
                    }
                  ]}
                  placeholderTextColor={theme === "Dark" ? "#888" : "#aaa"}
                  accessibilityLabel={i18n.t("accessibility.new_pin")}
                />

                {/* Confirm PIN Input (only when setting new PIN) */}
                {shouldShowSetPin && (
                  <TextInput
                    placeholder={i18n.t("extra_authentication.confirm_new_pin")}
                    keyboardType="numeric"
                    maxLength={6}
                    secureTextEntry
                    value={tempPinConfirm}
                    onChangeText={setTempPinConfirm}
                    style={[
                      styles.input,
                      theme === "Dark" && {
                        backgroundColor: "#1E1E1E",
                        color: "#fff",
                        borderColor: "#444"
                      }
                    ]}
                    placeholderTextColor={theme === "Dark" ? "#888" : "#aaa"}
                    accessibilityLabel={i18n.t("accessibility.confirm_pin")}
                  />
                )}

                {/* Save PIN Button */}
                <TouchableOpacity
                  onPress={confirmAndEnableBiometric}
                  style={{ marginTop: 10, alignSelf: "flex-end" }}
                  accessibilityLabel={i18n.t("accessibility.save_pin")}
                  accessibilityRole="button"
                >
                  <Text
                    style={{
                      fontWeight: "bold",
                      color: theme === "Dark" ? "#FFD700" : "#2575fc"
                    }}
                  >
                    {i18n.t("extra_authentication.continue")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 25,
    backgroundColor: "transparent",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 2,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6
  },
  backButton: {
    padding: 5
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
    left: -10,
    color: "#fff"
  },
  alertContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    zIndex: 3
  },
  alertBox: {
    padding: 18,
    borderRadius: 12,
    minWidth: 220,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6
  },
  lightAlert: {
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1
  },
  darkAlert: {
    backgroundColor: "#1E1E1E",
    borderColor: "#444",
    borderWidth: 1
  },
  alertText: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "600",
    padding: 10
  },
  section: {
    backgroundColor: "#fff",
    padding: 18,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eee"
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginBottom: 6
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ddd"
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 8,
    color: "#333"
  },
  changeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  changeButtonText: {
    fontSize: 14,
    fontWeight: "bold"
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333"
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  optionText: {
    fontSize: 16,
    color: "#333"
  },
  optionValue: {
    fontSize: 16,
    fontWeight: "600"
  },
  resetButton: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 14, 
    minHeight: 50,      
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});