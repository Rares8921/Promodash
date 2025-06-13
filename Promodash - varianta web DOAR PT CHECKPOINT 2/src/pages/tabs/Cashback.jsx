import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/Cashback.module.css"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"

export default function Cashback() {
  const { theme } = useContext(ThemeContext)
  const { user } = useContext(UserContext)
  const navigate = useNavigate()
  const isDark = theme === "Dark"

  if (user === null) {
    return (
      <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
        <p className={styles.loadingText}>Loading...</p>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${isDark ? styles.dark : ""}`}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h1 className={styles.headerTitle}>{i18n.t("cashback.title")}</h1>
        <span className={styles.walletIcon}>💰</span>
      </div>

      <div className={`${styles.balanceCard} ${isDark ? styles.balanceCardDark : ""}`}>
        <p className={`${styles.balanceLabel} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback.total_balance")}
        </p>
        <h2 className={`${styles.balanceAmount} ${isDark ? styles.textGold : ""}`}>
          {user?.balance ?? "0.00"} RON
        </h2>
        <div className={`${styles.divider} ${isDark ? styles.dividerDark : ""}`} />
        <p className={`${styles.pendingLabel} ${isDark ? styles.textMuted : ""}`}>
          {i18n.t("cashback.pending_credits")}
        </p>
        <h3 className={`${styles.pendingAmount} ${isDark ? styles.textLight : ""}`}>
          {user?.pendingCredits ?? "0.00"} RON
        </h3>
      </div>

      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>💸</span>
        <p className={`${styles.emptyText} ${isDark ? styles.textMuted : ""}`}>
          {user.balance === 0
            ? i18n.t("cashback.no_cashback")
            : i18n.t("cashback.cashback")}
        </p>
        <button
          className={`${styles.chooseStoreButton} ${isDark ? styles.chooseStoreButtonDark : ""}`}
          onClick={() => navigate("/")}
        >
          <span className={`${styles.chooseStoreText} ${isDark ? styles.textGold : ""}`}>
            {i18n.t("cashback.choose_store")}
          </span>
        </button>
      </div>
    </div>
  )
}
