import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import i18n from "../../i18n";

export default function TermsOfUseScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.title")}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.user_rights_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("terms_of_use.user_rights")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.cashback_usage_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("terms_of_use.cashback_usage")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.limitations_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("terms_of_use.limitations")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.liability_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("terms_of_use.liability")}
        </Text>

        <Text style={[styles.sectionTitle, theme === "Dark" && { color: "#FFD700" }]}>
          {i18n.t("terms_of_use.modifications_title")}
        </Text>
        <Text style={[styles.paragraph, theme === "Dark" && styles.darkParagraph]}>
          {i18n.t("terms_of_use.modifications")}
        </Text>

        <Text style={[styles.footer, theme === "Dark" && styles.darkFooter]}>
          {i18n.t("terms_of_use.agreement")}
        </Text>
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