import { useContext, useState } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Contact.module.css"
import { ThemeContext } from "../../context/ThemeContext"
import { getUserId } from "../../lib/appwrite"

export default function Contact() {
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"
  const navigate = useNavigate()

  const [message, setMessage] = useState("")

  const handleSendMessage = async () => {
    if (!message.trim() || message.length < 10) {
      alert(`${i18n.t("login.error_title")}\n${i18n.t("contact.length_fail")}`)
      return
    }

    const userId = await getUserId()

    try {
      const response = await fetch("https://promodash.vercel.app/api/mail_message_webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, message }),
      })

      if (response.ok) {
        alert(`${i18n.t("forgot_password.success")}\n${i18n.t("contact.message_sent")}`)
        setMessage("")
      } else {
        alert(`${i18n.t("login.error_title")}\n${i18n.t("contact.wrong")}`)
      }
    } catch (err) {
      alert(`${i18n.t("login.error_title")}\n${i18n.t("contact.fail")}`)
    }
  }

  return (
    <div className={`${styles.container} ${isDark ? styles.darkContainer : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.darkHeader : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("contact.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <h3 className={`${styles.sectionTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("contact.need_assistance")}
        </h3>
        <p className={`${styles.paragraph} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("contact.support_info")}
        </p>

        <div className={`${styles.infoBox} ${isDark ? styles.darkInfoBox : ""}`}>
          <span className={`${styles.infoText} ${isDark ? styles.textGold : ""}`}>
            📧 promodashcs@gmail.com
          </span>
          <a href="mailto:promodashcs@gmail.com" className={styles.emailButton}>
            {i18n.t("contact.send_email")}
          </a>
        </div>

        <h3 className={`${styles.sectionTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("contact.send_message")}
        </h3>

        <textarea
          className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
          placeholder={i18n.t("contact.write_message")}
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={handleSendMessage} className={styles.submitButton}>
          <span className={styles.submitButtonText}>{i18n.t("contact.submit")}</span>
        </button>
      </div>
    </div>
  )
}
