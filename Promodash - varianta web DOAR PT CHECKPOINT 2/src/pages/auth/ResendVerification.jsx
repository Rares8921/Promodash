"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import i18n from "../../i18n"
import { FiMail, FiArrowLeft, FiRefreshCw } from "react-icons/fi"
import styles from "./css/ResendVerification.module.css"

export default function ResendVerification() {
  const router = useNavigate()
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  // Animation refs
  const fadeAnim = useRef(null)
  const slideAnim = useRef(null)
  const pulseAnim = useRef(null)

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

  const handleResendVerification = async () => {
    if (!email) {
      alert(i18n.t("resend_verification.enter_email"))
      return
    }

    setLoading(true)

    try {
      const sanitizedEmail = email.trim().toLowerCase()
      const response = await fetch("/api/send-verification-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: sanitizedEmail }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to resend verification email.")
      }

      alert(i18n.t("resend_verification.email_sent"))
      router("/auth/login")
    } catch (error) {
      alert(i18n.t("resend_verification.error_title") + ": " + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <div className={`${styles.contentContainer} ${styles.animateIn}`} ref={slideAnim}>
        <div className={styles.headerContainer}>
          <div className={`${styles.iconContainer} ${isDarkMode ? styles.dark : ""}`}>
            <FiMail size={32} color="#fff" />
          </div>
          <h1 className={`${styles.title} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("resend_verification.title")}</h1>
          <p className={`${styles.subtitle} ${isDarkMode ? styles.dark : ""}`}>
            {i18n.t("resend_verification.subtitle")}
          </p>
        </div>

        <div
          className={`${styles.inputContainer} ${isDarkMode ? styles.dark : ""} ${inputFocused ? styles.focused : ""}`}
        >
          <FiMail
            className={`${styles.inputIcon} ${inputFocused ? styles.focused : ""} ${isDarkMode && inputFocused ? styles.dark : ""}`}
          />
          <input
            className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
            placeholder={i18n.t("resend_verification.email_placeholder")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
          />
        </div>

        <div className={styles.buttonContainer} ref={pulseAnim}>
          <button
            className={`${styles.resendButton} ${isDarkMode ? styles.dark : ""}`}
            onClick={handleResendVerification}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <FiRefreshCw className={styles.loadingIcon} />
                <span className={styles.resendButtonText}>{i18n.t("resend_verification.sending")}</span>
              </div>
            ) : (
              <span className={styles.resendButtonText}>{i18n.t("resend_verification.button")}</span>
            )}
          </button>
        </div>

        <div className={styles.backContainer} onClick={() => router("/auth/login")}>
          <FiArrowLeft className={`${styles.backIcon} ${isDarkMode ? styles.dark : ""}`} />
          <span className={`${styles.backToLogin} ${isDarkMode ? styles.dark : ""}`}>
            {i18n.t("resend_verification.back_to_login")}
          </span>
        </div>
      </div>
    </div>
  )
}
