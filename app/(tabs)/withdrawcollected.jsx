import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import Animated, { FadeInDown } from "react-native-reanimated";
import i18n from "../../i18n";

export default function WithdrawCashbackScreen() {
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
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Home");
            }
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text
          style={[
            styles.headerTitle,
            theme === "Dark" && { color: "#FFD700" },
          ]}
        >
          {i18n.t("withdraw_collected.title")}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[
            styles.sectionText,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("withdraw_collected.instructions")}
        </Text>

        <Step number="1" text={i18n.t("withdraw_collected.step_1")} theme={theme} />

        <Step number="2" text={i18n.t("withdraw_collected.step_2")} theme={theme} />

        <Step number="3" text={i18n.t("withdraw_collected.step_3")} theme={theme} />

        <Text
          style={[
            styles.noteText,
            theme === "Dark" && { color: "#bbb" },
          ]}
        >
          {i18n.t("withdraw_collected.processing_time")}
        </Text>

        <View style={styles.feedbackContainer}>
          <Text
            style={[
              styles.feedbackText,
              theme === "Dark" && { color: "#ddd" },
            ]}
          >
            {i18n.t("withdraw_collected.helpful")}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                theme === "Dark" && { backgroundColor: "#333" },
              ]}
            >
              <Text
                style={[
                  styles.feedbackButtonText,
                  theme === "Dark" && { color: "#FFD700" },
                ]}
              >
                ✓ {i18n.t("withdraw_collected.yes")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.feedbackButton,
                theme === "Dark" && { backgroundColor: "#333" },
              ]}
            >
              <Text
                style={[
                  styles.feedbackButtonText,
                  theme === "Dark" && { color: "#FFD700" },
                ]}
              >
                ✗ {i18n.t("withdraw_collected.no")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const Step = ({ number, text, theme }) => (
  <View style={styles.stepContainer}>
    <Text
      style={[
        styles.stepNumber,
        theme === "Dark" && { color: "#FFD700" },
      ]}
    >
      {number}.
    </Text>
    <Text
      style={[
        styles.stepText,
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
    marginLeft: -25,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionText: {
    fontSize: 16,
    color: "#444",
    marginVertical: 10,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 8,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2575fc",
    marginRight: 8,
  },
  stepText: {
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  noteText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginVertical: 15,
  },
  feedbackContainer: {
    alignItems: "center",
    marginTop: 20,
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: "row",
  },
  feedbackButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginHorizontal: 10,
  },
  feedbackButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});