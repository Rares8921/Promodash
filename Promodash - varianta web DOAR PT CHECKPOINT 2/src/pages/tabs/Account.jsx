import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Account.module.css"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { LanguageContext } from "../../context/LanguageContext"
import { logout } from "../../lib/appwrite"

export default function Account() {
  const { theme } = useContext(ThemeContext)
  const { user } = useContext(UserContext)
  useContext(LanguageContext)
  const navigate = useNavigate()
  const isDark = theme === "Dark"

  const handleLogout = async () => {
    await logout()
    navigate("/auth/login")
  }

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={styles.logoContainer}>
        <img src="/assets/images/un.png" alt="Logo" className={styles.logo} />
      </div>

      <div className={`${styles.balanceCard} ${isDark ? styles.darkCard : ""}`}>
        <div className={`${styles.gradientCard} ${isDark ? styles.darkCard : ""}`}>
          <p className={`${styles.balanceText} ${isDark ? styles.textMuted : ""}`}>
            {i18n.t("account.total_balance")}
          </p>
          <h2 className={`${styles.balanceAmount} ${isDark ? styles.textGold : ""}`}>
            {user?.balance ?? "0.00"} RON
          </h2>
          <div className={`${styles.divider} ${isDark ? styles.dividerDark : ""}`} />
          <p className={`${styles.pendingText} ${isDark ? styles.textMuted : ""}`}>
            {i18n.t("account.pending_credits")}: {user?.pendingCredits ?? "0.00"} RON
          </p>
        </div>
      </div>

      <div className={`${styles.scrollContent} ${isDark ? styles.darkCard : ""}`}>

        <div className={`${styles.dividerMenu} ${isDark ? styles.dividerMenuDark : ""}`} />

        <OptionItem icon="💸" label={i18n.t("account.my_cashback")} route="/cashback" isDark={isDark} />
        <OptionItem icon="🏦" label={i18n.t("account.withdraw_funds")} route="/withdrawal" isDark={isDark} />
        <OptionItem icon="🏷️" label={i18n.t("account.codes")} route="/codes" isDark={isDark} />

        <div className={`${styles.dividerMenu} ${isDark ? styles.dividerMenuDark : ""}`} />

        <OptionItem icon="⚙️" label={i18n.t("account.settings")} route="/settings" isDark={isDark} />
        <OptionItem icon="❓" label={i18n.t("account.help")} route="/help" isDark={isDark} />
        <OptionItem icon="⭐" label={i18n.t("account.rate_app")} isDark={isDark} />

        <div className={`${styles.dividerMenu} ${isDark ? styles.dividerMenuDark : ""}`} />

        <button onClick={handleLogout} className={styles.logoutButton}>
          <span>🚪</span>
          <span className={styles.logoutText}>{i18n.t("account.logout")}</span>
        </button>
      </div>
    </div>
  )
}

function OptionItem({ icon, label, route, isDark }) {
  const navigate = useNavigate()
  return (
    <div
      className={`${styles.optionItem} ${isDark ? styles.optionItemDark : ""}`}
      onClick={() => route && navigate(route)}
    >
      <span>{icon}</span>
      <span className={`${styles.optionText} ${isDark ? styles.optionTextDark : ""}`}>{label}</span>
    </div>
  )
}
