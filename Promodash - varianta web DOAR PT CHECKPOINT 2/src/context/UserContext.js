import { createContext, useState, useEffect } from "react"
import { getUserData } from "../lib/appwrite"

export const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const serverUser = await getUserData()
        setUser(serverUser || null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const reloadUser = async () => {
    setLoading(true)
    try {
      const serverUser = await getUserData()
      setUser(serverUser || null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <UserContext.Provider value={{ user, setUser, loading, reloadUser }}>
      {children}
    </UserContext.Provider>
  )
}
