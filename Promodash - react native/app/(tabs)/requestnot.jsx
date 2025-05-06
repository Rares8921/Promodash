import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import i18n from "../../i18n";

export default function RequestIssueScreen() {
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
          {i18n.t("request_issue.title")}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text
          style={[
            styles.title,
            theme === "Dark" && { color: "#FFD700" },
          ]}
        >
          {i18n.t("request_issue.cannot_submit")}
        </Text>
        <Text
          style={[
            styles.paragraph,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("request_issue.check_fields")}
        </Text>
        <Text
          style={[
            styles.paragraph,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("request_issue.mistake_marked")}
        </Text>

        <Text
          style={[
            styles.subtitle,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("request_issue.typical_mistakes")}
        </Text>

        <BulletItem text={i18n.t("request_issue.mistake_order_number")} theme={theme} />
        <BulletItem text={i18n.t("request_issue.mistake_empty_fields")} theme={theme} />
        <BulletItem text={i18n.t("request_issue.mistake_wrong_file_format")} theme={theme} />

        <Text
          style={[
            styles.paragraph,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("request_issue.use_compression_service")}
        </Text>

        <Text
          style={[
            styles.paragraph,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("request_issue.contact_us")}{" "}
          <Text style={[styles.link, theme === "Dark" && { color: "#FFD700" }]}>promodashcs@gmail.com</Text>.
        </Text>

        <View style={styles.feedbackContainer}>
          <Text
            style={[
              styles.feedbackTitle,
              theme === "Dark" && { color: "#ddd" },
            ]}
          >
            {i18n.t("request_issue.article_helpful")}
          </Text>
          <View style={styles.feedbackButtons}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                theme === "Dark" && { backgroundColor: "#333" },
              ]}
            >
              <Ionicons name="checkmark-outline" size={18} color="#FFD700" />
              <Text
                style={[
                  styles.feedbackButtonText,
                  theme === "Dark" && { color: "#FFD700" },
                ]}
              >
                {i18n.t("request_issue.yes")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                styles.noButton,
                theme === "Dark" && { backgroundColor: "#800000" },
              ]}
            >
              <Ionicons name="close-outline" size={18} color="#FFD700" />
              <Text
                style={[
                  styles.feedbackButtonText,
                  theme === "Dark" && { color: "#FFD700" },
                ]}
              >
                {i18n.t("request_issue.no")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.returnToTop}>
          <Ionicons name="chevron-up-outline" size={20} color={theme === "Dark" ? "#FFD700" : "#2575fc"} />
          <Text
            style={[
              styles.returnToTopText,
              theme === "Dark" && { color: "#FFD700" },
            ]}
          >
            {i18n.t("request_issue.return_to_top")}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const BulletItem = ({ text, theme }) => (
  <View style={styles.bulletItem}>
    <Ionicons name="ellipse" size={6} color={theme === "Dark" ? "#FFD700" : "#333"} />
    <Text
      style={[
        styles.bulletText,
        theme === "Dark" && { color: "#bbb" },
      ]}
    >
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    flex: 1,
    left: -10,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 16,
    color: "#444",
    marginBottom: 10,
    lineHeight: 22,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 8,
  },
  bulletItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  bulletText: {
    fontSize: 16,
    color: "#444",
    marginLeft: 6,
  },
  link: {
    color: "#2575fc",
    fontWeight: "bold",
  },
  feedbackContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  feedbackButtons: {
    flexDirection: "row",
  },
  feedbackButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2575fc",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  noButton: {
    backgroundColor: "#ff4d4d",
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 5,
  },
  returnToTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  returnToTopText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2575fc",
    marginLeft: 5,
  },
});