import { useState, useContext } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Animated, Easing, Keyboard } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useNavigation } from "@react-navigation/native"
import { ThemeContext } from "../context/ThemeContext"
import { UserContext } from "../context/UserContext"
import { sendRequest } from "../../lib/appwrite"
import * as ImagePicker from "expo-image-picker"
import i18n from "../../i18n"
import * as FileSystem from "expo-file-system"
import RecaptchaWebView from "../../components/RecaptchaWebView"

export default function CreateRequestScreen() {
  const navigation = useNavigation()
  const { theme } = useContext(ThemeContext)
  const { user, loading } = useContext(UserContext)

  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [recaptchaToken, setRecaptchaToken] = useState(null)
  const [showCaptcha, setShowCaptcha] = useState(false)

  const fadeAnim = useState(new Animated.Value(0))[0]
  const fadeSuccessAnim = useState(new Animated.Value(0))[0]

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== "granted") {
      showError(i18n.t("create_request.gallery_permission"))
    }
    return true
  }

  const pickImage = async () => {
    if (!requestGalleryPermission()) return

    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      })

      if (!result.canceled) {
        const fileSize = result.assets[0].fileSize / (1024 * 1024)
        if (fileSize > 8) {
          showError(i18n.t("create_request.image_error"))
          return
        }
        setImage(result.assets[0].uri)
        setError("")
      }
    } catch {
      showError(i18n.t("create_request.image_fail"))
    }
  }

  const showError = (message) => {
    setError(message)
    fadeAnim.setValue(0)
    Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start()
    setTimeout(() => {
      Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setError(""))
    }, 3000)
  }

  const showSuccess = async (message) => {
    setSuccessMessage(message)
    fadeSuccessAnim.setValue(0)
    Animated.timing(fadeSuccessAnim, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start()
    setTimeout(() => {
      Animated.timing(fadeSuccessAnim, { toValue: 0, duration: 300, easing: Easing.inOut(Easing.ease), useNativeDriver: true }).start(() => {
        setSuccessMessage("")
        navigation.goBack()
      })
    }, 2500)
  }

  const startCaptcha = () => {
    setRecaptchaToken(null)
    setShowCaptcha(true)
  }

  const handleVerified = async (token) => {
    setShowCaptcha(false)
    Keyboard.dismiss()

    if (subject.length < 5) {
      showError(i18n.t("create_request.subject_min"))
      return
    } else if (subject.length > 100) {
      showError(i18n.t("create_request.subject_max"))
      return
    }

    if (description.length < 10) {
      showError(i18n.t("create_request.description_min"))
      return
    } else if (description.length > 1000) {
      showError(i18n.t("create_request.description_max"))
      return
    }

    try {
      if (!user || !user.email) {
        showError(i18n.t("create_request.user_not_loaded"))
        return
      }

      let imageUrl = null
      if (image) {
        const fileInfo = await FileSystem.getInfoAsync(image)
        const ext = fileInfo.uri.split(".").pop().toLowerCase()
        const mime = ext === "png" ? "image/png" : "image/jpg"
        const base64 = await FileSystem.readAsStringAsync(image, { encoding: FileSystem.EncodingType.Base64 })
        imageUrl = `data:${mime};base64,${base64}`
      }

      const newRequest = {
        id: Date.now().toString(),
        email: user.email,
        subject,
        description,
        image: imageUrl,
        dateCreated: new Date().toISOString(),
        status: "pending",
        recaptchaToken: token,
      }

      if (await sendRequest(newRequest)) {
        showSuccess(i18n.t("create_request.request_success"))
      }
    } catch (err) {
      showError(i18n.t("create_request.request_fail"))
    }
  }

  if (loading) {
    return (
      <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
        <Text style={{ textAlign: "center", marginTop: 20, color: theme === "Dark" ? "#fff" : "#000" }}>
          {i18n.t("general.loading")}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {showCaptcha && (
        <View style={styles.captchaOverlay}>
          <RecaptchaWebView
            onVerify={(token) => {
              setRecaptchaToken(token)
              handleVerified(token)
            }}
          />
        </View>
      )}

      {error ? (
        <View style={alertStyles.alertContainer}>
          <Animated.View style={[alertStyles.errorBox, { opacity: fadeAnim }]}>
            <Text style={alertStyles.errorText}>{error}</Text>
          </Animated.View>
        </View>
      ) : null}

      {successMessage ? (
        <View style={alertStyles.alertContainer}>
          <Animated.View style={[alertStyles.successBox, { opacity: fadeSuccessAnim }]}>
            <Text style={alertStyles.successText}>{successMessage}</Text>
          </Animated.View>
        </View>
      ) : null}

      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: "#fff" }]}>{i18n.t("create_request.title")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.label, theme === "Dark" && { color: "#FFD700" }]}>{i18n.t("create_request.subject")}</Text>
        <TextInput
          style={[styles.input, theme === "Dark" && styles.darkInput]}
          placeholder={i18n.t("create_request.enter_subject")}
          placeholderTextColor={theme === "Dark" ? "#999" : "#aaa"}
          value={subject}
          onChangeText={setSubject}
        />

        <Text style={[styles.label, theme === "Dark" && { color: "#FFD700" }]}>{i18n.t("create_request.description")}</Text>
        <TextInput
          style={[styles.textarea, theme === "Dark" && styles.darkTextarea]}
          placeholder={i18n.t("create_request.enter_details")}
          placeholderTextColor={theme === "Dark" ? "#999" : "#aaa"}
          multiline
          numberOfLines={5}
          value={description}
          onChangeText={setDescription}
        />

        <TouchableOpacity
          style={[styles.imageButton, theme === "Dark" && { backgroundColor: "#FFD700" }]}
          onPress={pickImage}
        >
          <Text style={[styles.imageButtonText, theme === "Dark" && { color: "#000" }]}>
            {i18n.t("create_request.attach_image")}
          </Text>
        </TouchableOpacity>

        {image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image, cache: "force-cache" }} style={styles.previewImage} resizeMode="contain" />
            <TouchableOpacity style={styles.deleteIcon} onPress={() => setImage(null)}>
              <Text style={styles.deleteIconText}>X</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, theme === "Dark" && { backgroundColor: "#FFD700" }]}
          onPress={startCaptcha}
        >
          <Text style={[styles.submitButtonText, theme === "Dark" && { color: "#000" }]}>
            {i18n.t("create_request.submit_request")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFC", paddingBottom: 20 },
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
  label: { fontSize: 16, fontWeight: "bold", color: "#333", marginTop: 15 },
  input: { backgroundColor: "#fff", padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "#ddd" },
  darkInput: { backgroundColor: "#1E1E1E", color: "#FFD700", borderColor: "#444" },
  textarea: { backgroundColor: "#fff", padding: 10, borderRadius: 5, borderWidth: 1, borderColor: "#ddd", height: 100 },
  darkTextarea: { backgroundColor: "#1E1E1E", color: "#FFD700", borderColor: "#444" },
  submitButton: { backgroundColor: "#2575fc", padding: 15, borderRadius: 10, alignItems: "center", marginTop: 20 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  imageButton: { backgroundColor: "#2575fc", padding: 10, borderRadius: 5, marginBottom: 10, marginTop: 20 },
  imageButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  imageContainer: { position: "relative", width: "100%", height: 150, marginTop: 10, borderRadius: 10, overflow: "hidden" },
  previewImage: { width: "100%", height: "100%", borderRadius: 10 },
  deleteIcon: { position: "absolute", top: 5, right: 5, backgroundColor: "red", width: 24, height: 24, borderRadius: 12, alignItems: "center", justifyContent: "center", zIndex: 10 },
  deleteIconText: { color: "#fff", fontWeight: "bold", fontSize: 14 },
  captchaOverlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "center", alignItems: "center", zIndex: 999 },
})

const alertStyles = StyleSheet.create({
  alertContainer: { position: "absolute", top: 50, left: 0, right: 0, alignItems: "center", zIndex: 2000 },
  errorBox: { backgroundColor: "#ff4d4d", padding: 10, borderRadius: 5, width: "90%", alignItems: "center" },
  errorText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  successBox: { backgroundColor: "#4CAF50", padding: 10, borderRadius: 5, width: "90%", alignItems: "center" },
  successText: { color: "#fff", fontSize: 14, fontWeight: "bold" },
})
