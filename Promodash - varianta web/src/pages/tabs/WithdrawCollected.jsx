import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/WithdrawCollected.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function WithdrawCollected() {
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"
  const navigate = useNavigate()

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.headerDark : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("withdraw_collected.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <p className={`${styles.sectionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("withdraw_collected.instructions")}
        </p>

        <Step number="1" text={i18n.t("withdraw_collected.step_1")} isDark={isDark} />
        <Step number="2" text={i18n.t("withdraw_collected.step_2")} isDark={isDark} />
        <Step number="3" text={i18n.t("withdraw_collected.step_3")} isDark={isDark} />

        <p className={`${styles.noteText} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("withdraw_collected.processing_time")}
        </p>

        <div className={styles.feedbackContainer}>
          <p className={`${styles.feedbackText} ${isDark ? styles.textLight : ""}`}>
            {i18n.t("withdraw_collected.helpful")}
          </p>
          <div className={styles.buttonRow}>
            <button className={`${styles.feedbackButton} ${isDark ? styles.feedbackButtonDark : ""}`}>
              ✓ {i18n.t("withdraw_collected.yes")}
            </button>
            <button className={`${styles.feedbackButton} ${isDark ? styles.feedbackButtonDark : ""}`}>
              ✗ {i18n.t("withdraw_collected.no")}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Step({ number, text, isDark }) {
  return (
    <div className={styles.stepContainer}>
      <span className={`${styles.stepNumber} ${isDark ? styles.textGold : ""}`}>{number}.</span>
      <p className={`${styles.stepText} ${isDark ? styles.textMuted : ""}`}>{text}</p>
    </div>
  )
}
