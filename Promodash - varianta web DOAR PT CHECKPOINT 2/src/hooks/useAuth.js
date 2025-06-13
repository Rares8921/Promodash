"use client"

import { useState, useEffect } from "react"
import { getUserData } from "../lib/appwrite"

export default function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(null)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = localStorage.getItem("userToken")

        if (!userToken) {
          setIsAuthenticated(false)
          return
        }

        const userData = await getUserData()

        if (userData) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
          localStorage.removeItem("userToken")
        }
      } catch (error) {
        console.error("Authentication error:", error)
        setIsAuthenticated(false)
      }
    }

    checkAuth()
  }, [])

  return isAuthenticated
}
