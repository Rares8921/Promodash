import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { UserContext } from "../context/UserContext"

export default function GuestRoute({ children }) {
  const { user, loading } = useContext(UserContext)

  if (loading) {
    return <div>Loading...</div>
  }

  if (user) {
    return <Navigate to="/account" />
  }

  return children
}
