import { createContext, useState, useEffect } from "react"

export const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const [favoriteStores, setFavoriteStores] = useState([])

  useEffect(() => {
    const stored = localStorage.getItem("favoriteStores")
    if (stored) {
      setFavoriteStores(JSON.parse(stored))
    }
  }, [])

  const toggleFavoriteStore = (store) => {
    let updated
    if (favoriteStores.some((s) => s.id === store.id)) {
      updated = favoriteStores.filter((s) => s.id !== store.id)
    } else {
      updated = [...favoriteStores, store]
    }
    setFavoriteStores(updated)
    localStorage.setItem("favoriteStores", JSON.stringify(updated))
  }

  const refreshFavorites = () => {
    const stored = localStorage.getItem("favoriteStores")
    if (stored) {
      setFavoriteStores(JSON.parse(stored))
    }
  }

  return (
    <FavoritesContext.Provider value={{ favoriteStores, toggleFavoriteStore, refreshFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}
