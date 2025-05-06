import { useState, useEffect, useContext, useMemo, memo, useCallback } from "react";
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Image,
  SafeAreaView, ActivityIndicator, ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ThemeContext } from "../context/ThemeContext";
import { FavoritesContext } from "../context/FavoritesContext";
import { LanguageContext } from "../context/LanguageContext";
import useAuth from "../../hooks/useAuth";
import { getAdvertisers } from "../../lib/profitshare";
import { categoryIcons } from "../../constants/Icons";
import { useRouter } from "expo-router";
import { getAverageCommission, calculateCashbackSplit } from "../../lib/cashbackCalculator";
import i18n from "../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

const placeholderImage = require("../../assets/images/un.png");

/** STORES SCREEN */
function StoresScreen() {
  const router = useRouter();

  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const { favoriteStores, toggleFavoriteStore } = useContext(FavoritesContext);

  const isAuthenticated = useAuth();

  // Date
  const [searchQuery, setSearchQuery] = useState("");
  const [profitshareMerchants, setProfitshareMerchants] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [visitedStores, setVisitedStores] = useState([]);
  const [favoriteList, setFavoriteList] = useState([]); // eventual

  // Filtre
  const [activeFilter, setActiveFilter] = useState("All"); // All | Visited | Favorites
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortByCashback, setSortByCashback] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const cachedData = await AsyncStorage.getItem("cachedStores");
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const isValid = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000; // 24h
          if (isValid && Array.isArray(parsed.data)) {
            setProfitshareMerchants(parsed.data);
            setCategories([
              "All",
              ...new Set(parsed.data.map((store) => store.category)),
            ]);
            return;
          }
        }
        const data = await getAdvertisers();
        if (data && data.result) {
          const advertisersArray = Object.values(data.result);
          const uniqueCategories = [
            ...new Set(advertisersArray.map((store) => store.category)),
          ];
          await AsyncStorage.setItem(
            "cachedStores",
            JSON.stringify({ data: advertisersArray, timestamp: Date.now() })
          );
          setProfitshareMerchants(advertisersArray);
          setCategories(["All", ...uniqueCategories]);
        }
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    }
    fetchData();
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  // Filtrare categorie
  const filterStores = (category) => {
    setSelectedCategory(category);
  };

  const handleVisitStoreMemo = useCallback(
    (store) => {
      if (!visitedStores.some((s) => s.id === store.id)) {
        setVisitedStores((prev) => [...prev, store]);
      }
      router.push({
        pathname: "/storedetails",
        params: { store: JSON.stringify(store) },
      });
    },
    [visitedStores, router]
  );

  const toggleFavoriteStoreMemo = useCallback(
    (store) => {
      toggleFavoriteStore(store);
    },
    [toggleFavoriteStore]
  );

  // Efect principal => recalc displayedStores
  const displayedStores = useMemo(() => {
    let sourceList = [];
    if (activeFilter === "Visited") {
      sourceList = [...visitedStores];
    } else if (activeFilter === "Favorites") {
      sourceList = [...favoriteStores];
    } else {
      sourceList = [...profitshareMerchants];
    }
  
    if (selectedCategory !== "All") {
      sourceList = sourceList.filter(
        (store) => store.category === selectedCategory
      );
    }
  
    const q = searchQuery.trim().toLowerCase();
    if (q !== "") {
      sourceList = sourceList.filter((store) =>
        store.name.toLowerCase().includes(q)
      );
    }
  
    if (sortByCashback) {
      sourceList.sort(
        (a, b) =>
          getAverageCommission(b.commissions?.[0]?.value) -
          getAverageCommission(a.commissions?.[0]?.value)
      );
    }
  
    return sourceList;
  }, [
    searchQuery,
    activeFilter,
    selectedCategory,
    sortByCashback,
    profitshareMerchants,
    favoriteStores,
    visitedStores,
  ]);
  

  const refreshStores = async () => {
    try {
      setRefreshing(true);
      const data = await getAdvertisers();
      if (data && data.result) {
        const advertisersArray = Object.values(data.result);
        const uniqueCategories = [
          ...new Set(advertisersArray.map((store) => store.category)),
        ];
        await AsyncStorage.setItem(
          "cachedStores",
          JSON.stringify({ data: advertisersArray, timestamp: Date.now() })
        );
        setProfitshareMerchants(advertisersArray);
        setCategories(["All", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error refreshing stores:", error);
    } finally {
      setRefreshing(false);
    }
  };  

  // Gestiune UI
  if (isAuthenticated === null) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { backgroundColor: theme === "Light" ? "#F9FAFC" : "#121212" },
        ]}
      >
        <ActivityIndicator size="large" color="#2575fc" />
      </SafeAreaView>
    );
  }
  if (!isAuthenticated) {
    return null; // user not logged => return empty
  }

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme === "Light" ? "#F9FAFC" : "#121212" },
      ]}
    >
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme === "Light" ? "#f6f6f6" : "#222" }]}>
        <View
          style={[
            styles.searchWrapper,
            { backgroundColor: theme === "Light" ? "#fff" : "#333" },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={20}
            color={theme === "Light" ? "#555" : "#aaa"}
            style={styles.searchIcon}
          />
          <TextInput
            style={[
              styles.searchInput,
              { color: theme === "Light" ? "#333" : "#ccc" },
            ]}
            placeholder={i18n.t("home.search_placeholder")}
            placeholderTextColor={theme === "Light" ? "#555" : "#ccc"}
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
              <Ionicons
                name="close-circle-outline"
                size={20}
                color={theme === "Light" ? "#555" : "#aaa"}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* CATEGORII */}
      <View style={styles.categoriesWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesContainer}
        >
          {categories.map((category, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.categoryItem,
                selectedCategory === category && {
                  borderBottomColor:
                    theme === "Light" ? "#2575fc" : "#FFD700",
                  borderBottomWidth: 2,
                },
              ]}
              onPress={() => filterStores(category)}
            >
              <Ionicons
                name={categoryIcons[category] || "help-circle-outline"}
                size={20}
                color={
                  selectedCategory === category
                    ? theme === "Light"
                      ? "#2575fc"
                      : "#FFD700"
                    : theme === "Light"
                    ? "#333"
                    : "#EEE"
                }
                style={styles.categoryIcon}
              />
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category &&
                    styles.categoryTextActive && {
                      color: theme === "Light" ? "#2575fc" : "#FFD700",
                    },
                  selectedCategory !== category && {
                    color: theme === "Light" ? "#333" : "#EEE",
                  },
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.separator} />

      {/* FILTRE (All | Visited | Favorites) */}
      <View style={styles.filters}>
      <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContainer}
        >
          {["All", "Visited", "Favorites", "Campaigns"].map((filter) => (
            <TouchableOpacity
              key={filter}
              onPress={() => {
                if (filter === "Campaigns") {
                  router.push("/campaigns");
                } else {
                  setActiveFilter(filter);
                }
              }}
              style={[
                activeFilter === filter
                  ? {
                      backgroundColor: theme === "Light" ? "#2575fc" : "#FFD700",
                      paddingVertical: 12,
                      paddingHorizontal: 25,
                      borderRadius: 22,
                      marginHorizontal: 8,
                    }
                  : styles.filter,
              ]}
            >
              <Text
                style={
                  activeFilter === filter
                    ? {
                      color: theme === "Light" ? "#fff" : "#000",
                      fontWeight: "bold",
                      fontSize: 15,
                    }
                    : styles.filterText
                }
              >
                {i18n.t(`home.filters.${filter.toLowerCase()}`)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Sortare */}
      <TouchableOpacity
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: theme === "Light" ? "#2575fc" : "#FFD700",
          paddingVertical: 10,
          paddingHorizontal: 15,
          borderRadius: 20,
          marginHorizontal: 10,
          marginBottom: 15
        }}
        onPress={() => setSortByCashback((prev) => !prev)}
      >
        <Ionicons
          name={sortByCashback ? "trending-up" : "trending-down"}
          size={20}
          color={theme === "Light" ? "#fff" : "#000"}
        />
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: theme === "Light" ? "#fff" : "#000",
            marginLeft: 5,
          }}
        >
          {sortByCashback
            ? i18n.t("home.sorting.highest_cashback")
            : i18n.t("home.sorting.default")}
        </Text>
      </TouchableOpacity>


      {/* LISTA DE MAGAZINE */}
      <FlatList
        data={displayedStores}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <StoreItem
            item={item}
            onVisitStore={handleVisitStoreMemo}
            toggleFavoriteStore={toggleFavoriteStoreMemo}
          />
        )}
        refreshing={refreshing}
        onRefresh={refreshStores}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </SafeAreaView>
  );
}

export default memo(StoresScreen);

const StoreItem = memo(({ item, onVisitStore, toggleFavoriteStore }) => {
  const { theme } = useContext(ThemeContext);
  const { favoriteStores } = useContext(FavoritesContext);

  const cashbackData = useMemo(() => {
    return calculateCashbackSplit(getAverageCommission(item.commissions?.[0]?.value));
  }, [item.commissions]);

  return (
    <TouchableOpacity
      onPress={() => onVisitStore(item)}
      style={[
        styles.storeCard,
        { backgroundColor: theme === "Light" ? "#fff" : "#1E1E1E" },
      ]}
    >
      <View style={styles.storeContainer}>
        <Image
          source={
            item.logo
              ? { uri: `https:${item.logo}`, cache: 'force-cache' }
              : placeholderImage
          }
          style={styles.storeLogo}
        />
        <View style={styles.storeInfo}>
          <Text
            style={[
              styles.storeName,
              { color: theme === "Light" ? "#333" : "#DDD" },
            ]}
          >
            {item.name}
          </Text>
          <Text
            style={[
              styles.storeCategory,
              { color: theme === "Light" ? "#777" : "#BBB" },
            ]}
          >
            {item.category}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: theme === "Light" ? "#2575fc" : "#FFD700",
            textAlign: "center",
            padding: 5,
          }}
        >
          {item.id === "35" ? "10%" : (cashbackData?.userCashback
            ? `${cashbackData.userCashback}%`
            : i18n.t("home.no_cashback"))}
        </Text>
        <TouchableOpacity
          onPress={() => toggleFavoriteStore(item)}
          style={styles.favoriteButton}
        >
          <Ionicons
            name={
              favoriteStores.some((s) => s.id === item.id)
                ? "star"
                : "star-outline"
            }
            size={24}
            color={
              favoriteStores.some((s) => s.id === item.id)
                ? "#FFD700"
                : "#888"
            }
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
});


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 15,
    paddingTop: 40,
    paddingBottom: 15,
    height: 90,
    justifyContent: "space-between",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    flex: 1,
    height: 45,
  },
  searchIcon: {
    position: "absolute",
    left: 15,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "transparent",
    color: "#fff",
    paddingLeft: 50,
    fontSize: 16,
  },
  clearButton: {
    padding: 10,
  },

  categoriesWrapper: {
    marginTop: 20,
    paddingVertical: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 15,
  },
  categoryItem: {
    alignItems: "center",
    marginRight: 20,
    width: 100,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    textAlign: "center",
  },
  categoryText: {
    fontSize: 14,
    color: "#333",
    textAlign: "center",
  },
  categoryTextActive: {
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#333",
    marginBottom: 10,
    marginTop: -10,
  },

  filters: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 15,
    marginTop: -10,
  },
  filter: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 22,
    marginHorizontal: 8,
  },
  activeFilter: {
    backgroundColor: "#ffcc00",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 22,
    marginHorizontal: 8,
  },
  
  filterText: {
    color: "#333",
    fontSize: 15,
    flexShrink: 1,
  },

  filterTextActive: {
    color: "#000",
    fontWeight: "bold",
    fontSize: 15,
  },

  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
  },
  storeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 10,
  },
  storeLogo: {
    width: 55,
    height: 55,
    borderRadius: 12,
    marginRight: 15,
    resizeMode: "contain",
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333",
  },
  storeCategory: {
    fontSize: 14,
    color: "#777",
  },
  favoriteButton: {
    padding: 10,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});