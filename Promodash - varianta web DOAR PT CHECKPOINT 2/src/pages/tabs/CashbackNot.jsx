import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/CashbackNot.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function CashbackNot() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.headerDark : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("cashback_issue.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <h3 className={`${styles.title} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("cashback_issue.not_appeared")}
        </h3>

        <p className={`${styles.paragraph} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("cashback_issue.check_if")}
        </p>

        <p className={`${styles.paragraph} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_issue.check_waiting_period")}
        </p>

        <p className={`${styles.paragraph} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("cashback_issue.check_if_expired")}
        </p>

        <p className={`${styles.paragraph} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_issue.check_terms_conditions")}
        </p>

        <p className={`${styles.paragraph} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("cashback_issue.check_cashback_rules")}
        </p>

        <p className={`${styles.paragraph} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_issue.submit_request_info")}
        </p>

        <button
          onClick={() => navigate("/createrequest")}
          className={`${styles.submitRequestButton} ${isDark ? styles.submitRequestButtonDark : ""}`}
        >
          <span className={`${styles.submitRequestText} ${isDark ? styles.textGold : ""}`}>
            {i18n.t("cashback_issue.submit_request")}
          </span>
        </button>
      </div>
    </div>
  )
}
