"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { resetPassword } from "../../lib/appwrite"
import i18n from "../../i18n"
import { ThemeContext } from "../../context/ThemeContext"
import { FiUnlock, FiMail, FiArrowLeft, FiRefreshCw } from "react-icons/fi"
import styles from "./css/ForgotPassword.module.css"

export default function ForgotPassword() {
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  // Animation refs
  const fadeAnim = useRef(null)
  const slideAnim = useRef(null)

  useEffect(() => {
    // Set a small timeout to ensure the DOM is ready
    const timer = setTimeout(() => {
      if (slideAnim.current) {
        slideAnim.current.style.opacity = 1
        slideAnim.current.style.transform = "translateY(0)"
      }
    }, 50)

    return () => clearTimeout(timer)
  }, [])

  const handleResetPassword = async () => {
    if (!email) {
      alert(i18n.t("forgot_password.missing_email"))
      return
    }

    setLoading(true)
    try {
      await resetPassword(email)
      alert(i18n.t("forgot_password.success_message"))
      navigate("/auth/login")
    } catch (error) {
      alert(i18n.t("forgot_password.fail_message"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <div className={`${styles.inner} ${styles.animateIn}`} ref={slideAnim}>
        <div className={styles.header}>
          <div className={`${styles.iconContainer} ${isDarkMode ? styles.dark : ""}`}>
            <FiUnlock size={32} color="#fff" />
          </div>
          <h1 className={`${styles.title} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("forgot_password.title")}</h1>
          <p className={`${styles.subtitle} ${isDarkMode ? styles.dark : ""}`}>
            Enter your email to reset your password
          </p>
        </div>

        {/* Input pentru Email */}
        <div
          className={`${styles.inputWrapper} ${isDarkMode ? styles.dark : ""} ${inputFocused ? styles.focused : ""}`}
        >
          <FiMail
            className={`${styles.icon} ${inputFocused ? styles.focused : ""} ${isDarkMode && inputFocused ? styles.dark : ""}`}
          />
          <input
            className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
            placeholder={i18n.t("forgot_password.enter")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </div>

        {/* Reset Password Button */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${isDarkMode ? styles.dark : ""}`}
            onClick={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <FiRefreshCw className={styles.loadingIcon} />
                <span className={styles.buttonText}>{i18n.t("forgot_password.sending")}</span>
              </div>
            ) : (
              <span className={styles.buttonText}>{i18n.t("forgot_password.send")}</span>
            )}
          </button>
        </div>

        {/* Back to Login */}
        <div className={styles.backButton} onClick={() => navigate("/auth/login")}>
          <FiArrowLeft className={`${styles.backIcon} ${isDarkMode ? styles.dark : ""}`} />
          <span className={`${styles.linkText} ${isDarkMode ? styles.dark : ""}`}>
            {i18n.t("forgot_password.back_to_login")}
          </span>
        </div>
      </div>
    </div>
  )
}
