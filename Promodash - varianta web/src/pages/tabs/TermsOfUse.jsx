import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import i18n from "../../i18n"
import styles from "./css/TermsOfUse.module.css"

export default function TermsOfUse() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* Header */}
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={styles.backIcon}>arrow_back</i>
        </button>
        <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
          {i18n.t("terms_of_use.title")}
        </h1>
      </div>

      <div className={styles.scrollContent}>
        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("terms_of_use.user_rights_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("terms_of_use.user_rights")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("terms_of_use.cashback_usage_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("terms_of_use.cashback_usage")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("terms_of_use.limitations_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("terms_of_use.limitations")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("terms_of_use.liability_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("terms_of_use.liability")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("terms_of_use.modifications_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("terms_of_use.modifications")}
        </p>

        <p className={`${styles.footer} ${theme === "Dark" ? styles.darkFooter : ""}`}>
          {i18n.t("terms_of_use.agreement")}
        </p>
      </div>
    </div>
  )
}
