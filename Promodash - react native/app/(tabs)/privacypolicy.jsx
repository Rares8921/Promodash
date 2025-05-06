import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import i18n from "../../i18n";

export default function PrivacyPolicyScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {/* 🔹 Header */}
      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.title")}
        </Text>
      </View>

      {/* 🔹 Conținutul paginii */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.introduction_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.introduction")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.data_collection_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.data_collection")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.data_usage_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.data_usage")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.data_sharing_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.data_sharing")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.your_rights_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.your_rights")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.security_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.security")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("privacy_policy.changes_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("privacy_policy.changes")}
        </Text>

        <Text style={[styles.footer, theme === "Dark" && styles.darkFooter]}>
          {i18n.t("privacy_policy.contact")}
        </Text>
      </ScrollView>
    </View>
  );
}

/* ✅ Styles */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFC" },
  darkContainer: { backgroundColor: "#121212" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
  },
  darkHeader: { backgroundColor: "#1E1E1E" },
  backButton: { padding: 5 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#fff", textAlign: "center", flex: 1 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 30 },

  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333", marginTop: 20 },
  paragraph: { fontSize: 16, color: "#444", marginBottom: 10, lineHeight: 22 },
  darkParagraph: { color: "#BBB" },

  footer: { fontSize: 14, color: "#777", textAlign: "center", marginTop: 20 },
  darkFooter: { color: "#BBB" },
});