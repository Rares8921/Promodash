import { useState, useContext, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { getUserRequests } from "../../lib/appwrite"
import i18n from "../../i18n"
import styles from "./css/MyRequests.module.css"


const MyRequests = memo(() => {
  const navigate = useNavigate()
  const { theme } = useContext(ThemeContext)
  const [requests, setRequests] = useState([])

  const { user, loading } = useContext(UserContext)

  useCallback(() => {
    if (!user?.email) return

    async function loadRequests() {
      try {
        const fetchedRequests = await getUserRequests(user.email)
        setRequests(fetchedRequests || [])
      } catch (error) {
        console.error("Error loading requests:", error)
      }
    }

    loadRequests()
  }, [user])

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* Header */}
      <div className={`${styles.header} ${theme === "Dark" ? styles.darkHeader : ""}`}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          <i className={styles.backIcon}>arrow_back</i>
        </button>
        <h1 className={`${styles.headerTitle} ${theme === "Dark" ? styles.darkHeaderTitle : ""}`}>
          {i18n.t("my_requests.title")}
        </h1>
      </div>

      {/* Display Requests */}
      <div className={styles.requestsList}>
        {requests.length > 0 ? (
          requests.map((item, index) => (
            <RequestItem key={item?.id ? item.id.toString() : index.toString()} request={item} navigate={navigate} />
          ))
        ) : (
          <p className={`${styles.noRequestsText} ${theme === "Dark" ? styles.darkText : ""}`}>
            {i18n.t("my_requests.no_requests")}
          </p>
        )}
      </div>
    </div>
  )
})

const RequestItem = memo(({ request, navigate }) => {
  const { theme } = useContext(ThemeContext)

  return (
    <div
      className={`${styles.requestItem} ${theme === "Dark" ? styles.darkRequestItem : ""}`}
      onClick={() => navigate(`/requestdetails`, { state: { request } })}
    >
      <h3 className={`${styles.requestTitle} ${theme === "Dark" ? styles.darkText : ""}`}>{request.subject}</h3>
      <p className={`${styles.requestDescription} ${theme === "Dark" ? styles.darkText : ""}`}>
        {request.description.length > 80 ? `${request.description.substring(0, 80)}...` : request.description}
      </p>
      <p className={`${styles.requestDate} ${theme === "Dark" ? styles.darkDate : ""}`}>
        {new Date(request.dateCreated).toLocaleDateString("ro-RO")}
      </p>
      {request.image && <img src={request.image || "/placeholder.svg"} alt="Request" className={styles.requestImage} />}
    </div>
  )
})

export default MyRequests
