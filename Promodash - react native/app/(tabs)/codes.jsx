import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, StatusBar } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext"; 
import i18n from "../../i18n";

export default function CodesScreen() {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext); 
  const isDarkMode = theme === "Dark";

  return (
    <View
      style={[
        styles.container,
        isDarkMode && { backgroundColor: "#121212" },
      ]}
    >
      <StatusBar
        backgroundColor={isDarkMode ? "#1E1E1E" : "#2575fc"} 
        barStyle={isDarkMode ? "light-content" : "dark-content"}
      />

      <View
        style={[
          styles.headerWrapper,
          isDarkMode && { backgroundColor: "#1E1E1E" },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={26} color="#fff" />
          </TouchableOpacity>
          <Text
            style={[
              styles.headerTitle,
              isDarkMode && { color: "#fff" }, 
            ]}
          >
            {i18n.t("codes.title")}
          </Text>
          <Ionicons name="qr-code-outline" size={26} color={isDarkMode ? "#fff" : "#fff"} style={styles.helpIcon} />
        </Animated.View>
      </View>

      <View style={styles.content}>
        <Text
          style={[
            styles.descriptionText,
            isDarkMode && { color: "#bbb" },
          ]}
        >
          {i18n.t("codes.description")}
        </Text>

        <View
          style={[
            styles.inputContainer,
            isDarkMode && { borderColor: "#444" },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              isDarkMode && { backgroundColor: "#1E1E1E", color: "#fff" },
            ]}
            placeholder={i18n.t("codes.enter_code")}
            placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
          />
          <TouchableOpacity
            style={[
              styles.applyButton,
              isDarkMode && { backgroundColor: "#333" },
            ]}
          >
            <Text
              style={[
                styles.applyButtonText,
                isDarkMode && { color: "#FFD700" }, 
              ]}
            >
              {i18n.t("codes.apply")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.codesSection}>
          <Text
            style={[
              styles.activeTitle,
              isDarkMode && { color: "#ddd" },
            ]}
          >
            {i18n.t("codes.active_codes")} (0)
          </Text>
          <View
            style={[
              styles.divider,
              isDarkMode && { backgroundColor: "#333" },
            ]}
          />
          <View style={styles.emptyState}>
            <Ionicons
              name="pricetag-outline"
              size={50}
              color={isDarkMode ? "#777" : "#bbb"}
              style={styles.emptyIcon}
            />
            <Text
              style={[
                styles.emptyText,
                isDarkMode && { color: "#bbb" },
              ]}
            >
              {i18n.t("codes.no_active_codes")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },

  headerWrapper: {
    backgroundColor: "#2575fc",
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 20 : 50,
    paddingBottom: 25,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
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
    left: -10,
  },
  helpIcon: {
    position: "absolute",
    right: 20,
  },

  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 15,
  },

  inputContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  applyButton: {
    backgroundColor: "#ffcc00",
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },

  codesSection: {
    marginTop: 25,
  },
  activeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  divider: {
    height: 2,
    backgroundColor: "#000",
    marginVertical: 5,
    width: "25%",
    alignSelf: "center",
  },

  emptyState: {
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 30,
  },
  emptyIcon: {
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    lineHeight: 20,
  },
});
