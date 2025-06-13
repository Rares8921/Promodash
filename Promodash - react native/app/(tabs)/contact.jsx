import { View, Text, TouchableOpacity, TextInput, ScrollView, StyleSheet, Alert, Keyboard } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { useContext, useState, useRef } from "react"
import { ThemeContext } from "../context/ThemeContext"
import * as Linking from "expo-linking"
import { getUserId } from "../../lib/appwrite"
import i18n from "../../i18n"
import RecaptchaWebView from "../../components/RecaptchaWebView"

export default function ContactInformationScreen() {
  const navigation = useNavigation()
  const { theme } = useContext(ThemeContext)

  const [message, setMessage] = useState("")
  const [showCaptcha, setShowCaptcha] = useState(false)
  const [recaptchaToken, setRecaptchaToken] = useState(null)

  const handleSendEmail = () => {
    const email = "promodashcs@gmail.com"
    Linking.openURL(`mailto:${email}`)
  }

  const handleSendMessage = async (tokenOverride = null) => {
    const token = tokenOverride || recaptchaToken
    if (!message.trim() || message.length < 10) {
      Alert.alert(i18n.t("login.error_title"), i18n.t("contact.length_fail"))
      return
    }

    if (!token) {
      setShowCaptcha(true)
      return
    }

    Keyboard.dismiss()
    setRecaptchaToken(null)

    const userId = await getUserId()
    try {
      const response = await fetch("https://promodash.vercel.app/api/mail_message_webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message, recaptchaToken: token }),
      })

      if (response.ok) {
        Alert.alert(i18n.t("forgot_password.success"), i18n.t("contact.message_sent"))
        setMessage("")
      } else {
        Alert.alert(i18n.t("login.error_title"), i18n.t("contact.wrong"))
      }
    } catch (error) {
      Alert.alert(i18n.t("login.error_title"), i18n.t("contact.fail"))
    }
  }

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {showCaptcha && (
        <View style={styles.captchaOverlay}>
          <RecaptchaWebView
            onVerify={(token) => {
              setRecaptchaToken(token)
              setShowCaptcha(false)
              setTimeout(() => handleSendMessage(token), 100)
            }}
          />
        </View>
      )}

      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>
          {i18n.t("contact.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("contact.need_assistance")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("contact.support_info")}
        </Text>

        <View style={[styles.infoBox, theme === "Dark" && styles.darkInfoBox]}>
          <Ionicons name="mail-outline" size={22} color={theme === "Dark" ? "#FFD700" : "#2575fc"} />
          <Text style={[styles.infoText, theme === "Dark" && styles.darkInfoText]}>
            promodashcs@gmail.com
          </Text>
          <TouchableOpacity
            onPress={handleSendEmail}
            style={[styles.emailButton, theme === "Dark" && { backgroundColor: "#FFD700" }]}
          >
            <Text style={[styles.emailButtonText, theme === "Dark" && { color: "#000" }]}>
              {i18n.t("contact.send_email")}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("contact.send_message")}
        </Text>
        <TextInput
          style={[styles.input, theme === "Dark" && styles.darkInput]}
          placeholder={i18n.t("contact.write_message")}
          placeholderTextColor={theme === "Dark" ? "#999" : "#666"}
          multiline
          numberOfLines={5}
          value={message}
          onChangeText={setMessage}
        />
        <TouchableOpacity
          onPress={() => handleSendMessage()}
          style={[styles.submitButton, theme === "Dark" && { backgroundColor: "#FFD700" }]}
        >
          <Text style={[styles.submitButtonText, theme === "Dark" && { color: "#000" }]}>
            {i18n.t("contact.submit")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFC" },
  darkContainer: { backgroundColor: "#121212" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
  },
  darkHeader: { backgroundColor: "#1E1E1E" },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center", flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 20 },
  paragraph: { fontSize: 16, color: "#444", marginBottom: 10, lineHeight: 22 },
  darkParagraph: { color: "#BBB" },
  infoBox: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  darkInfoBox: { backgroundColor: "#1E1E1E" },
  infoText: { fontSize: 16, fontWeight: "bold", color: "#2575fc", marginTop: 5 },
  darkInfoText: { color: "#FFD700" },
  emailButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginTop: 10,
  },
  emailButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  input: {
    backgroundColor: "#f5f5f5",
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    marginTop: 10,
  },
  darkInput: { backgroundColor: "#1E1E1E", color: "#FFF" },
  submitButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    alignItems: "center",
    elevation: 4,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  captchaOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
})
