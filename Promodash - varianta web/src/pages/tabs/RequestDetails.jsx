import { useContext } from "react"
import { useLocation } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import styles from "./css/RequestDetails.module.css"

export default function RequestDetails() {
  const location = useLocation()
  const { theme } = useContext(ThemeContext)
  const { request } = location.state || {}

  if (!request) {
    return (
      <div className={`${styles.safeContainer} ${theme === "Light" ? styles.lightContainer : styles.darkContainer}`}>
        <p className={styles.errorText}>Request not found</p>
      </div>
    )
  }

  return (
    <div className={`${styles.safeContainer} ${theme === "Light" ? styles.lightContainer : styles.darkContainer}`}>
      {/* HEADER */}
      <div className={`${styles.header} ${theme === "Light" ? styles.lightHeader : styles.darkHeader}`}>
        <h1 className={`${styles.title} ${theme === "Light" ? styles.lightTitle : styles.darkTitle}`}>
          {request.subject}
        </h1>
      </div>

      {/* SCROLLVIEW care ocupa tot ecranul */}
      <div className={styles.scrollContent}>
        {/* DATA MESAJULUI */}
        <p className={`${styles.date} ${theme === "Light" ? styles.lightDate : styles.darkDate}`}>
          {new Date(request.dateCreated).toLocaleDateString("ro-RO")}
        </p>

        {/* BOX MESAJ */}
        <div className={`${styles.messageBox} ${theme === "Light" ? styles.lightMessageBox : styles.darkMessageBox}`}>
          <div className={styles.textScroll}>
            <p
              className={`${styles.description} ${theme === "Light" ? styles.lightDescription : styles.darkDescription}`}
            >
              {request.description}
            </p>
          </div>
        </div>

        {/* IMAGINEA */}
        {request.image && <img src={request.image || "/placeholder.svg"} alt="Request" className={styles.image} />}
      </div>
    </div>
  )
}
