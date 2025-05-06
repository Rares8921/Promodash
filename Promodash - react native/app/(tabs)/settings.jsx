import { useState, useEffect, useContext } from "react";
import {
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
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router"
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { updateUserData } from "../../lib/appwrite";
import i18n from "../../i18n";
import { LanguageContext } from "../context/LanguageContext";

export default function SettingsScreen() {
  const navigation = useNavigation();

  const { user, setUser, loading } = useContext(UserContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { language, changeLanguage } = useContext(LanguageContext);

  const router = useRouter();

  // State-uri locale pentru user settings
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [appTheme, setAppTheme] = useState("Light");
  const [notifications, setNotifications] = useState(false);

  // Alert personalizat
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const fadeAnimAlert = useState(new Animated.Value(0))[0];

  // Animare header (fade in)
  const fadeAnimHeader = useState(new Animated.Value(0))[0];

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setAppTheme(user.theme || "Light");
      setNotifications(user.notifications || false);
      if (user.theme && user.theme !== theme) {
        toggleTheme(user.theme);
      }
    }


    Animated.timing(fadeAnimHeader, {
      toValue: 1,
      duration: 500,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true
    }).start();
  }, [user]);

  const showCustomAlert = (message) => {
    setAlertMessage(message.charAt(0).toUpperCase() + message.slice(1));
    setAlertVisible(true);
    fadeAnimAlert.setValue(0);

    Animated.timing(fadeAnimAlert, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();

    setTimeout(() => hideCustomAlert(), 3000);
  };

  const hideCustomAlert = () => {
    Animated.timing(fadeAnimAlert, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true
    }).start(() => setAlertVisible(false));
  };

  const validateEmail = (emailValue) => {
    const emailRegex =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return emailRegex.test(emailValue);
  };

  const handleUpdate = async (field, value) => {
    if (field === "Name" && value.length < 3) {
      showCustomAlert(i18n.t("settings.alerts.name_too_short"));
      return;
    }
    if (field === "email" && !validateEmail(value)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"));
      return;
    }

    // Trimite update la backend
    const success = await updateUserData(field, value);
    if (success) {
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
  };

  const handleThemeChange = () => {
    const newTheme = appTheme === "Light" ? "Dark" : "Light";
    setAppTheme(newTheme);

    handleUpdate("Theme", newTheme);

    toggleTheme(newTheme);
  };

  const handleNotificationsChange = () => {
    const newNotificationStatus = !notifications;
    setNotifications(newNotificationStatus);
    handleUpdate("Notifications", newNotificationStatus);
  };

  const handleLanguageChange = async () => {
    const newLanguage = language === "en" ? "ro" : "en";
    changeLanguage(newLanguage);
    i18n.locale = newLanguage;

    showCustomAlert(
      i18n.t("settings.alerts.update_success", { field: i18n.t("settings.language") })
    );
  };

  const handleUpdateEmail = async () => {
    if (!validateEmail(email)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"));
      return;
    }
      
    fetch(`https://promodash.vercel.app/api/send_email_change_confirmation_current_webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        currentEmail: user.email,
        newEmail: email
      })
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        showCustomAlert("Email de confirmare trimis către adresa curentă.");
      } else {
        showCustomAlert("Eroare la trimiterea emailului de confirmare.");
      }
    })
    .catch((error) => {
      console.error("Eroare:", error);
      showCustomAlert("Eroare la trimiterea emailului de confirmare.");
    });
  };

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
        {/* Header cu fade-in */}
        <Animated.View style={{ opacity: fadeAnimHeader }}>
          <LinearGradient
            colors={theme === "Dark" ? ["#121212", "#1E1E1E"] : ["#2575fc", "#4c8bf5"]}
            style={styles.header}
          >
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={26} color={"#fff"} />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {i18n.t("settings.title")}
            </Text>

            <TouchableOpacity onPress={() => {}} style={styles.settingsButton}>
              <Ionicons name="settings-outline" size={24} color={"#fff"} />
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>

        {/* User Info */}
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
            />
            <TouchableOpacity style={styles.changeButton} onPress={() => handleUpdate("Name", name)}>
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
            />
            <TouchableOpacity style={styles.changeButton} onPress={handleUpdateEmail}>
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

        {/* Theme Selection */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.app_settings")}
          </Text>
          <TouchableOpacity style={styles.optionItem} onPress={handleThemeChange}>
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.theme")}
            </Text>
            <Text style={[styles.optionValue, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
              {appTheme}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Toggle */}
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
            />
          </View>
        </View>

        {/* Language */}
        <View
          style={[
            styles.section,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
            {i18n.t("settings.language")}
          </Text>
          <TouchableOpacity style={styles.optionItem} onPress={handleLanguageChange}>
            <Text style={[styles.optionText, theme === "Dark" && { color: "#fff" }]}>
              {i18n.t("settings.language")}
            </Text>
            <Text style={[styles.optionValue, { color: theme === "Dark" ? "#FFD700" : "#2575fc" }]}>
              {language === "en" ? i18n.t("settings.english") : i18n.t("settings.romanian")}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.section,
            styles.resetButton,
            theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }
          ]}
          onPress={() => {
            router.push("/(auth)/forgot-password");
          }}
        >
          <Text style={[styles.resetButtonText, theme === "Dark" && { color: "#FFD700" }]}>
            {i18n.t("settings.reset_password")}
          </Text>
        </TouchableOpacity>

        {/* Custom Alert */}
        {alertVisible && (
          <Pressable style={styles.alertContainer} onPress={hideCustomAlert}>
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
      </ScrollView>
    </View>
  );
}

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
