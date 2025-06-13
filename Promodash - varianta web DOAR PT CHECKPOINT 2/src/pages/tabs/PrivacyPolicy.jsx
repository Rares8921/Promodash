import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import i18n from "../../i18n"
import styles from "./css/PrivacyPolicy.module.css"

export default function PrivacyPolicy() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* 🔹 Header */}
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={styles.backIcon}>arrow_back</i>
        </button>
        <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
          {i18n.t("privacy_policy.title")}
        </h1>
      </div>

      {/* 🔹 Conținutul paginii */}
      <div className={styles.scrollContent}>
        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.introduction_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.introduction")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.data_collection_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.data_collection")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.data_usage_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.data_usage")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.data_sharing_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.data_sharing")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.your_rights_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.your_rights")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.security_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.security")}
        </p>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("privacy_policy.changes_title")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("privacy_policy.changes")}
        </p>

        <p className={`${styles.footer} ${theme === "Dark" ? styles.darkFooter : ""}`}>
          {i18n.t("privacy_policy.contact")}
        </p>
      </div>
    </div>
  )
}
