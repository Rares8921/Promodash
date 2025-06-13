"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { createUser, checkUserExists } from "../../lib/appwrite"
import i18n from "../../i18n"
import { FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus, FiInfo } from "react-icons/fi"
import styles from "./css/Signup.module.css"
import validator from "validator"

export default function Signup() {
  const fadeAnimAlert = useRef(null)
  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const { setUser } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"

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

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const inviteCode = searchParams.get("inviteCode") || ""

  useEffect(() => {
    if (alertVisible && fadeAnimAlert.current) {
      fadeAnimAlert.current.style.opacity = 1
      fadeAnimAlert.current.style.transform = "translateY(0)"
    }
  }, [alertVisible])

  const showCustomAlert = (message) => {
    setAlertMessage(message)
    setAlertVisible(true)

    setTimeout(() => {
      hideCustomAlert()
    }, 3000)
  }

  const hideCustomAlert = () => {
    if (fadeAnimAlert.current) {
      fadeAnimAlert.current.style.opacity = 0
      fadeAnimAlert.current.style.transform = "translateY(-20px)"

      setTimeout(() => {
        setAlertVisible(false)
      }, 300)
    } else {
      setAlertVisible(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      // For web, we'll redirect to the Google OAuth endpoint with invite code
      window.location.href = inviteCode ? `/api/oauth/google?inviteCode=${inviteCode}` : "/api/oauth/google"
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

    try {
      const userExists = await checkUserExists(form.email)
      if (userExists) {
        return showCustomAlert(i18n.t("signup.error_email_in_use"))
      }

      const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/
      if (!passwordRegex.test(form.password)) {
        return showCustomAlert(i18n.t("signup.password_fail"))
      }

      setSubmitting(true)

      const sanitizedEmail = validator.normalizeEmail(form.email) || form.email
      const sanitizedPassword = form.password // No need to escape in web context

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
        await fetch("/api/send-verification-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: sanitizedEmail }),
        })
      } else {
        showCustomAlert(i18n.t("signup.google_account_created_successfully"))
      }

      navigate("/auth/login")
    } catch (error) {
      showCustomAlert(error.message || i18n.t("signup.error_generic"))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={`${styles.iconContainer} ${isDarkMode ? styles.dark : ""}`}>
            <FiUserPlus size={32} color="#fff" />
          </div>
          <h1 className={`${styles.title} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("signup.title")}</h1>
          <p className={`${styles.subtitle} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("signup.subtitle")}</p>
        </div>

        {/* Form */}
        <div className={styles.inputContainer}>
          {/* Email */}
          <div
            className={`${styles.inputWrapper} ${isDarkMode ? styles.dark : ""} ${focusedInput === "email" ? styles.focused : ""}`}
          >
            <FiMail
              className={`${styles.icon} ${focusedInput === "email" ? styles.focused : ""} ${isDarkMode && focusedInput === "email" ? styles.dark : ""}`}
            />
            <input
              className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
              placeholder={i18n.t("signup.email")}
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              onFocus={() => setFocusedInput("email")}
              onBlur={() => setFocusedInput(null)}
              disabled={googleSignUp}
            />
          </div>

          {/* Password */}
          <div
            className={`${styles.inputWrapper} ${isDarkMode ? styles.dark : ""} ${focusedInput === "password" ? styles.focused : ""}`}
          >
            <FiLock
              className={`${styles.icon} ${focusedInput === "password" ? styles.focused : ""} ${isDarkMode && focusedInput === "password" ? styles.dark : ""}`}
            />
            <input
              className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
              placeholder={i18n.t("signup.password")}
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              onFocus={() => setFocusedInput("password")}
              onBlur={() => setFocusedInput(null)}
            />
            <div onClick={() => setShowPassword(!showPassword)} style={{ cursor: "pointer" }}>
              {showPassword ? (
                <FiEyeOff
                  className={`${styles.icon} ${focusedInput === "password" ? styles.focused : ""} ${isDarkMode && focusedInput === "password" ? styles.dark : ""}`}
                />
              ) : (
                <FiEye
                  className={`${styles.icon} ${focusedInput === "password" ? styles.focused : ""} ${isDarkMode && focusedInput === "password" ? styles.dark : ""}`}
                />
              )}
            </div>
          </div>

          {/* Confirm Password */}
          <div
            className={`${styles.inputWrapper} ${isDarkMode ? styles.dark : ""} ${focusedInput === "confirmPassword" ? styles.focused : ""}`}
          >
            <FiLock
              className={`${styles.icon} ${focusedInput === "confirmPassword" ? styles.focused : ""} ${isDarkMode && focusedInput === "confirmPassword" ? styles.dark : ""}`}
            />
            <input
              className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
              placeholder={i18n.t("signup.confirm_password")}
              type={showConfirmPassword ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              onFocus={() => setFocusedInput("confirmPassword")}
              onBlur={() => setFocusedInput(null)}
            />
            <div onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ cursor: "pointer" }}>
              {showConfirmPassword ? (
                <FiEyeOff
                  className={`${styles.icon} ${focusedInput === "confirmPassword" ? styles.focused : ""} ${isDarkMode && focusedInput === "confirmPassword" ? styles.dark : ""}`}
                />
              ) : (
                <FiEye
                  className={`${styles.icon} ${focusedInput === "confirmPassword" ? styles.focused : ""} ${isDarkMode && focusedInput === "confirmPassword" ? styles.dark : ""}`}
                />
              )}
            </div>
          </div>
        </div>

        {/* Signup Button */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.button} ${isDarkMode ? styles.dark : ""}`}
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? (
              <div className={styles.loadingContainer}>
                <svg className={styles.loadingIcon} width="20" height="20" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" />
                </svg>
                <span className={styles.buttonText}>...</span>
              </div>
            ) : (
              <span className={styles.buttonText}>{i18n.t("signup.signup_button")}</span>
            )}
          </button>
        </div>

        {/* Or sign up with google */}
        <div className={`${styles.orText} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("signup.orlogin")}</div>

        <div className={`${styles.googleButton} ${isDarkMode ? styles.dark : ""}`} onClick={handleGoogleSignUp}>
          <div className={styles.googleGradientBorder}></div>
          <div className={`${styles.googleButtonInner} ${isDarkMode ? styles.dark : ""}`}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
              />
              <path
                fill="#34A853"
                d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2970142 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
              />
              <path
                fill="#4A90E2"
                d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
              />
              <path
                fill="#FBBC05"
                d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
              />
            </svg>
          </div>
        </div>

        {/* Already have an account? => login */}
        <div className={styles.loginLinkContainer} onClick={() => navigate("/auth/login")}>
          <span className={`${styles.loginText} ${isDarkMode ? styles.dark : ""}`}>
            {i18n.t("signup.already_account")}{" "}
            <span className={`${styles.boldLink} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("signup.login")}</span>
          </span>
        </div>

        {alertVisible && (
          <div className={styles.alertContainer} onClick={hideCustomAlert}>
            <div
              ref={fadeAnimAlert}
              className={`${styles.alertBox} ${isDarkMode ? styles.darkAlert : styles.lightAlert}`}
              style={{ opacity: 0, transform: "translateY(20px)" }}
            >
              <FiInfo className={`${styles.alertIcon} ${isDarkMode ? styles.dark : ""}`} />
              <span className={`${styles.alertText} ${isDarkMode ? styles.dark : ""}`}>{alertMessage}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
