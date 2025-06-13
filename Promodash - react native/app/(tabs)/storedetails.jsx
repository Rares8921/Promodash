// Importing necessary libraries and components
import React, { useMemo, useContext, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { getPromoBoost } from "../../lib/appwrite";
import { generateAffiliateLink } from "../../lib/profitshare";
import { Linking } from "react-native";
import { getAverageCommission, calculateCashbackSplit, calculateCashback } from "../../lib/cashbackCalculator";
import i18n from "../../i18n";
import { FavoritesContext } from "../context/FavoritesContext";

// Main component for displaying store details
export default function StoreDetailsScreen() {
  // Hooks for navigation and routing
  const navigation = useNavigation();
  const router = useRouter();

  // Accessing theme context for light/dark mode
  const { theme } = useContext(ThemeContext);

  const { user } = useContext(UserContext);
  const [promoBoost, setPromoBoost] = useState(null);

  // Accessing route parameters
  const route = useRoute();

  // Accessing favorite stores context
  const { favoriteStores, toggleFavoriteStore } = useContext(FavoritesContext);

  // Parsing store details from route parameters
  const parsedStore = useMemo(() => {
    const store = route.params?.store || {};
    return store ? JSON.parse(store) : {};
  }, [route.params]);

  // Extracting commission range and calculating average commission
  const commissionRange = parsedStore.commissions?.[0]?.value || "0%";
  const averageCommission = getAverageCommission(commissionRange);

  const promoList = promoBoost ? [promoBoost] : [];
  let overrideCashback = null;

  if (parsedStore.id === "35") {
    const boost = promoList.length > 0 && promoList[0].percentageBoost
      ? promoList[0].percentageBoost
      : 0;
    overrideCashback = 10 + boost;
  }

  const baseSplit = calculateCashbackSplit( averageCommission, user, [], overrideCashback != null ? 10 : null);
  const boostedSplit = calculateCashbackSplit(averageCommission, user, promoList, overrideCashback);

  const originalCashback = baseSplit.userCashback;
  const finalCashback = boostedSplit.userCashback;

  // Checking if the store is marked as favorite
  const isFavorite = favoriteStores.some((fav) => fav.id === parsedStore.id);

  // State for storing logo URI and affiliate link
  const [parsedStoreLogo, setLogoUri] = useState(require("../../assets/images/un.png"));
  const [affiliateLink, setAffiliateLink] = useState(null);

  // Fetching affiliate link asynchronously
  useEffect(() => {
    async function fetchAffiliateLink() {
      if (parsedStore.name && parsedStore.url && parsedStore.id && (promoBoost || user?.Active_Code === null || user?.Active_Code === undefined || user?.Active_Code.length == 0)) {
        try {
          const link = await generateAffiliateLink(parsedStore.name, parsedStore.url, parsedStore.id, finalCashback / (overrideCashback != null ? 1.5 : 1));
          setAffiliateLink(link);
        } catch (error) {
          console.error("Error generating affiliate link:", error);
        }
      } 
    }
    fetchAffiliateLink();
  }, [parsedStore.name, parsedStore.url, parsedStore.id, finalCashback / (overrideCashback != null ? 1.5 : 1)]);

  useEffect(() => {
    if (user?.Active_Code) {
      getPromoBoost(user.Active_Code).then((boost) => {
        if (boost) setPromoBoost(boost);
      });
    }
  }, [user?.Active_Code]);

  // Caching store details locally
  useEffect(() => {
    async function cacheStore() {
      const cachedStores = await AsyncStorage.getItem("cachedStores");
      if (cachedStores) {
        const storeList = JSON.parse(cachedStores);
        const foundStore = storeList.find((s) => s.id === store.id);
        if (foundStore) {
          setStore(foundStore);
        }
      }
    }
    cacheStore();
  }, []);

  // Updating logo URI if available
  useEffect(() => {
    if (parsedStore.logo) {
      setLogoUri({ uri: parsedStore.logo.startsWith("//") ? `https:${parsedStore.logo}` : parsedStore.logo });
    }
  }, [parsedStore.logo]);

  // Handler for navigating to the store's website
  const handleGoToStore = async () => {
    if (!parsedStore.name || !parsedStore.url) {
      Alert.alert(i18n.t("store_details.error_title"), i18n.t("store_details.missing_info"));
      return;
    }

    try {
      Linking.openURL(affiliateLink);
    } catch (error) {
      Alert.alert(i18n.t("store_details.error_title"), i18n.t("store_details.unable_to_open"));
      console.error("Error accessing link:", error);
    }
  };

  // Toggling favorite status for the store
  const toggleFavorite = () => {
    toggleFavoriteStore(parsedStore);
  };

  // Calculating cashback based on user type
  const cashback = calculateCashback(parsedStore.amountSpent, user.isPremium ? "premium" : "default");

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {/* HEADER */}
      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={30} color={theme === "Dark" ? "#fff" : "#000"} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === "Dark" && styles.darkHeaderTitle]}>
          {parsedStore?.name || i18n.t("store_details.default_store_name")}
        </Text>
        <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
          <Ionicons
            name={isFavorite ? "star" : "star-outline"}
            size={30}
            color={isFavorite ? "#FFD700" : theme === "Dark" ? "#FFD700" : "#000"}
          />
        </TouchableOpacity>
      </View>

      {/* CASHBACK SECTION */}
      <View style={[styles.cashbackContainer, theme === "Dark" && styles.darkCashback]}>
        <Image
          source={typeof parsedStoreLogo === "string" ? { uri: parsedStoreLogo, cache: 'force-cache' } : parsedStoreLogo}
          style={styles.storeLogo}
        />

        <Text style={[styles.cashbackText, theme === "Dark" && styles.darkCashbackText]}>
          {i18n.t("store_details.cashback")}:{" "}
          {user?.Active_Code && promoBoost ? (
            <>
              <Text style={{ textDecorationLine: "line-through", color: "#888" }}>
                {originalCashback}%
              </Text>{" "}
              {finalCashback}%
            </>
          ) : (
            `${originalCashback}%`
          )}
        </Text>

        <TouchableOpacity
          style={[
            styles.transferButton,
            theme === "Dark" && styles.darkTransferButton,
          ]}
          onPress={handleGoToStore}
        >
          <Text
            style={[
              styles.transferButtonText,
              theme === "Dark" && styles.darkTransferButtonText,
            ]}
          >
            {i18n.t("store_details.go_to_store")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* PRODUCTS PAGE */}
      <TouchableOpacity
        style={[
          styles.productsButton,
          theme === "Dark" && styles.darkProductsButton,
        ]}
        onPress={() =>
          router.push({
            pathname: "/products",
            params: {
              storeId: parsedStore.id,
              storeName: parsedStore.name,
              storeUrl: affiliateLink,
            },
          })
        }
      >
        <Text
          style={[
            styles.transferButtonText,
            theme === "Dark" && styles.darkTransferButtonText,
          ]}
        >
          🎁 {i18n.t("store_details.current_products") || "Best Offers Right Now!"} 🎁
        </Text>
      </TouchableOpacity>

      {/* CONDITIONS & REVIEWS TABS */}
      <View style={styles.tabsContainer}>
        <Text style={[styles.tab, { color: theme === "Dark" ? "#fff" : "#007bff" }]}>
          {i18n.t("store_details.conditions")}
        </Text>
      </View>

      {/* CASHBACK INFORMATION */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.infoBox, theme === "Dark" && styles.darkInfoBox]}>
          <Ionicons name="time-outline" size={24} color={theme === "Dark" ? "#FFD700" : "#000"} />
          <Text style={[styles.infoTitle, theme === "Dark" && styles.darkInfoTitle]}>
            {i18n.t("store_details.credit_time")}
          </Text>
          <Text style={[styles.infoText, theme === "Dark" && styles.darkInfoText]}>
            ✅ {i18n.t("store_details.average_pending")}: 3 {i18n.t("store_details.days") + "\n"}
            ✅ {i18n.t("store_details.average_confirmed")}: 5 {i18n.t("store_details.days") + "\n"}
            ✅ {i18n.t("store_details.max_confirmed")}: 60 {i18n.t("store_details.days")}
          </Text>
        </View>


        <View style={[styles.infoBox, theme === "Dark" && styles.darkInfoBox]}>
          <Ionicons name="calendar-outline" size={24} color={theme === "Dark" ? "#FFD700" : "#000"} />
          <Text style={[styles.infoTitle, theme === "Dark" && styles.darkInfoTitle]}>
            {i18n.t("store_details.commission_period")}
          </Text>
          <Text style={[styles.infoText, theme === "Dark" && styles.darkInfoText]}>
            🕒 {i18n.t("store_details.commission_period_value")}
          </Text>
        </View>


        <View style={[styles.infoBox, theme === "Dark" && styles.darkInfoBox]}>
          <Ionicons name="information-circle-outline" size={24} color={theme === "Dark" ? "#FFD700" : "#007AFF"} />
          <Text style={[styles.infoTitle, theme === "Dark" && styles.darkInfoTitle]}>
            {i18n.t("store_details.info_conditions")}
          </Text>
          <Text style={[styles.infoText, theme === "Dark" && styles.darkInfoText]}>
            ⚠️ {i18n.t("store_details.no_cashback_vouchers") + "\n"}
            ⚠️ {i18n.t("store_details.cashback_net_value")}
          </Text>
        </View>

        <View style={[styles.warningBox, theme === "Dark" && styles.darkWarningBox]}>
          <Text style={[styles.warningText, theme === "Dark" && styles.darkWarningText]}>
            ⚠️ {i18n.t("store_details.warning_mobile")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFC" },
  darkContainer: { backgroundColor: "#121212" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    paddingVertical: 25,
    paddingTop: 45,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  darkHeader: { backgroundColor: "#1E1E1E", borderColor: "#333" },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#000" },
  darkHeaderTitle: { color: "#fff" },
  backButton: { padding: 8 },
  favoriteButton: { padding: 8 },


  cashbackContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    margin: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  darkCashback: { backgroundColor: "#1E1E1E" },
  cashbackText: { fontSize: 20, fontWeight: "bold", color: "#444", marginTop: 10 },
  darkCashbackText: { color: "#FFD700" },
  storeLogo: {  width: 100,
    height: 100,
    marginBottom: 10,
    resizeMode: 'contain', 
    backgroundColor: '#fff', 
    borderRadius: 10,
      },

  transferButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginTop: 15,
  },

  darkTransferButton: {
    backgroundColor: "#FFD700",
  },

  productsButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 12,
    width: "75%",        
    alignSelf: "center",  
    borderRadius: 25,
    marginTop: 10,
    alignItems: "center",
  },

  darkProductsButton: {
    backgroundColor: "#FFD700", // gold on dark theme
  },

  transferButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },

  darkTransferButtonText: {
    color: "#000",
  },

  tabsContainer: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ddd", paddingVertical: 12 },
  tab: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#888" },
  activeTab: { color: "#000"},

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  infoBox: { padding: 18, borderRadius: 12, backgroundColor: "#F5F5F5", marginBottom: 15 },
  darkInfoBox: { backgroundColor: "#1E1E1E" },
  infoTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginBottom: 8 },
  darkInfoTitle: { color: "#FFD700" },
  infoText: { fontSize: 15, color: "#555" },
  darkInfoText: { color: "#BBB" },

  warningBox: { padding: 18, borderRadius: 12, backgroundColor: "#FFF3CD", marginTop: 15 },
  darkWarningBox: { backgroundColor: "#333" },
  warningText: { fontSize: 15, color: "#856404", fontWeight: "bold" },
  darkWarningText: { color: "#FFD700" },
});