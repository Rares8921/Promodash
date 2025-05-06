import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import i18n from "../../i18n";

export default function CashbackNotAppearedScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" },]}>
      <Animated.View entering={FadeInDown.duration(400)} style={[styles.header, theme === "Dark" && { backgroundColor: "#1E1E1E" },]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === "Dark" && { color: "#FFD700" },]}>
          {i18n.t("cashback_issue.title")}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.title, theme === "Dark" && { color: "#FFD700" }, ]}>
          {i18n.t("cashback_issue.not_appeared")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#ddd" },]}>
          {i18n.t("cashback_issue.check_if")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#bbb" },]}>
          {i18n.t("cashback_issue.check_waiting_period")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#ddd" },]}>
          {i18n.t("cashback_issue.check_if_expired")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#bbb" },]}>
          {i18n.t("cashback_issue.check_terms_conditions")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#ddd" },]}>
          {i18n.t("cashback_issue.check_cashback_rules")}
        </Text>

        <Text style={[styles.paragraph, theme === "Dark" && { color: "#bbb" },]}>
          {i18n.t("cashback_issue.submit_request_info")}
        </Text>

        <TouchableOpacity style={[styles.submitRequestButton, theme === "Dark" && { backgroundColor: "#333" },]}
          onPress={() => navigation.navigate("createrequest")}
        >
          <Text style={[styles.submitRequestText, theme === "Dark" && { color: "#FFD700" },]}>
            {i18n.t("cashback_issue.submit_request")}
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
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginLeft: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  submitRequestButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 20,
  },
  submitRequestText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});