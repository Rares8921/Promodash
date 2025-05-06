import { useMemo, useContext, useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { generateAffiliateLink } from "../../lib/profitshare"
import { getAverageCommission, calculateCashbackSplit } from "../../lib/cashbackCalculator"
import i18n from "../../i18n"
import { FavoritesContext } from "../../context/FavoritesContext"
import styles from "./css/StoreDetails.module.css"
import placeholderImage from "../../assets/images/un.png"

export default function StoreDetails() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const location = useLocation()

  const { favoriteStores, toggleFavoriteStore } = useContext(FavoritesContext)

  const parsedStore = useMemo(() => {
    const storeParam = new URLSearchParams(location.search).get("store")
    return storeParam ? JSON.parse(decodeURIComponent(storeParam)) : {}
  }, [location.search])

  const commissionRange = parsedStore.commissions?.[0]?.value || "0%"
  const averageCommission = getAverageCommission(commissionRange)
  let { userCashback, platformEarnings } = calculateCashbackSplit(averageCommission)

  if (parsedStore.id === "35") {
    userCashback = 10
  }

  const isFavorite = favoriteStores.some((fav) => fav.id === parsedStore.id)

  const [parsedStoreLogo, setLogoUri] = useState(placeholderImage)

  useEffect(() => {
    if (parsedStore.logo) {
      const logoUrl = parsedStore.logo.startsWith("//") ? `https:${parsedStore.logo}` : parsedStore.logo
      setLogoUri(logoUrl)
    }
  }, [parsedStore.logo])

  const handleGoToStore = async () => {
    if (!parsedStore.name || !parsedStore.url) {
      alert(i18n.t("store_details.error_title") + ": " + i18n.t("store_details.missing_info"))
      return
    }

    try {
      const affiliateLink = await generateAffiliateLink(parsedStore.name, parsedStore.url, parsedStore.id, userCashback)
      window.open(affiliateLink, "_blank")
    } catch (error) {
      alert(i18n.t("store_details.error_title") + ": " + i18n.t("store_details.unable_to_open"))
      console.error("Error accessing link:", error)
    }
  }

  const toggleFavorite = () => {
    toggleFavoriteStore(parsedStore)
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* HEADER */}
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={`${styles.icon} ${theme === "Dark" ? styles.darkIcon : ""}`}>arrow_back</i>
        </button>
        <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
          {parsedStore?.name || i18n.t("store_details.default_store_name")}
        </h1>
        <button onClick={toggleFavorite} className={styles.favoriteButton}>
          <i
            className={`${styles.starIcon} ${isFavorite ? styles.activeStar : ""} ${theme === "Dark" ? styles.darkStarIcon : ""}`}
          >
            {isFavorite ? "star" : "star_border"}
          </i>
        </button>
      </div>

      {/* CASHBACK SECTION */}
      <div className={`${styles.cashbackContainer} ${theme === "Dark" ? styles.darkCashback : ""}`}>
        <img
          src={typeof parsedStoreLogo === "string" ? parsedStoreLogo : placeholderImage}
          alt={parsedStore.name}
          className={styles.storeLogo}
        />
        <p className={`${styles.cashbackText} ${theme === "Dark" ? styles.darkCashbackText : ""}`}>
          {i18n.t("store_details.cashback")}: {userCashback}%
        </p>
        <button className={styles.transferButton} onClick={handleGoToStore}>
          <span className={styles.transferButtonText}>{i18n.t("store_details.go_to_store")}</span>
        </button>
      </div>

      {/* CONDITIONS & REVIEWS TABS */}
      <div className={styles.tabsContainer}>
        <span className={`${styles.tab} ${theme === "Dark" ? styles.darkTab : ""}`}>
          {i18n.t("store_details.conditions")}
        </span>
      </div>

      {/* CASHBACK INFORMATION */}
      <div className={styles.scrollContent}>
        <div className={`${styles.infoBox} ${theme === "Dark" ? styles.darkInfoBox : ""}`}>
          <i className={`${styles.infoIcon} ${theme === "Dark" ? styles.darkInfoIcon : ""}`}>schedule</i>
          <h3 className={`${styles.infoTitle} ${theme === "Dark" ? styles.darkInfoTitle : ""}`}>
            {i18n.t("store_details.credit_time")}
          </h3>
          <p className={`${styles.infoText} ${theme === "Dark" ? styles.darkInfoText : ""}`}>
            ✅ {i18n.t("store_details.average_pending")}: 3 {i18n.t("store_details.days")}
            <br />✅ {i18n.t("store_details.average_confirmed")}: 5 {i18n.t("store_details.days")}
            <br />✅ {i18n.t("store_details.max_confirmed")}: 60 {i18n.t("store_details.days")}
          </p>
        </div>

        <div className={`${styles.infoBox} ${theme === "Dark" ? styles.darkInfoBox : ""}`}>
          <i className={`${styles.infoIcon} ${theme === "Dark" ? styles.darkInfoIcon : ""}`}>calendar_today</i>
          <h3 className={`${styles.infoTitle} ${theme === "Dark" ? styles.darkInfoTitle : ""}`}>
            {i18n.t("store_details.commission_period")}
          </h3>
          <p className={`${styles.infoText} ${theme === "Dark" ? styles.darkInfoText : ""}`}>
            🕒 {i18n.t("store_details.commission_period_value")}
          </p>
        </div>

        <div className={`${styles.infoBox} ${theme === "Dark" ? styles.darkInfoBox : ""}`}>
          <i className={`${styles.infoIcon} ${theme === "Dark" ? styles.darkInfoIcon : ""}`}>info</i>
          <h3 className={`${styles.infoTitle} ${theme === "Dark" ? styles.darkInfoTitle : ""}`}>
            {i18n.t("store_details.info_conditions")}
          </h3>
          <p className={`${styles.infoText} ${theme === "Dark" ? styles.darkInfoText : ""}`}>
            ⚠️ {i18n.t("store_details.no_cashback_vouchers")}
            <br />
            ⚠️ {i18n.t("store_details.cashback_net_value")}
          </p>
        </div>

        <div className={`${styles.warningBox} ${theme === "Dark" ? styles.darkWarningBox : ""}`}>
          <p className={`${styles.warningText} ${theme === "Dark" ? styles.darkWarningText : ""}`}>
            ⚠️ {i18n.t("store_details.warning_mobile")}
          </p>
        </div>
      </div>
    </div>
  )
}
