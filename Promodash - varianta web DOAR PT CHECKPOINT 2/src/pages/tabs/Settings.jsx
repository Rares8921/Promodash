import { useState, useEffect, useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { LanguageContext } from "../../context/LanguageContext"
import { updateUserData } from "../../lib/appwrite"
import i18n from "../../i18n"
import styles from "./css/Settings.module.css"

export default function Settings() {
  const navigate = useNavigate()

  const { user, setUser, loading } = useContext(UserContext)
  const { theme, toggleTheme } = useContext(ThemeContext)
  const { language, changeLanguage } = useContext(LanguageContext)

  // State-uri locale pentru user settings
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [appTheme, setAppTheme] = useState("Light")
  const [notifications, setNotifications] = useState(false)

  // Alert personalizat
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [fadeAnimAlert, setFadeAnimAlert] = useState(false)

  // Animare header (fade in)
  const [fadeAnimHeader, setFadeAnimHeader] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setAppTheme(user.theme || "Light")
      setNotifications(user.notifications || false)
      if (user.theme && user.theme !== theme) {
        toggleTheme(user.theme)
      }
    }

    // Simulate fade in animation
    setFadeAnimHeader(true)
  }, [user])

  const showCustomAlert = (message) => {
    setAlertMessage(message.charAt(0).toUpperCase() + message.slice(1))
    setAlertVisible(true)
    setFadeAnimAlert(true)

    setTimeout(() => hideCustomAlert(), 3000)
  }

  const hideCustomAlert = () => {
    setFadeAnimAlert(false)
    setTimeout(() => setAlertVisible(false), 300)
  }

  const validateEmail = (emailValue) => {
    const emailRegex =
      /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
    return emailRegex.test(emailValue)
  }

  const handleUpdate = async (field, value) => {
    if (field === "Name" && value.length < 3) {
      showCustomAlert(i18n.t("settings.alerts.name_too_short"))
      return
    }
    if (field === "email" && !validateEmail(value)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"))
      return
    }

    // Trimite update la backend
    const success = await updateUserData(field, value)
    if (success) {
      setUser((prevUser) => {
        if (!prevUser) return null
        return {
          ...prevUser,
          [field.toLowerCase()]: value,
        }
      })

      showCustomAlert(
        i18n.t("settings.alerts.update_success", {
          field: i18n.t(`settings.${field.toLowerCase()}`),
        }),
      )
    }
  }

  const handleThemeChange = () => {
    const newTheme = appTheme === "Light" ? "Dark" : "Light"
    setAppTheme(newTheme)

    handleUpdate("Theme", newTheme)

    toggleTheme(newTheme)
  }

  const handleNotificationsChange = () => {
    const newNotificationStatus = !notifications
    setNotifications(newNotificationStatus)
    handleUpdate("Notifications", newNotificationStatus)
  }

  const handleLanguageChange = async () => {
    const newLanguage = language === "en" ? "ro" : "en"
    changeLanguage(newLanguage)
    i18n.locale = newLanguage

    showCustomAlert(i18n.t("settings.alerts.update_success", { field: i18n.t("settings.language") }))
  }

  const handleUpdateEmail = async () => {
    if (!validateEmail(email)) {
      showCustomAlert(i18n.t("settings.alerts.invalid_email"))
      return
    }

    fetch(`https://promodash.vercel.app/api/send_email_change_confirmation_current_webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        currentEmail: user.email,
        newEmail: email,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          showCustomAlert("Email de confirmare trimis către adresa curentă.")
        } else {
          showCustomAlert("Eroare la trimiterea emailului de confirmare.")
        }
      })
      .catch((error) => {
        console.error("Eroare:", error)
        showCustomAlert("Eroare la trimiterea emailului de confirmare.")
      })
  }

  if (loading) {
    return (
      <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
        <p className={`${styles.loadingText} ${theme === "Dark" ? styles.darkText : ""}`}>
          {i18n.t("settings.loading")}
        </p>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      <div className={styles.scrollContainer}>
        {/* Header cu fade-in */}
        <div
          className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""} ${
            fadeAnimHeader ? styles.fadeIn : ""
          }`}
        >
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            <i className={`${styles.icon} ${theme === "Dark" ? styles.darkIcon : ""}`}>arrow_back</i>
          </button>
          <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
            {i18n.t("settings.title")}
          </h1>
        </div>

        {/* User Info */}
        <div className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}>
          <label className={`${styles.label} ${theme === "Dark" ? styles.darkLabel : ""}`}>
            {i18n.t("settings.name")}
          </label>
          <div className={styles.inputContainer}>
            <input
              className={`${styles.input} ${theme === "Dark" ? styles.darkInput : ""}`}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <button className={styles.changeButton} onClick={() => handleUpdate("Name", name)}>
              <span className={`${styles.changeButtonText} ${theme === "Dark" ? styles.darkChangeButtonText : ""}`}>
                {i18n.t("settings.save")}
              </span>
            </button>
          </div>
        </div>

        <div className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}>
          <label className={`${styles.label} ${theme === "Dark" ? styles.darkLabel : ""}`}>
            {i18n.t("settings.email")}
          </label>
          <div className={styles.inputContainer}>
            <input
              className={`${styles.input} ${theme === "Dark" ? styles.darkInput : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button className={styles.changeButton} onClick={handleUpdateEmail}>
              <span className={`${styles.changeButtonText} ${theme === "Dark" ? styles.darkChangeButtonText : ""}`}>
                {i18n.t("settings.save")}
              </span>
            </button>
          </div>
        </div>

        {/* Theme Selection */}
        <div className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}>
          <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
            {i18n.t("settings.app_settings")}
          </h2>
          <div className={styles.optionItem} onClick={handleThemeChange}>
            <span className={`${styles.optionText} ${theme === "Dark" ? styles.darkOptionText : ""}`}>
              {i18n.t("settings.theme")}
            </span>
            <span className={`${styles.optionValue} ${theme === "Dark" ? styles.darkOptionValue : ""}`}>
              {appTheme}
            </span>
          </div>
        </div>

        {/* Notifications Toggle */}
        <div className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}>
          <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
            {i18n.t("settings.notifications")}
          </h2>
          <div className={styles.optionItem}>
            <span className={`${styles.optionText} ${theme === "Dark" ? styles.darkOptionText : ""}`}>
              {i18n.t("settings.enable_notifications")}
            </span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={notifications}
                onChange={handleNotificationsChange}
                className={styles.switchInput}
              />
              <span className={`${styles.slider} ${notifications ? styles.sliderActive : ""}`}></span>
            </label>
          </div>
        </div>

        {/* Language */}
        <div className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}>
          <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
            {i18n.t("settings.language")}
          </h2>
          <div className={styles.optionItem} onClick={handleLanguageChange}>
            <span className={`${styles.optionText} ${theme === "Dark" ? styles.darkOptionText : ""}`}>
              {i18n.t("settings.language")}
            </span>
            <span className={`${styles.optionValue} ${theme === "Dark" ? styles.darkOptionValue : ""}`}>
              {language === "en" ? i18n.t("settings.english") : i18n.t("settings.romanian")}
            </span>
          </div>
        </div>

        <div
          className={`${styles.section} ${theme === "Dark" ? styles.darkSection : ""}`}
          onClick={() => {
            navigate("/forgot-password")
          }}
        >
          <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
            Reset Password
          </h2>
        </div>

        {/* Custom Alert */}
        {alertVisible && (
          <div className={styles.alertContainer} onClick={hideCustomAlert}>
            <div
              className={`${styles.alertBox} ${theme === "Dark" ? styles.darkAlert : styles.lightAlert} ${
                fadeAnimAlert ? styles.fadeIn : styles.fadeOut
              }`}
            >
              <p className={`${styles.alertText} ${theme === "Dark" ? styles.darkAlertText : ""}`}>{alertMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
