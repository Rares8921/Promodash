import { useState, useContext } from "react"
import { useNavigate } from "react-router-dom"
import i18n from "../../i18n"
import styles from "./css/CreateRequest.module.css"
import { ThemeContext } from "../../context/ThemeContext"
import { UserContext } from "../../context/UserContext"
import { sendRequest } from "../../lib/appwrite"

export default function CreateRequest() {
  const { theme } = useContext(ThemeContext)
  const { user, loading } = useContext(UserContext)
  const navigate = useNavigate()
  const isDark = theme === "Dark"

  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState(null)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const handleImageSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      setError(i18n.t("create_request.image_error"))
      return
    }

    const reader = new FileReader()
    reader.onload = () => setImage(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmitRequest = async () => {
    if (subject.length < 5) {
      setError(i18n.t("create_request.subject_min"))
      return
    }
    if (subject.length > 100) {
      setError(i18n.t("create_request.subject_max"))
      return
    }
    if (description.length < 10) {
      setError(i18n.t("create_request.description_min"))
      return
    }
    if (description.length > 1000) {
      setError(i18n.t("create_request.description_max"))
      return
    }

    try {
      if (!user || !user.email) {
        setError(i18n.t("create_request.user_not_loaded"))
        return
      }

      const newRequest = {
        id: Date.now().toString(),
        email: user.email,
        subject,
        description,
        image,
        dateCreated: new Date().toISOString(),
        status: "pending"
      }

      if (await sendRequest(newRequest)) {
        setSuccessMessage(i18n.t("create_request.request_success"))
        setSubject("")
        setDescription("")
        setImage(null)

        setTimeout(() => {
          setSuccessMessage("")
          navigate(-1)
        }, 2500)
      }
    } catch (err) {
      console.error(err)
      setError(i18n.t("create_request.request_fail"))
    }
  }

  if (loading) {
    return (
      <div className={`${styles.container} ${isDark ? styles.darkContainer : ""}`}>
        <p className={styles.loading}>{i18n.t("general.loading")}</p>
      </div>
    )
  }

  return (
    <div className={`${styles.container} ${isDark ? styles.darkContainer : ""}`}>
      {error && <div className={styles.errorBox}><p>{error}</p></div>}
      {successMessage && <div className={styles.successBox}><p>{successMessage}</p></div>}

      <div className={`${styles.header} ${isDark ? styles.darkHeader : ""}`}>
        <button className={styles.backButton} onClick={() => navigate(-1)}>←</button>
        <h2 className={`${styles.headerTitle} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("create_request.title")}
        </h2>
      </div>

      <div className={styles.scrollContent}>
        <label className={`${styles.label} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("create_request.subject")}
        </label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={i18n.t("create_request.enter_subject")}
          className={`${styles.input} ${isDark ? styles.darkInput : ""}`}
        />

        <label className={`${styles.label} ${isDark ? styles.textGold : ""}`}>
          {i18n.t("create_request.description")}
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={i18n.t("create_request.enter_details")}
          className={`${styles.textarea} ${isDark ? styles.darkTextarea : ""}`}
          rows={6}
        />

        <label className={styles.imageLabel}>
          {i18n.t("create_request.attach_image")}
        </label>
        <input type="file" accept="image/*" onChange={handleImageSelect} className={styles.fileInput} />

        {image && (
          <div className={styles.imagePreview}>
            <img src={image} alt="Preview" />
          </div>
        )}

        <button className={styles.submitButton} onClick={handleSubmitRequest}>
          {i18n.t("create_request.submit_request")}
        </button>
      </div>
    </div>
  )
}
