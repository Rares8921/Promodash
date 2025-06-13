import { createContext, useContext, useEffect, useState } from "react"
import { UserContext } from "./UserContext"
import { updateUserData } from "../lib/appwrite"

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const { user, loading } = useContext(UserContext)
  const defaultTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "Dark" : "Light"
  const [theme, setTheme] = useState(user?.theme || defaultTheme)

  useEffect(() => {
    if (!loading && user?.theme) {
      setTheme(user.theme)
    }
  }, [user, loading])

  const toggleTheme = async (newTheme) => {
    setTheme(newTheme)
    await updateUserData("Theme", newTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
