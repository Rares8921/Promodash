import React, { useEffect, useState, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Image, Dimensions, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { getAffiliateCampaigns, generateAffiliateLink } from "../../lib/profitshare";
import { Linking } from "react-native";
import i18n from "../../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAverageCommission, calculateCashbackSplit } from "../../lib/cashbackCalculator";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function CampaignsScreen() {
  const { theme } = useContext(ThemeContext);
  const navigation = useNavigation();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    async function fetchCampaigns() {
      try {
        const cachedData = await AsyncStorage.getItem("cachedCampaigns");
        const TTL = 60 * 60 * 1000; // 1 ora
        
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          const { data, timestamp } = parsedCache;
  
          if (Date.now() - timestamp < TTL) {
            setCampaigns(data);
            setLoading(false);
            return; // Folosim cache
          }
        }
  
        // Daca nu e in cache sau a expirat, facem fetch
        const res = await getAffiliateCampaigns();
        const campList = res?.result?.campaigns || [];
  
        if (campList.length === 0) {
          Alert.alert(
            i18n.t("products.error"),
            "🎯 " + i18n.t("products.no_products"),
            [{ text: i18n.t("products.close"), onPress: () => navigation.goBack() }],
            { cancelable: true }
          );
          return;
        }
  
        // Salvam in cache cu timestamp
        await AsyncStorage.setItem(
          "cachedCampaigns",
          JSON.stringify({
            data: campList,
            timestamp: Date.now(),
          })
        );
  
        setCampaigns(campList);
      } catch (error) {
        console.error("Error loading campaigns:", error);
        Alert.alert(
          i18n.t("products.error"),
          "🎯 " + i18n.t("products.no_products"),
          [{ text: i18n.t("products.close"), onPress: () => navigation.goBack() }],
          { cancelable: true }
        );
      } finally {
        setLoading(false);
      }
    }
    fetchCampaigns();
  }, []);  

  const handleOpenCampaign = async (campaign) => {
    try {
      const cachedStores = await AsyncStorage.getItem("cachedStores");
      let store = null;
  
      if (cachedStores) {
        const storesArray = JSON.parse(cachedStores);
        store = storesArray.find((s) => {
          if (!s.url) return false;
          return campaign.url.includes(s.url.replace(/^https?:\/\//, ""));
        });
      }
  
      if (!store) {
        console.error("No matching store found for campaign.");
        Alert.alert("Error", "No associated store found for this campaign.");
        return;
      }
  
      const commissionRange = store.commissions?.[0]?.value || "0%";
      const averageCommission = getAverageCommission(commissionRange);
      let { userCashback } = calculateCashbackSplit(averageCommission);
  
      if (store.id === "35") {
        userCashback = 10;
      }
  
      const affiliateLink = await generateAffiliateLink(
        store.name,
        campaign.url,
        store.id,
        userCashback
      );
  
      if (affiliateLink === "/") {
        Linking.openURL(campaign.url);
      } else {
        Linking.openURL(affiliateLink);
      }
    } catch (error) {
      console.error("Error opening campaign:", error);
      Linking.openURL(campaign.url);
    }
  };

  const refreshCampaigns = async () => {
    try {
      setRefreshing(true);
      const res = await getAffiliateCampaigns();
      const campList = res?.result?.campaigns || [];
      await AsyncStorage.setItem(
        "cachedCampaigns",
        JSON.stringify({ data: campList, timestamp: Date.now() })
      );
      setCampaigns(campList);
    } catch (error) {
      Alert.alert(i18n.t("products.error"), i18n.t("products.no_products"));
    } finally {
      setRefreshing(false);
    }
  };

  const getBestBanner = (banners) => {
    if (!banners) return null;
    const screenWidth = Dimensions.get('window').width;
    const sortedBanners = Object.entries(banners)
      .map(([size, info]) => ({
        size,
        width: info.width,
        height: info.height,
        src: info.src,
        diff: Math.abs(info.width - screenWidth),
      }))
      .sort((a, b) => a.diff - b.diff);
    return sortedBanners.length > 0 ? sortedBanners[0] : null;
  };

  const decodeHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/&icirc;/g, "î")
      .replace(/&acirc;/g, "â")
      .replace(/&atilde;/g, "ã")
      .replace(/&abreve;/g, "ă")
      .replace(/&scedil;/g, "ș")
      .replace(/&tcedil;/g, "ț")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, "\"")
      .replace(/&#39;/g, "'");
  };
  

  if (loading) {
    return (
      <View style={[styles.loader, theme === "Dark" && { backgroundColor: "#121212" }]}>
        <ActivityIndicator size="large" color={theme === "Dark" ? "#FFD700" : "#2575fc"} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}>
      
      {/* HEADER */}
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t("campaigns.title")}</Text>
        <Ionicons name="pricetags" size={26} color="#fff" style={styles.headerIcon} />
      </Animated.View>

      {/* LISTA CAMPANII */}
      <FlatList
        data={campaigns}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.campaignCard, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}
            onPress={() => handleOpenCampaign(item)}
          >
            {(() => {
              const bestBanner = getBestBanner(item.banners);
              if (bestBanner) {
                return (
                  <Image
                    source={{ uri: bestBanner.src.startsWith("//") ? `https:${bestBanner.src}` : bestBanner.src, cache: 'force-cache' }}
                    style={styles.campaignLogo}
                  />
                );
              }
              return null;
            })()}
            <View style={styles.campaignInfo}>
              <Text style={[styles.campaignTitle, theme === "Dark" && { color: "#fff" }]}>{decodeHtml(item.name)}</Text>
              <Text style={styles.campaignDates}>
                {item.startDate} ➔ {item.endDate || i18n.t("products.no_end_date")}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshing={refreshing}
        onRefresh={refreshCampaigns}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: "#2575fc",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    height: 110,
  },
  backButton: {
    padding: 5,
    marginTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    left: -12,
    marginTop: 15,
    flex: 1,
  },
  headerIcon: {
    right: 20,
    marginTop: 20,
  },
  campaignCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginVertical: 10,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  campaignLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 15,
    resizeMode: "contain",
    backgroundColor: "#fff",
  },
  campaignInfo: {
    flex: 1,
  },
  campaignTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  campaignDates: {
    fontSize: 14,
    color: "#777",
    marginTop: 5,
  },
});
