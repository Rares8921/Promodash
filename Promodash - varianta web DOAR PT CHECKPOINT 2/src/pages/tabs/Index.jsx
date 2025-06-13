import { useState, useEffect, useContext, memo } from "react"
import { useNavigate } from "react-router-dom"
import { ThemeContext } from "../../context/ThemeContext"
import { FavoritesContext } from "../../context/FavoritesContext"
import { LanguageContext } from "../../context/LanguageContext"
import useAuth from "../../hooks/useAuth"
import { getAdvertisers } from "../../lib/profitshare"
import { getAverageCommission, calculateCashbackSplit } from "../../lib/cashbackCalculator"
import i18n from "../../i18n"
import styles from "./css/Index.module.css"

const placeholderImage = "/placeholder.svg?height=55&width=55"

/** STORES SCREEN */
function Index() {
  const navigate = useNavigate()

  const { theme } = useContext(ThemeContext)
  useContext(LanguageContext)
  const { favoriteStores, toggleFavoriteStore } = useContext(FavoritesContext)

  const isAuthenticated = useAuth()

  // Data
  const [searchQuery, setSearchQuery] = useState("")
  const [profitshareMerchants, setProfitshareMerchants] = useState([])
  const [categories, setCategories] = useState(["All"])
  const [visitedStores, setVisitedStores] = useState([])
  const [favoriteList, setFavoriteList] = useState([]) // eventual

  // Filters
  const [activeFilter, setActiveFilter] = useState("All") // All | Visited | Favorites
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortByCashback, setSortByCashback] = useState(false)

  const [displayedStores, setDisplayedStores] = useState([])

  // Category icons mapping
  const categoryIcons = {
    All: "category",
    Fashion: "checkroom",
    Electronics: "devices",
    Home: "home",
    Beauty: "spa",
    Sports: "sports_soccer",
    Books: "menu_book",
    Toys: "toys",
    Food: "restaurant",
    Travel: "flight",
    Health: "healing",
    // Add more mappings as needed
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const cachedData = localStorage.getItem("cachedStores")
        if (cachedData) {
          const arr = JSON.parse(cachedData)
          setProfitshareMerchants(arr)
        }
        const data = await getAdvertisers()
        if (data && data.result) {
          const advertisersArray = Object.values(data.result)
          const uniqueCategories = [...new Set(advertisersArray.map((store) => store.category))]
          localStorage.setItem("cachedStores", JSON.stringify(advertisersArray))
          setProfitshareMerchants(advertisersArray)
          setCategories(["All", ...uniqueCategories])
        }
      } catch (error) {
        console.error("Error fetching stores:", error)
      }
    }
    fetchData()
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
  }

  // Category filtering
  const filterStores = (category) => {
    setSelectedCategory(category)
  }

  const handleVisitStore = (store) => {
    if (!visitedStores.some((s) => s.id === store.id)) {
      setVisitedStores((prev) => [...prev, store])
    }
    navigate(`/storedetails?store=${encodeURIComponent(JSON.stringify(store))}`)
  }

  // Main effect => recalculate displayedStores
  useEffect(() => {
    let sourceList = []
    // 1) Filter All / Visited / Favorites
    if (activeFilter === "Visited") {
      sourceList = [...visitedStores]
    } else if (activeFilter === "Favorites") {
      sourceList = [...favoriteStores]
    } else {
      sourceList = [...profitshareMerchants]
    }

    // 2) Filter by category
    if (selectedCategory !== "All") {
      sourceList = sourceList.filter((store) => store.category === selectedCategory)
    }

    // 3) Filter by search
    const q = searchQuery.trim().toLowerCase()
    if (q !== "") {
      sourceList = sourceList.filter((store) => store.name.toLowerCase().includes(q))
    }

    // 4) Sort
    if (sortByCashback) {
      sourceList.sort(
        (a, b) => getAverageCommission(b.commissions?.[0]?.value) - getAverageCommission(a.commissions?.[0]?.value),
      )
    }

    setDisplayedStores(sourceList)
  }, [searchQuery, activeFilter, selectedCategory, sortByCashback, profitshareMerchants, favoriteStores, visitedStores])

  // UI handling
  if (isAuthenticated === null) {
    return (
      <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
        <div className={styles.loader}></div>
      </div>
    )
  }
  if (!isAuthenticated) {
    return null // user not logged => return empty
  }

  return (
    <div className={`${styles.container} ${theme === "Dark" ? styles.darkContainer : ""}`}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.searchWrapper}>
          <i className={`${styles.searchIcon} material-icons`}>search</i>
          <input
            className={`${styles.searchInput} ${theme === "Dark" ? styles.darkSearchInput : ""}`}
            placeholder={i18n.t("home.search_placeholder")}
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
          {searchQuery.length > 0 && (
            <button onClick={() => setSearchQuery("")} className={styles.clearButton}>
              <i className="material-icons">cancel</i>
            </button>
          )}
        </div>
      </div>

      {/* CATEGORIES */}
      <div className={styles.categoriesWrapper}>
        <div className={styles.categoriesContainer}>
          {categories.map((category, index) => (
            <button
              key={index}
              className={`${styles.categoryItem} ${
                selectedCategory === category ? styles.selectedCategoryItem : ""
              } ${theme === "Dark" ? styles.darkCategoryItem : ""}`}
              onClick={() => filterStores(category)}
            >
              <i
                className={`material-icons ${styles.categoryIcon} ${
                  selectedCategory === category ? styles.selectedCategoryIcon : ""
                } ${theme === "Dark" ? styles.darkCategoryIcon : ""}`}
              >
                {categoryIcons[category] || "help_outline"}
              </i>
              <span
                className={`${styles.categoryText} ${
                  selectedCategory === category ? styles.selectedCategoryText : ""
                } ${theme === "Dark" ? styles.darkCategoryText : ""}`}
              >
                {category}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={styles.separator}></div>

      {/* FILTERS (All | Visited | Favorites) */}
      <div className={styles.filters}>
        {["All", "Visited", "Favorites"].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`${styles.filter} ${activeFilter === filter ? styles.activeFilter : ""}`}
          >
            <span className={activeFilter === filter ? styles.filterTextActive : styles.filterText}>
              {i18n.t(`home.filters.${filter.toLowerCase()}`)}
            </span>
          </button>
        ))}
      </div>

      {/* Sorting */}
      <button className={styles.sortButton} onClick={() => setSortByCashback((prev) => !prev)}>
        <i className="material-icons">{sortByCashback ? "trending_up" : "trending_down"}</i>
        <span className={styles.sortButtonText}>
          {sortByCashback ? i18n.t("home.sorting.highest_cashback") : i18n.t("home.sorting.default")}
        </span>
      </button>

      {/* STORE LIST */}
      <div className={styles.storeList}>
        {displayedStores.map((item) => (
          <StoreItem
            key={item.id.toString()}
            item={item}
            onVisitStore={handleVisitStore}
            toggleFavoriteStore={toggleFavoriteStore}
          />
        ))}
      </div>
    </div>
  )
}

export default memo(Index)

const StoreItem = memo(({ item, onVisitStore, toggleFavoriteStore }) => {
  const { theme } = useContext(ThemeContext)
  const { favoriteStores } = useContext(FavoritesContext)

  const cashbackData = calculateCashbackSplit(getAverageCommission(item.commissions?.[0]?.value))
  const isFavorite = favoriteStores.some((s) => s.id === item.id)

  const handleFavoriteClick = (e) => {
    e.stopPropagation() // Prevent triggering the parent onClick
    toggleFavoriteStore(item)
  }

  return (
    <div
      className={`${styles.storeCard} ${theme === "Dark" ? styles.darkStoreCard : ""}`}
      onClick={() => onVisitStore(item)}
    >
      <div className={styles.storeContainer}>
        <img src={item.logo ? `https:${item.logo}` : placeholderImage} alt={item.name} className={styles.storeLogo} />
        <div className={styles.storeInfo}>
          <h3 className={`${styles.storeName} ${theme === "Dark" ? styles.darkStoreName : ""}`}>{item.name}</h3>
          <p className={`${styles.storeCategory} ${theme === "Dark" ? styles.darkStoreCategory : ""}`}>
            {item.category}
          </p>
        </div>
        <span className={`${styles.cashbackRate} ${theme === "Dark" ? styles.darkCashbackRate : ""}`}>
          {item.id === "35"
            ? "10%"
            : cashbackData?.userCashback
              ? `${cashbackData.userCashback}%`
              : i18n.t("home.no_cashback")}
        </span>
        <button onClick={handleFavoriteClick} className={styles.favoriteButton}>
          <i className={`material-icons ${isFavorite ? styles.favoriteActive : ""}`}>
            {isFavorite ? "star" : "star_border"}
          </i>
        </button>
      </div>
    </div>
  )
})
