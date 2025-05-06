import { useContext } from "react"
import { Navigate } from "react-router-dom"
import { UserContext } from "../context/UserContext"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useContext(UserContext)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading session...</p>
      </div>
    )
  }  

  if (!user) {
    return <Navigate to="/auth/login" />
  }

  return children
}
