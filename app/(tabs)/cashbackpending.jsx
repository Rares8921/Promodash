import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import i18n from "../../i18n";

export default function CashbackStillPendingScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View
      style={[
        styles.container,
        theme === "Dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[
          styles.header,
          theme === "Dark" && { backgroundColor: "#1E1E1E" },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            theme === "Dark" && { color: "#FFD700" },
          ]}
        >
          {i18n.t("cashback_pending.title")}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[
            styles.mainTitle,
            theme === "Dark" && { color: "#FFD700" },
          ]}
        >
          {i18n.t("cashback_pending.pending_order")}
        </Text>

        <Text
          style={[
            styles.paragraph,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("cashback_pending.processing_time")}
        </Text>

        <Text
          style={[
            styles.subTitle,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("cashback_pending.check_if_expired")}
        </Text>

        <Text
          style={[
            styles.listItem,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("cashback_pending.check_terms_conditions")}
        </Text>

        <Text
          style={[
            styles.listItem,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("cashback_pending.check_cashback_rules")}
        </Text>

        <TouchableOpacity
          style={[
            styles.supportButton,
            theme === "Dark" && { backgroundColor: "#333" },
          ]}
          onPress={() => navigation.navigate("contact")}
        >
          <Text
            style={[
              styles.supportButtonText,
              theme === "Dark" && { color: "#FFD700" },
            ]}
          >
            {i18n.t("cashback_pending.contact_support")}
          </Text>
        </TouchableOpacity>

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
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  scrollContent: {
    padding: 20,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
    lineHeight: 22,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#444",
    marginTop: 15,
  },
  listItem: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  supportButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 25,
    alignItems: "center",
    elevation: 4,
  },
  supportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});