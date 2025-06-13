import { useContext, useState, useEffect, memo } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { LanguageContext } from "../../context/LanguageContext"
import { getUserData } from "../../lib/appwrite"
import i18n from "../../i18n"
import styles from "./css/Invite.module.css"

const Invite = memo(function Invite() {
  const { theme } = useContext(ThemeContext)
  const { key } = useContext(LanguageContext)
  const [user, setUser] = useState(null)
  const [inviteLink, setInviteLink] = useState("...")
  const [inviteCount, setInviteCount] = useState("...")
  const [earnedBonus, setEarnedBonus] = useState("...")
  const [pendingBonus, setPendingBonus] = useState("...")
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchUser() {
      const userDoc = await getUserData()
      if (!userDoc) {
        alert(i18n.t("invite.error_title") + ": " + i18n.t("invite.error_loading_user"))
        return
      }

      setUser(userDoc)
      setInviteCount(userDoc.inviteCount || 0)
      setEarnedBonus(userDoc.earnedBonus || "0.00")
      setPendingBonus(userDoc.pendingInviteBonus || "0.00")

      const code = userDoc.Invite_Code
      const inviteUrl = `https://promodash.vercel.app/api/invite_redirect?inviteCode=${code}`
      setInviteLink(inviteUrl)
    }

    async function checkAuth() {
      const user = await getUserData()
      if (!user) {
        navigate("/signup")
      }
      fetchUser()
    }
    checkAuth()
  }, [navigate])

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    alert(i18n.t("invite.copied_title") + ": " + i18n.t("invite.copied_message"))
  }

  const handleInviteFriends = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: i18n.t("invite.invite_title"),
          text: i18n.t("invite.invite_message"),
          url: inviteLink,
        })
      } else {
        handleCopyLink()
      }
    } catch (error) {
      alert(i18n.t("signup.error_title") + ": " + i18n.t("invite.invite_share_error"))
    }
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <h1 className={styles.headerTitle}>{i18n.t("invite.title")}</h1>
      </div>

      <div className={styles.scrollContent}>
        <button className={styles.inviteButton} onClick={handleInviteFriends}>
          <i className={styles.icon}>person_add</i>
          <span className={styles.inviteButtonText}>{i18n.t("invite.invite_friends")}</span>
        </button>

        <p className={`${styles.subText} ${theme === "Dark" ? styles.darkSubText : ""}`}>
          {i18n.t("invite.copy_share")}
        </p>

        <div className={`${styles.linkBox} ${theme === "Dark" ? styles.darkLinkBox : ""}`}>
          <input
            className={`${styles.linkText} ${theme === "Dark" ? styles.darkLinkText : ""}`}
            value={inviteLink}
            readOnly
          />
          <button className={styles.copyButton} onClick={handleCopyLink}>
            <i className={`${styles.copyIcon} ${theme === "Dark" ? styles.darkCopyIcon : ""}`}>content_copy</i>
          </button>
        </div>

        <h2 className={`${styles.sectionTitle} ${theme === "Dark" ? styles.darkSectionTitle : ""}`}>
          {i18n.t("invite.how_it_works")}
        </h2>

        <div className={styles.stepsContainer}>
          <StepItem text={i18n.t("invite.step_1")} theme={theme} />
          <StepItem text={i18n.t("invite.step_2")} theme={theme} />
          <StepItem text={i18n.t("invite.step_3")} theme={theme} />
        </div>

        {/* Stats and Bonus Section */}
        <div className={`${styles.statsContainer} ${theme === "Dark" ? styles.darkStatsContainer : ""}`}>
          <div className={styles.statsItem}>
            <p className={`${styles.statsTitle} ${theme === "Dark" ? styles.darkStatsTitle : ""}`}>
              {i18n.t("invite.total_invites")}
            </p>
            <p className={`${styles.statsValue} ${theme === "Dark" ? styles.darkStatsValue : ""}`}>{inviteCount}</p>
          </div>
        </div>

        <div className={styles.bonusContainer}>
          <div className={`${styles.bonusItem} ${theme === "Dark" ? styles.darkBonusItem : ""}`}>
            <p className={`${styles.bonusTitle} ${theme === "Dark" ? styles.darkBonusTitle : ""}`}>
              {i18n.t("invite.earned_bonus")}
            </p>
            <p className={`${styles.bonusValue} ${theme === "Dark" ? styles.darkBonusValue : ""}`}>{earnedBonus} RON</p>
          </div>
          <div className={`${styles.bonusItem} ${theme === "Dark" ? styles.darkBonusItem : ""}`}>
            <p className={`${styles.bonusTitle} ${theme === "Dark" ? styles.darkBonusTitle : ""}`}>
              {i18n.t("invite.pending_bonus")}
            </p>
            <p className={`${styles.bonusValue} ${theme === "Dark" ? styles.darkBonusValue : ""}`}>
              {pendingBonus} RON
            </p>
          </div>
        </div>
      </div>
    </div>
  )
})

// componenta auxiliara
function StepItem({ text, theme }) {
  return (
    <div className={styles.stepItem}>
      <i className={`${styles.checkIcon} ${theme === "Dark" ? styles.darkCheckIcon : ""}`}>check_circle</i>
      <p className={`${styles.stepText} ${theme === "Dark" ? styles.darkStepText : ""}`}>{text}</p>
    </div>
  )
}

export default memo(Invite)
