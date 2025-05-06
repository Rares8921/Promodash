import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { logout } from "../../lib/appwrite";
import { useContext, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { LanguageContext } from "../context/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import i18n from "../../i18n";
import React, { memo } from "react";

const AccountScreen = memo(function AccountScreen() {
  const { theme } = useContext(ThemeContext);
  const { key } = useContext(LanguageContext);
  const router = useRouter();
  const isDarkMode = theme === "Dark";

  const { user } = useContext(UserContext);

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/login");
  };

  return (
    <LinearGradient 
      colors={isDarkMode ? ["#1F1F1F", "#121212"] : ["#F0F4F8", "#ffffff"]}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/images/un.png")} style={styles.logo} />
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, isDarkMode ? styles.darkCard : styles.lightCard]}>
          <LinearGradient
            colors={isDarkMode ? ["#2A2A2E", "#1F1F1F"] : ["#ffffff", "#f9f9f9"]}
            style={styles.gradientCard}
          >
            <Text style={[styles.balanceText, isDarkMode && { color: "#ccc" }]}>
              {i18n.t('account.total_balance')}
            </Text>
            <Text style={[styles.balanceAmount, isDarkMode && { color: "#FFD700" }]}>
              {user?.balance ?? "0.00"} RON
            </Text>
            <View style={[styles.divider, isDarkMode && { backgroundColor: "#444" }]} />
            <Text style={[styles.pendingText, isDarkMode && { color: "#aaa" }]}>
              {i18n.t('account.pending_credits')}: {user?.pendingCredits ?? "0.00"} RON
            </Text>
          </LinearGradient>
        </View>

        {/* Options List */}
        <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.scrollContent}>
          <View>
            <OptionItem icon="wallet-outline" label={i18n.t('account.my_cashback')} route="/cashback" theme={theme} />
            <OptionItem icon="cash-outline" label={i18n.t('account.withdraw_funds')} route="/withdrawal" theme={theme} />
            <OptionItem icon="pricetag-outline" label={i18n.t('account.codes')} route="/codes" theme={theme} />

            {/* Small spacer instead of divider */}
            <View style={{ height: 15 }} />

            <OptionItem icon="settings-outline" label={i18n.t('account.settings')} route="/settings" theme={theme} />
            <OptionItem icon="help-circle-outline" label={i18n.t('account.help')} route="/help" theme={theme} />
            <OptionItem icon="star-outline" label={i18n.t('account.rate_app')} theme={theme} />

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Ionicons name="log-out-outline" size={22} color="white" />
              <Text style={styles.logoutText}>{i18n.t('account.logout')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
});

export default AccountScreen;

const OptionItem = memo(({ icon, label, route, theme }) => {
  const router = useRouter();
  const isDarkMode = theme === "Dark";
  return (
    <TouchableOpacity
      style={[
        styles.optionItem,
        isDarkMode ? styles.darkOption : styles.lightOption,
      ]}
      onPress={() => route && router.push(route)}
    >
      <Ionicons name={icon} size={24} color={isDarkMode ? "#FFD700" : "#2575fc"} />
      <Text style={[styles.optionText, isDarkMode && { color: "#eee" }]}>{label}</Text>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    alignItems: "center",
    marginTop: 15,
    marginBottom: 15, // mai apropiat de card
  },
  logo: {
    width: 240,   // marit vizibil
    height: 80,
    resizeMode: "contain",
  },
  balanceCard: {
    width: "90%",
    alignSelf: "center",
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,  // mai mic decat inainte
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
  },
  lightCard: {
    borderColor: "#e0e0e0",
    backgroundColor: "#fff",
  },
  darkCard: {
    borderColor: "#333",
    backgroundColor: "#1F1F1F",
  },
  gradientCard: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: "center",
    borderRadius: 20,
  },
  balanceText: {
    fontSize: 18,
    fontWeight: "600",
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2575fc",
    marginVertical: 8,
  },
  divider: {
    width: "85%",
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 15,
  },
  pendingText: {
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingBottom: 50,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  lightOption: {
    backgroundColor: "#fff",
  },
  darkOption: {
    backgroundColor: "#1E1E1E",
  },
  optionText: {
    fontSize: 18,
    marginLeft: 15,
    fontWeight: "500",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    backgroundColor: "#e53935",
    borderRadius: 14,
    marginTop: 30,
    marginHorizontal: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  logoutText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginLeft: 10,
  },
});
