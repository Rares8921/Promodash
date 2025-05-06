import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Conditions.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function Conditions() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.headerDark : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("conditions.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <p className={`${styles.conditionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("conditions.condition_1")}
        </p>
        <p className={`${styles.conditionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("conditions.condition_2")}
        </p>
        <p className={`${styles.conditionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("conditions.condition_3")}
        </p>
        <p className={`${styles.conditionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("conditions.condition_4")}
        </p>
        <p className={`${styles.conditionText} ${isDark ? styles.textLight : ""}`}>
          {i18n.t("conditions.condition_5")}
        </p>
      </div>
    </div>
  )
}
