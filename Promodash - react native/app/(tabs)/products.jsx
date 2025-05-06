import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, Alert, Linking, TextInput } from "react-native";
import { ThemeContext } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getProductsByStore } from "../../lib/profitshare";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../i18n";

export default function ProductsScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
  const { storeId, storeName, storeUrl } = route.params || {};

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const cachedData = await AsyncStorage.getItem(`cachedProducts_${storeId}`);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          const isValid = Date.now() - parsed.timestamp < 5 * 60 * 1000;
          if (isValid && Array.isArray(parsed.products)) {
            setProducts(parsed.products);
            setLoading(false);
            return;
          }
        }

        const res = await getProductsByStore(storeId);
        const prods = res?.result?.products || [];
        await AsyncStorage.setItem(
          `cachedProducts_${storeId}`,
          JSON.stringify({ products: prods, timestamp: Date.now() })
        );
        setProducts(prods);
      } catch (error) {
        Alert.alert(
          i18n.t("products.error"),
          "🎯 " + i18n.t("products.no_products"),
          [
            { text: i18n.t("products.close"), style: "cancel" },
            {
              text: i18n.t("products.website"),
              style: "default",
              onPress: () => Linking.openURL(storeUrl),
            },
          ],
          { cancelable: true }
        );
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, [storeId]);

  useEffect(() => {
    let list = [...products];
    if (selectedCategory !== "All") {
      list = list.filter(p => p.category_name === selectedCategory);
    }
    if (searchQuery.trim() !== "") {
      list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    list.sort((a, b) => sortOrder === "asc" ? a.price_vat - b.price_vat : b.price_vat - a.price_vat);
    setFilteredProducts(list);

    const uniqueCategories = Array.from(new Set(products.map(p => p.category_name)));
    setCategories(["All", ...uniqueCategories]);
  }, [products, selectedCategory, sortOrder, searchQuery]);

  const handleOpenProduct = (link) => {
    if (link) Linking.openURL(link);
  };

  const refreshProducts = async () => {
    try {
      setRefreshing(true);
      const res = await getProductsByStore(storeId);
      const prods = res?.result?.products || [];
      await AsyncStorage.setItem(
        `cachedProducts_${storeId}`,
        JSON.stringify({ products: prods, timestamp: Date.now() })
      );
      setProducts(prods);
    } catch (error) {
      Alert.alert(i18n.t("products.error"), i18n.t("products.no_products"));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loader, theme === "Dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "Dark" ? "#FFD700" : "#2575fc"} />
      </View>
    );
  }

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      <View style={[styles.header, theme === "Dark" ? styles.darkHeader : styles.lightHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{storeName}</Text>
        <TouchableOpacity
          onPress={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          style={styles.sortButton}
        >
          <Ionicons name={sortOrder === "asc" ? "trending-up" : "trending-down"} size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={[styles.searchWrapper, theme === "Dark" ? styles.darkSearchWrapper : styles.lightSearchWrapper]}>
        <Ionicons name="search-outline" size={20} color="#888" style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, theme === "Dark" && styles.darkSearchInput]}
          placeholder={i18n.t("home.search_placeholder")}
          placeholderTextColor={theme === "Dark" ? "#aaa" : "#888"}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#888" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={categories}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        style={{ paddingHorizontal: 10, marginVertical: 10 }}
        contentContainerStyle={{ alignItems: "center" }}
        renderItem={({ item }) => {
          const isActive = selectedCategory === item;
          return (
            <TouchableOpacity
              onPress={() => setSelectedCategory(item)}
              style={[
                styles.filterButton,
                theme === "Dark" && styles.darkFilterButton,
                isActive && (theme === "Dark" ? styles.darkActiveFilter : styles.activeFilter),
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  theme === "Dark" && styles.darkFilterText,
                  isActive && (theme === "Dark" ? styles.darkActiveFilterText : styles.activeFilterText),
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={filteredProducts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handleOpenProduct(item.link)}
            style={[styles.productCard, theme === "Dark" && styles.darkProductCard]}
          >
            <Image source={{ uri: item.image, cache: 'force-cache' }} style={styles.productImage} />
            <View style={styles.productInfo}>
              <Text style={[styles.productName, theme === "Dark" && styles.darkProductName]} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={[styles.productPrice, theme === "Dark" && styles.darkProductPrice]}>
                {item.price_vat.toFixed(2)} RON
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshing={refreshing}
        onRefresh={refreshProducts}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFC" },
  darkContainer: { backgroundColor: "#121212" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  lightHeader: { backgroundColor: "#2575fc" },
  darkHeader: { backgroundColor: "#1E1E1E" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 45,
    paddingBottom: 15,
    justifyContent: "space-between",
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" },
  backButton: { padding: 5 },
  sortButton: { padding: 8, backgroundColor: "transparent" },

  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 15,
    borderRadius: 10,
    height: 45,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  lightSearchWrapper: { backgroundColor: "#fff" },
  darkSearchWrapper: { backgroundColor: "#222" },
  searchIcon: { marginRight: 10 },
  searchInput: { flex: 1, color: "#000" },
  darkSearchInput: { color: "#fff" },
  clearButton: { padding: 5 },

  filterButton: {
    paddingHorizontal: 16,
    backgroundColor: "#eee",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    height: 50,
    justifyContent: "center",
    minWidth: 90,
  },
  darkFilterButton: {
    backgroundColor: "#222",
    borderColor: "#444",
  },
  activeFilter: {
    backgroundColor: "#2575fc",
    borderColor: "#2575fc",
  },
  darkActiveFilter: {
    backgroundColor: "#FFD700",
    borderColor: "#FFD700",
  },
  filterText: { color: "#555", fontSize: 14, textAlign: "center" },
  darkFilterText: { color: "#ccc", fontSize: 14, textAlign: "center" },
  activeFilterText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  darkActiveFilterText: { color: "#000", fontWeight: "bold", textAlign: "center" },

  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 15,
    marginVertical: 6,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  darkProductCard: { backgroundColor: "#1E1E1E" },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    marginRight: 15,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "600", color: "#333" },
  darkProductName: { color: "#fff" },
  productPrice: { fontSize: 14, color: "#444", marginTop: 4 },
  darkProductPrice: { color: "#FFD700" },
});
