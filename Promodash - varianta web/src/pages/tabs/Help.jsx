import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Help.module.css"
import { ThemeContext } from "../../context/ThemeContext"

export default function Help() {
  const { theme } = useContext(ThemeContext)
  const isDark = theme === "Dark"
  const navigate = useNavigate()

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={`${styles.header} ${isDark ? styles.headerDark : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("help.title")}
        </h2>
        <span className={styles.notificationIcon}>🔔</span>
      </div>

      <div className={styles.scrollContent}>
        <SectionTitle title={i18n.t("help.faq")} bold={false} isDark={isDark} />
        <OptionItem title={i18n.t("help.cashback_pending")} route="/cashbackpending" isDark={isDark} />
        <OptionItem title={i18n.t("help.withdraw_cashback")} route="/withdrawcollected" isDark={isDark} />
        <OptionItem title={i18n.t("help.cashback_not_appeared")} route="/cashbacknot" isDark={isDark} />
        <OptionItem title={i18n.t("help.request_cannot_be_created")} route="/requestnot" isDark={isDark} />

        <SectionTitle title={i18n.t("help.customer_support")} bold isDark={isDark} />
        <OptionItem title={i18n.t("help.my_requests")} route="/myrequests" isDark={isDark} />
        <OptionItem title={i18n.t("help.create_request")} route="/createrequest" isDark={isDark} />

        <SectionTitle title={i18n.t("help.legal_information")} bold isDark={isDark} />
        <OptionItem title={i18n.t("help.terms_of_use")} route="/termsofuse" isDark={isDark} />
        <OptionItem title={i18n.t("help.privacy_policy")} route="/privacypolicy" isDark={isDark} />
        <OptionItem title={i18n.t("help.contact_information")} route="/contact" isDark={isDark} />
      </div>
    </div>
  )
}

function SectionTitle({ title, bold, isDark }) {
  return (
    <div className={`${styles.sectionContainer} ${bold ? styles.sectionBold : ""} ${isDark ? styles.sectionDark : ""}`}>
      <span className={styles.sectionIcon}>📄</span>
      <span className={`${styles.sectionTitle} ${bold ? styles.sectionTitleBold : ""} ${isDark ? styles.textGold : ""}`}>
        {title}
      </span>
    </div>
  )
}

function OptionItem({ title, route, isDark }) {
  const navigate = useNavigate()
  return (
    <div
      className={`${styles.optionItem} ${isDark ? styles.optionItemDark : ""}`}
      onClick={() => navigate(route)}
    >
      <span className={`${styles.optionText} ${isDark ? styles.textLight : ""}`}>{title}</span>
      <span className={`${styles.chevron} ${isDark ? styles.textGold : ""}`}>›</span>
    </div>
  )
}
