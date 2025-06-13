import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/CashbackPending.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function CashbackPending() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.headerDark : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("cashback_pending.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <h3 className={`${styles.mainTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("cashback_pending.pending_order")}
        </h3>

        <p className={`${styles.paragraph} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("cashback_pending.processing_time")}
        </p>

        <h4 className={`${styles.subTitle} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_pending.check_if_expired")}
        </h4>

        <p className={`${styles.listItem} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_pending.check_terms_conditions")}
        </p>

        <p className={`${styles.listItem} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback_pending.check_cashback_rules")}
        </p>

        <button
          className={`${styles.supportButton} ${isDark ? styles.supportButtonDark : ""}`}
          onClick={() => navigate("/contact")}
        >
          <span className={`${styles.supportButtonText} ${isDark ? styles.textGold : ""}`}>
            {i18n.t("cashback_pending.contact_support")}
          </span>
        </button>
      </div>
    </div>
  )
}
