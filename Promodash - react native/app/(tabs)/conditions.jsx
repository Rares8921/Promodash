import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext"; 
import i18n from "../../i18n";

export default function WithdrawalConditionsScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext); 

  return (
    <SafeAreaView
      style={[
        styles.container,
        theme === "Dark" && { backgroundColor: "#121212" },
      ]}
    >
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[
          styles.header,
          theme === "Dark" && { backgroundColor: "#1E1E1E", borderColor: "#333" },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons
            name="arrow-back"
            size={26}
            color={theme === "Dark" ? "#fff" : "#000"} 
          />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            theme === "Dark" && { color: "#FFD700" }, 
          ]}
        >
          {i18n.t("conditions.title")}
        </Text>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text
          style={[
            styles.conditionText,
            theme === "Dark" && { color: "#ddd" }, 
          ]}
        >
          {i18n.t("conditions.condition_1")}
        </Text>
        <Text
          style={[
            styles.conditionText,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("conditions.condition_2")}
        </Text>
        <Text
          style={[
            styles.conditionText,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("conditions.condition_3")}
        </Text>
        <Text
          style={[
            styles.conditionText,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("conditions.condition_4")}
        </Text>
        <Text
          style={[
            styles.conditionText,
            theme === "Dark" && { color: "#ddd" },
          ]}
        >
          {i18n.t("conditions.condition_5")}
        </Text>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: "#ddd", 
    backgroundColor: "#fff", 
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#000", 
  },

  scrollContent: {
    padding: 25,
    paddingBottom: 40,
  },
  conditionText: {
    fontSize: 16,
    color: "#333", 
    lineHeight: 24,
    marginBottom: 15,
  },
});