import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import i18n from "../../i18n";

export default function HelpScreen() {
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
          {i18n.t("help.title")}
        </Text>
        <Ionicons name="notifications-outline" size={26} color="#fff" style={styles.notificationIcon} />
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SectionTitle title={i18n.t("help.faq")} icon="help-circle-outline" theme={theme} />
        <OptionItem title={i18n.t("help.cashback_pending")} route="/cashbackpending" theme={theme} />
        <OptionItem title={i18n.t("help.withdraw_cashback")} route="/withdrawcollected" theme={theme} />
        <OptionItem title={i18n.t("help.cashback_not_appeared")} route="/cashbacknot" theme={theme} />
        <OptionItem title={i18n.t("help.request_cannot_be_created")} route="/requestnot" theme={theme} />

        <SectionTitle title={i18n.t("help.customer_support")} icon="create-outline" bold theme={theme} />
        <OptionItem title={i18n.t("help.my_requests")} route="/myrequests" theme={theme} />
        <OptionItem title={i18n.t("help.create_request")} route="/createrequest" theme={theme} />

        <SectionTitle title={i18n.t("help.legal_information")} icon="document-text-outline" bold theme={theme} />
        <OptionItem title={i18n.t("help.terms_of_use")} route="/termsofuse" theme={theme} />
        <OptionItem title={i18n.t("help.privacy_policy")} route="/privacypolicy" theme={theme} />
        <OptionItem title={i18n.t("help.contact_information")} route="/contact" theme={theme} />
      </ScrollView>
    </View>
  );
}

const SectionTitle = ({ title, icon, bold, theme }) => (
  <View
    style={[
      styles.sectionContainer,
      bold && styles.sectionBold,
      theme === "Dark" && { backgroundColor: "#1E1E1E" },
    ]}
  >
    <Ionicons name={icon} size={18} color={bold ? (theme === "Dark" ? "#FFD700" : "#000") : "#666"} />
    <Text
      style={[
        styles.sectionTitle,
        bold && styles.sectionTitleBold,
        theme === "Dark" && { color: "#FFD700" },
      ]}
    >
      {title}
    </Text>
  </View>
);

const OptionItem = ({ title, route, theme }) => {
  const router = useRouter();
  return (
    <TouchableOpacity
      style={[
        styles.optionItem,
        theme === "Dark" && { backgroundColor: "#1E1E1E" },
      ]}
      onPress={() => route && router.push(route)}
    >
      <Text
        style={[
          styles.optionText,
          theme === "Dark" && { color: "#ddd" },
        ]}
      >
        {title}
      </Text>
      <Ionicons name="chevron-forward-outline" size={20} color={theme === "Dark" ? "#FFD700" : "#999"} />
    </TouchableOpacity>
  );
};

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
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    left: -15,
  },
  notificationIcon: {
    position: "absolute",
    right: 20,
    top:56
  },

  scrollContent: {
    paddingBottom: 30,
  },

  sectionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#F2F2F2",
  },
  sectionBold: {
    backgroundColor: "#EAEAEA",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#666",
    marginLeft: 8,
  },
  sectionTitleBold: {
    fontWeight: "bold",
    color: "#000",
  },

  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  optionText: {
    fontSize: 16,
    color: "#333",
  },
});