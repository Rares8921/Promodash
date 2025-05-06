import { useState, useContext, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TextInput,
  Alert 
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import i18n from "../../i18n";

export default function WithdrawalOptionsScreen() {
  const navigation = useNavigation();
  const router = useRouter();
  const { theme } = useContext(ThemeContext);
  const { user, loading } = useContext(UserContext);

  const userBalance = useMemo(() => user?.balance || 0, [user]);
  const userId = useMemo(() => user?.userId || "", [user]);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [iban, setIban] = useState("");

  const handleWithdraw = async () => {
    const amountNumber = parseFloat(withdrawAmount);

    if (isNaN(amountNumber) || amountNumber < 20) {
      Alert.alert(i18n.t("withdrawal.invalid_amount_title"), i18n.t("withdrawal.min_amount"));
      return;
    }

    if (amountNumber > userBalance) {
      Alert.alert(i18n.t("withdrawal.insufficient_funds_title"), i18n.t("withdrawal.insufficient_funds"));
      return;
    }

    if (!iban.trim()) {
      Alert.alert(i18n.t("withdrawal.missing_iban_title"), i18n.t("withdrawal.missing_iban"));
      return;
    }

    try {
      const response = await fetch("https://promodash.vercel.app/api/withdrawal_webhook/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          amount: amountNumber,
          iban: iban.trim()
        }),
      });

      const result = await response.json();
      if (response.ok) {
        Alert.alert(i18n.t("withdrawal.success_title"), i18n.t("withdrawal.success_message"));
        setWithdrawAmount("");
        setIban("");
      } else {
        Alert.alert(i18n.t("withdrawal.error_title"), result.error || i18n.t("withdrawal.error_message"));
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      Alert.alert(i18n.t("withdrawal.error_title"), i18n.t("withdrawal.failed_processing"));
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}>
        <Text style={{ textAlign: "center", marginTop: 20, color: theme === "Dark" ? "#fff" : "#000" }}>
          {i18n.t("withdrawal.loading")}
        </Text>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.container,
        theme === "Dark" && { backgroundColor: "#121212" },
      ]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          theme === "Dark" && { backgroundColor: "#1E1E1E" },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t("withdrawal.title")}</Text>
        <Ionicons name="time-outline" size={26} color="#fff" style={styles.historyIcon} />
      </View>

      {/* Balance Card */}
      <View
        style={[
          styles.balanceCard,
          theme === "Dark" && {
            backgroundColor: "#1E1E1E",
            borderColor: "#333",
          },
        ]}
      >
        <Text style={[styles.balanceLabel, theme === "Dark" && { color: "#bbb" }]}>
          {i18n.t("withdrawal.balance")}
        </Text>
        <Text style={[styles.balanceAmount, theme === "Dark" && { color: "#FFD700" }]}>
          {userBalance.toFixed(2)} RON
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#ddd" }]}>
          {i18n.t("withdrawal.methods")}
        </Text>

        {/* Metode de plata */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.methodScrollContainer}
        >
          <View style={[styles.methodButton, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}>
            <Image source={require("../../assets/images/visa.png")} style={styles.methodIcon} />
          </View>
          <View style={[styles.methodButton, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}>
            <Image source={require("../../assets/images/mastercard.png")} style={styles.methodIcon} />
          </View>
          <View style={[styles.methodButton, theme === "Dark" && { backgroundColor: "#1E1E1E" }]}>
            <Image source={require("../../assets/images/raiffeisen.png")} style={styles.methodIcon} />
          </View>
          <View style={styles.methodButton}>
              <Image source={require("../../assets/images/bcr.png")} style={styles.bcrIcon} />
          </View>
          <View style={styles.methodButton}>
              <Image source={require("../../assets/images/ing.png")} style={styles.ingIcon} />
          </View>
        </ScrollView>

        {/* Introducere suma */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, theme === "Dark" && { color: "#ddd" }]}>
            {i18n.t("withdrawal.amount_label")}
          </Text>
          <View
            style={[
              styles.amountBox,
              theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" },
            ]}
          >
            <TextInput
              style={[styles.amountInput, theme === "Dark" && { color: "#ddd" }]}
              keyboardType="numeric"
              placeholder={i18n.t("withdrawal.amount_placeholder")}
              placeholderTextColor="#999"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
            />
          </View>
          <Text style={[styles.limitText, theme === "Dark" && { color: "#888" }]}>
            {i18n.t("withdrawal.min_amount")}
          </Text>
        </View>

        {/* IBAN */}
        <View style={styles.inputContainer}>
          <Text style={[styles.inputLabel, theme === "Dark" && { color: "#ddd" }]}>
            {i18n.t("withdrawal.iban_label")}
          </Text>
          <View
            style={[
              styles.amountBox,
              theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" },
            ]}
          >
            <TextInput
              style={[styles.amountInput, theme === "Dark" && { color: "#ddd" }]}
              placeholder="RO49AAAA1B31007593840000"
              placeholderTextColor="#999"
              value={iban}
              onChangeText={setIban}
            />
          </View>
          <Text style={[styles.limitText, theme === "Dark" && { color: "#888" }]}>
            {i18n.t("withdrawal.iban_warning")}
          </Text>
        </View>

        {/* Buton de retragere */}
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            theme === "Dark" && { backgroundColor: "#333" },
          ]}
          onPress={handleWithdraw}
        >
          <Text
            style={[
              styles.withdrawButtonText,
              theme === "Dark" && { color: "#FFD700" },
            ]}
          >
            {i18n.t("withdrawal.withdraw_button")}
          </Text>
        </TouchableOpacity>

        <View style={{ alignItems: "center", paddingBottom: 20 }}>
            <TouchableOpacity 
                style={styles.conditionsButton} 
                onPress={() => router.push("/conditions")}
            >
                <Text style={[styles.conditionsText, theme === "Dark" && { color: "#FFD700" }]}>
                    {i18n.t("withdrawal.conditions")}
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  backButton: {
    padding: 5,
    marginBottom: -3,
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    left: -14,
  },

  historyIcon: {
    position: "absolute",
    right: 20,
    bottom: 20, // aliniat cu titlul
  },

  // restul ramane la fel...
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
    marginTop: 20,
    marginBottom: 20,
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

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
  },

  methodScrollContainer: {
    flexDirection: "row",
    paddingHorizontal: 15,
    paddingVertical: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  methodButton: {
    backgroundColor: "#fff",
    width: 120,
    height: 70,
    borderRadius: 12,
    marginHorizontal: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  methodIcon: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  inputContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  amountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  limitText: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
  },

  withdrawButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 14,
    borderRadius: 25,
    marginTop: 25,
    marginHorizontal: 20,
    alignItems: "center",
    elevation: 4,
  },
  withdrawButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

  conditionsButton: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  conditionsText: {
    fontSize: 14,
    color: "#2575fc",
    fontWeight: "bold",
    left: 4.5,
  },
  bcrIcon: {
    width: "110%",
    height: "100%",
    resizeMode: "contain",
  },

  ingIcon: {
    width: "120%",
    height: "100%",
    resizeMode: "contain",
  },
});
