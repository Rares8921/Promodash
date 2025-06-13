import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Codes.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function Codes() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.headerWrapper} ${isDark ? styles.headerDark : ""}`}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
          <h1 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
            {i18n.t("codes.title")}
          </h1>
          <span className={`${styles.helpIcon} ${isDark ? styles.textGold : ""}`}>🏷️</span>
        </div>
      </div>

      <div className={styles.content}>
        <p className={`${styles.descriptionText} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("codes.description")}
        </p>

        <div className={`${styles.inputContainer} ${isDark ? styles.inputContainerDark : ""}`}>
          <input
            type="text"
            placeholder={i18n.t("codes.enter_code")}
            className={`${styles.input} ${isDark ? styles.inputDark : ""}`}
          />
          <button className={`${styles.applyButton} ${isDark ? styles.applyButtonDark : ""}`}>
            <span className={`${styles.applyButtonText} ${isDark ? styles.textGold : ""}`}>
              {i18n.t("codes.apply")}
            </span>
          </button>
        </div>

        <div className={styles.codesSection}>
          <h3 className={`${styles.activeTitle} ${isDark ? styles.textLight : ""}`}>
            {i18n.t("codes.active_codes")} (0)
          </h3>

          <div className={`${styles.divider} ${isDark ? styles.dividerDark : ""}`} />

          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🏷️</span>
            <p className={`${styles.emptyText} ${isDark ? styles.textMuted : ""}`}>
              {i18n.t("codes.no_active_codes")}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
