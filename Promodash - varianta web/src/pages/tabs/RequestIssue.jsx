import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import i18n from "../../i18n"
import styles from "./css/RequestIssue.module.css"

export default function RequestIssue() {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={styles.icon}>arrow_back</i>
        </button>
        <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
          {i18n.t("request_issue.title")}
        </h1>
      </div>

      <div className={styles.content}>
        <h2 className={`${styles.title} ${theme === "Dark" ? styles.darkTitle : ""}`}>
          {i18n.t("request_issue.cannot_submit")}
        </h2>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.darkParagraph : ""}`}>
          {i18n.t("request_issue.check_fields")}
        </p>
        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.lightParagraph : ""}`}>
          {i18n.t("request_issue.mistake_marked")}
        </p>

        <h3 className={`${styles.subtitle} ${theme === "Dark" ? styles.darkSubtitle : ""}`}>
          {i18n.t("request_issue.typical_mistakes")}
        </h3>

        <BulletItem text={i18n.t("request_issue.mistake_order_number")} theme={theme} />
        <BulletItem text={i18n.t("request_issue.mistake_empty_fields")} theme={theme} />
        <BulletItem text={i18n.t("request_issue.mistake_wrong_file_format")} theme={theme} />

        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.lightParagraph : ""}`}>
          {i18n.t("request_issue.use_compression_service")}
        </p>

        <p className={`${styles.paragraph} ${theme === "Dark" ? styles.lightParagraph : ""}`}>
          {i18n.t("request_issue.contact_us")}{" "}
          <a
            href="mailto:promodashcs@gmail.com"
            className={`${styles.link} ${theme === "Dark" ? styles.darkLink : ""}`}
          >
            promodashcs@gmail.com
          </a>
          .
        </p>

        <div className={styles.feedbackContainer}>
          <h3 className={`${styles.feedbackTitle} ${theme === "Dark" ? styles.darkFeedbackTitle : ""}`}>
            {i18n.t("request_issue.article_helpful")}
          </h3>
          <div className={styles.feedbackButtons}>
            <button className={`${styles.feedbackButton} ${theme === "Dark" ? styles.darkFeedbackButton : ""}`}>
              <i className={styles.feedbackIcon}>check</i>
              <span className={`${styles.feedbackButtonText} ${theme === "Dark" ? styles.darkFeedbackButtonText : ""}`}>
                {i18n.t("request_issue.yes")}
              </span>
            </button>
            <button
              className={`${styles.feedbackButton} ${styles.noButton} ${theme === "Dark" ? styles.darkNoButton : ""}`}
            >
              <i className={styles.feedbackIcon}>close</i>
              <span className={`${styles.feedbackButtonText} ${theme === "Dark" ? styles.darkFeedbackButtonText : ""}`}>
                {i18n.t("request_issue.no")}
              </span>
            </button>
          </div>
        </div>

        <button className={styles.returnToTop} onClick={scrollToTop}>
          <i className={`${styles.upIcon} ${theme === "Dark" ? styles.darkUpIcon : ""}`}>keyboard_arrow_up</i>
          <span className={`${styles.returnToTopText} ${theme === "Dark" ? styles.darkReturnToTopText : ""}`}>
            {i18n.t("request_issue.return_to_top")}
          </span>
        </button>
      </div>
    </div>
  )
}

const BulletItem = ({ text, theme }) => (
  <div className={styles.bulletItem}>
    <span className={`${styles.bullet} ${theme === "Dark" ? styles.darkBullet : ""}`}>•</span>
    <p className={`${styles.bulletText} ${theme === "Dark" ? styles.darkBulletText : ""}`}>{text}</p>
  </div>
)
