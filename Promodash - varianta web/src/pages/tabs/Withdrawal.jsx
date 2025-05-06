import { useState, useContext, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import i18n from "../../i18n"
import styles from "./css/Withdrawal.module.css"
import visaLogo from "../../assets/images/visa.png"
import mastercardLogo from "../../assets/images/mastercard.png"
import raiffeisenLogo from "../../assets/images/raiffeisen.png"
import bcrLogo from "../../assets/images/bcr.png"
import ingLogo from "../../assets/images/ing.png"

export default function Withdrawal() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const { user, loading } = useContext(UserContext)

  const userBalance = useMemo(() => user?.balance || 0, [user])
  const userId = useMemo(() => user?.userId || "", [user])

  // State pentru datele formularului
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const [iban, setIban] = useState("")

  const handleWithdraw = async () => {
    const amountNumber = Number.parseFloat(withdrawAmount)

    if (isNaN(amountNumber) || amountNumber < 20) {
      alert(i18n.t("withdrawal.invalid_amount_title") + ": " + i18n.t("withdrawal.min_amount"))
      return
    }

    if (amountNumber > userBalance) {
      alert(i18n.t("withdrawal.insufficient_funds_title") + ": " + i18n.t("withdrawal.insufficient_funds"))
      return
    }

    if (!iban.trim()) {
      alert(i18n.t("withdrawal.missing_iban_title") + ": " + i18n.t("withdrawal.missing_iban"))
      return
    }

    try {
      const response = await fetch("https://promodash.vercel.app/api/withdrawal_webhook/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          amount: amountNumber,
          iban: iban.trim(),
        }),
      })

      const result = await response.json()
      if (response.ok) {
        alert(i18n.t("withdrawal.success_title") + ": " + i18n.t("withdrawal.success_message"))
        setWithdrawAmount("")
        setIban("")
      } else {
        alert(i18n.t("withdrawal.error_title") + ": " + (result.error || i18n.t("withdrawal.error_message")))
      }
    } catch (error) {
      console.error("Withdrawal error:", error)
      alert(i18n.t("withdrawal.error_title") + ": " + i18n.t("withdrawal.failed_processing"))
    }
  }

  if (loading) {
    return (
      <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
        <p className={`${styles.loadingText} ${theme === "Dark" ? styles.darkText : ""}`}>
          {i18n.t("withdrawal.loading")}
        </p>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* Header */}
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={styles.backIcon}>arrow_back</i>
        </button>
        <h1 className={styles.headerTitle}>{i18n.t("withdrawal.title")}</h1>
        <i className={styles.historyIcon}>schedule</i>
      </div>

      {/* Balance Card */}
      <div className={`${styles.balanceCard} ${theme === "Dark" ? styles.darkBalanceCard : ""}`}>
        <p className={`${styles.balanceLabel} ${theme === "Dark" ? styles.darkBalanceLabel : ""}`}>
          {i18n.t("withdrawal.balance")}
        </p>
        <p className={`${styles.balanceAmount} ${theme === "Dark" ? styles.darkBalanceAmount : ""}`}>
          {userBalance.toFixed(2)} RON
        </p>
      </div>

      <div className={styles.scrollContent}>
        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("withdrawal.methods")}
        </h2>

        {/* Metode de plata */}
        <div className={styles.methodScrollContainer}>
          <div className={`${styles.methodButton} ${theme === "Dark" ? styles.darkMethodButton : ""}`}>
            <img src={visaLogo || "/placeholder.svg"} alt="Visa" className={styles.methodIcon} />
          </div>
          <div className={`${styles.methodButton} ${theme === "Dark" ? styles.darkMethodButton : ""}`}>
            <img src={mastercardLogo || "/placeholder.svg"} alt="Mastercard" className={styles.methodIcon} />
          </div>
          <div className={`${styles.methodButton} ${theme === "Dark" ? styles.darkMethodButton : ""}`}>
            <img src={raiffeisenLogo || "/placeholder.svg"} alt="Raiffeisen" className={styles.methodIcon} />
          </div>
          <div className={`${styles.methodButton} ${theme === "Dark" ? styles.darkMethodButton : ""}`}>
            <img src={bcrLogo || "/placeholder.svg"} alt="BCR" className={styles.bcrIcon} />
          </div>
          <div className={`${styles.methodButton} ${theme === "Dark" ? styles.darkMethodButton : ""}`}>
            <img src={ingLogo || "/placeholder.svg"} alt="ING" className={styles.ingIcon} />
          </div>
        </div>

        {/* Introducere sumă */}
        <div className={styles.inputContainer}>
          <label className={`${styles.inputLabel} ${theme === "Dark" ? styles.darkInputLabel : ""}`}>
            {i18n.t("withdrawal.amount_label")}
          </label>
          <div className={`${styles.amountBox} ${theme === "Dark" ? styles.darkAmountBox : ""}`}>
            <input
              className={`${styles.amountInput} ${theme === "Dark" ? styles.darkAmountInput : ""}`}
              type="number"
              placeholder={i18n.t("withdrawal.amount_placeholder")}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>
          <p className={`${styles.limitText} ${theme === "Dark" ? styles.darkLimitText : ""}`}>
            {i18n.t("withdrawal.min_amount")}
          </p>
        </div>

        {/* IBAN */}
        <div className={styles.inputContainer}>
          <label className={`${styles.inputLabel} ${theme === "Dark" ? styles.darkInputLabel : ""}`}>
            {i18n.t("withdrawal.iban_label")}
          </label>
          <div className={`${styles.amountBox} ${theme === "Dark" ? styles.darkAmountBox : ""}`}>
            <input
              className={`${styles.amountInput} ${theme === "Dark" ? styles.darkAmountInput : ""}`}
              placeholder="RO49AAAA1B31007593840000"
              value={iban}
              onChange={(e) => setIban(e.target.value)}
            />
          </div>
          <p className={`${styles.limitText} ${theme === "Dark" ? styles.darkLimitText : ""}`}>
            {i18n.t("withdrawal.iban_warning")}
          </p>
        </div>

        {/* Buton de retragere */}
        <button
          className={`${styles.withdrawButton} ${theme === "Dark" ? styles.darkWithdrawButton : ""}`}
          onClick={handleWithdraw}
        >
          <span className={`${styles.withdrawButtonText} ${theme === "Dark" ? styles.darkWithdrawButtonText : ""}`}>
            {i18n.t("withdrawal.withdraw_button")}
          </span>
        </button>

        <div className={styles.conditionsContainer}>
          <button className={styles.conditionsButton} onClick={() => navigate("/conditions")}>
            <span className={`${styles.conditionsText} ${theme === "Dark" ? styles.darkConditionsText : ""}`}>
              {i18n.t("withdrawal.conditions")}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
