import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import i18n from "../../i18n";

export default function CashbackScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);

  const { user } = useContext(UserContext);

  if (user === null) {
    return (
      <SafeAreaView style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}>
        <Text style={{ textAlign: "center", marginTop: 20, color: theme === "Dark" ? "#fff" : "#000" }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}>
      
      {/* Header */}
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('cashback.title')}</Text>
        <Ionicons name="wallet" size={26} color="#fff" style={styles.walletIcon} />
      </Animated.View>

      {/* Card cu balanta */}
      <Animated.View entering={FadeInDown.duration(600)} style={[styles.balanceCard, theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" }]}>
        <Text style={[styles.balanceLabel, theme === "Dark" && { color: "#bbb" }]}>{i18n.t('cashback.total_balance')}</Text>
        <Text style={[styles.balanceAmount, theme === "Dark" && { color: "#FFD700" }]}>{user?.balance ?? "0.00"} RON</Text>
        <View style={[styles.divider, theme === "Dark" && { backgroundColor: "#444" }]} />
        <Text style={[styles.pendingLabel, theme === "Dark" && { color: "#bbb" }]}>{i18n.t('cashback.pending_credits')}</Text>
        <Text style={[styles.pendingAmount, theme === "Dark" && { color: "#ddd" }]}>{user?.pendingCredits ?? "0.00"} RON</Text>
      </Animated.View>

      {/* Mesaj dinamic */}
      <View style={styles.emptyState}>
        <Ionicons name="wallet-outline" size={50} color={theme === "Dark" ? "#666" : "#999"} style={styles.emptyIcon} />
        <Text style={[styles.emptyText, theme === "Dark" && { color: "#bbb" }]}>
          {user.balance === 0 ? 
            i18n.t('cashback.no_cashback') : 
            i18n.t('cashback.cashback') 
          }
        </Text>

        <TouchableOpacity style={[styles.chooseStoreButton, theme === "Dark" && { backgroundColor: "#333", shadowColor: "transparent" }]} onPress={() => navigation.navigate("Tabs", { screen: "index" })}>
          <Text style={[styles.chooseStoreText, theme === "Dark" && { color: "#FFD700" }]}>
            {i18n.t('cashback.choose_store')}
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC", 
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
    height: 140,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    left: -12,
    flex: 1,
  },
  walletIcon: {
    position: "absolute",
    right: 20,
  },

  balanceCard: {
    backgroundColor: "#fff", 
    padding: 25,
    width: "90%",
    alignSelf: "center",
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
    marginTop: -40,
    borderWidth: 1,
    borderColor: "#EAEAEA",
  },
  balanceLabel: {
    fontSize: 16,
    color: "#666", 
  },
  balanceAmount: {
    fontSize: 38,
    fontWeight: "bold",
    color: "#2575fc", 
    marginVertical: 5,
  },
  pendingLabel: {
    fontSize: 14,
    color: "#777",
    marginTop: 10,
  },
  pendingAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#444",
  },
  divider: {
    width: "80%",
    height: 1,
    backgroundColor: "#ddd", 
    marginVertical: 10,
  },

  emptyState: {
    marginTop: 70,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  emptyIcon: {
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 16,
    color: "#555", 
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },

  chooseStoreButton: {
    backgroundColor: "#2575fc", 
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    marginTop: 20,
    shadowColor: "#2575fc",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  chooseStoreText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
