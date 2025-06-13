"use client"

import { useState, useContext, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { signIn, logout, isVerified, getUserData } from "../../lib/appwrite"
import i18n from "../../i18n"
import { FiMail, FiLock, FiEye, FiEyeOff, FiRefreshCw, FiLogIn, FiInfo } from "react-icons/fi"
import styles from "./css/Login.module.css"

export default function Login() {
  const navigate = useNavigate()
  const { setUser } = useContext(UserContext)
  const { theme } = useContext(ThemeContext)
  const isDarkMode = theme === "Dark"

  // Animation refs
  const fadeAnimAlert = useRef(null)

  const [alertVisible, setAlertVisible] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState(null)

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

  const handleForgotPassword = () => {
    navigate("/auth/forgot-password")
  }

  const handleResendVerification = () => {
    navigate("/auth/resend-verification")
  }

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = "/api/oauth/google"
    } catch (error) {
      console.error("Google Login Error:", error)
      showCustomAlert(error.message || i18n.t("login.error_generic"))
    }
  }

  const handleLogin = async () => {
    if (loading) return
    if (!email || !password) {
      showCustomAlert(i18n.t("login.fields_required"))
      return
    }

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
        const userData = await getUserData()
        setUser(userData)
        navigate("/dashboard")
      }
    } catch (error) {
      console.log(error)
      showCustomAlert(error.message || i18n.t("login.error_title"))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${styles.container} ${isDarkMode ? styles.dark : ""}`}>
      <div className={styles.contentContainer}>
        <div className={styles.headerContainer}>
          <div className={`${styles.iconContainer} ${isDarkMode ? styles.dark : ""}`}>
            <FiLogIn size={32} color="#fff" />
          </div>
          <h1 className={`${styles.title} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("login.title")}</h1>
        </div>

        {/* Email Input */}
        <div
          className={`${styles.inputContainer} ${isDarkMode ? styles.dark : ""} ${focusedInput === "email" ? styles.focused : ""}`}
        >
          <FiMail
            className={`${styles.inputIcon} ${focusedInput === "email" ? styles.focused : ""} ${isDarkMode && focusedInput === "email" ? styles.dark : ""}`}
          />
          <input
            className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
            placeholder={i18n.t("login.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onFocus={() => setFocusedInput("email")}
            onBlur={() => setFocusedInput(null)}
          />
        </div>

        {/* Password Input */}
        <div
          className={`${styles.inputContainer} ${isDarkMode ? styles.dark : ""} ${focusedInput === "password" ? styles.focused : ""}`}
        >
          <FiLock
            className={`${styles.inputIcon} ${focusedInput === "password" ? styles.focused : ""} ${isDarkMode && focusedInput === "password" ? styles.dark : ""}`}
          />
          <input
            className={`${styles.input} ${isDarkMode ? styles.dark : ""}`}
            placeholder={i18n.t("login.password")}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onFocus={() => setFocusedInput("password")}
            onBlur={() => setFocusedInput(null)}
          />

          <div
            className={`${styles.eyeIcon} ${focusedInput === "password" ? styles.focused : ""} ${isDarkMode && focusedInput === "password" ? styles.dark : ""}`}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </div>
        </div>

        {/* Forgot Password & Resend Verification */}
        <div className={styles.forgotContainer}>
          <div
            className={`${styles.forgotPasswordText} ${isDarkMode ? styles.dark : ""}`}
            onClick={handleForgotPassword}
          >
            {i18n.t("login.forgot-password")}
          </div>

          <div
            className={`${styles.forgotPasswordText} ${isDarkMode ? styles.dark : ""}`}
            onClick={handleResendVerification}
          >
            {i18n.t("login.resend_verification")}
          </div>
        </div>

        {/* Login Button */}
        <div className={styles.buttonContainer}>
          <button
            className={`${styles.loginButton} ${isDarkMode ? styles.dark : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className={styles.loadingContainer}>
                <FiRefreshCw className={styles.loadingIcon} />
                <span className={styles.loginButtonText}>{i18n.t("login.loading")}</span>
              </div>
            ) : (
              <span className={styles.loginButtonText}>{i18n.t("login.login_button")}</span>
            )}
          </button>
        </div>

        {/* Separator & "You can also log in with:" */}
        <div className={`${styles.orText} ${isDarkMode ? styles.dark : ""}`}>{i18n.t("login.orlogin")}</div>

        {/* Google Login */}
        <div className={`${styles.googleButton} ${isDarkMode ? styles.dark : ""}`} onClick={handleGoogleSignIn}>
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

        {/* Register */}
        <div className={styles.registerContainer} onClick={() => navigate("/auth/signup")}>
          <span className={`${styles.registerText} ${isDarkMode ? styles.dark : ""}`}>
            {i18n.t("login.no_account")}{" "}
            <span className={`${styles.boldRegister} ${isDarkMode ? styles.dark : ""}`}>
              {i18n.t("login.register")}
            </span>
          </span>
        </div>

        {alertVisible && (
          <div className={styles.alertContainer} onClick={hideCustomAlert}>
            <div
              ref={fadeAnimAlert}
              className={`${styles.alertBox} ${isDarkMode ? styles.darkAlert : styles.lightAlert}`}
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
