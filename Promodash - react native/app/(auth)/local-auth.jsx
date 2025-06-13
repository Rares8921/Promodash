import { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  BackHandler
} from "react-native";
import { useRouter } from "expo-router";
import { UserContext } from "../context/UserContext";
import { ThemeContext } from "../context/ThemeContext";
import i18n from "../../i18n";

export default function LocalAuthScreen() {
  const [pin, setPin] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useContext(UserContext);
  const { theme } = useContext(ThemeContext);

    useEffect(() => {
        const backAction = () => {
            return true; // blockez go back
        };

        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);

        return () => backHandler.remove();
    }, []);

  const handlePress = (digit) => {
    if (pin.length < 6) {
      setPin(pin + digit);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleVerify = async () => {
    if (pin.length !== 6) return;

    setLoading(true);
    try {
      const userPin = user?.pin?.toString();
      if (pin === userPin) {
        router.replace("/(tabs)");
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin("");

        if (newAttempts >= 3) {
          Alert.alert(
            i18n.t("extra_authentication.too_many_attempts"),
            i18n.t("extra_authentication.too_many_attempts_message"),
            [{ text: "OK", onPress: () => BackHandler.exitApp() }]
          );
        } else {
          Alert.alert("Eroare", i18n.t("extra_authentication.wrong_password"));
        }
      }
    } catch (err) {
      Alert.alert("Eroare", "Ceva nu a mers.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, theme === "Dark" && { backgroundColor: "#121212" }]}>
      <Text style={[styles.title, theme === "Dark" && { color: "#FFD700" }]}>
        {i18n.t("extra_authentication.password_option")}
      </Text>

      <View style={styles.pinDots}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              pin.length > index && (theme === "Dark" ? styles.filledDotDark : styles.filledDotLight)
            ]}
          />
        ))}
      </View>

      <View style={styles.keypad}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map((key, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.key}
            onPress={() => {
              if (key === "←") handleDelete();
              else if (key !== "") handlePress(key);
            }}
            disabled={loading}
          >
            <Text style={styles.keyText}>{key}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[styles.verifyButton, pin.length === 6 ? {} : { opacity: 0.5 }]}
        onPress={handleVerify}
        disabled={loading || pin.length !== 6}
      >
        <Text style={styles.verifyButtonText}>
          {i18n.t("extra_authentication.continue")}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 30,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9FAFC"
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 30,
    textAlign: "center",
    color: "#2575fc"
  },
  pinDots: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
    marginBottom: 30
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "transparent"
  },
  filledDotLight: {
    backgroundColor: "#2575fc"
  },
  filledDotDark: {
    backgroundColor: "#FFD700"
  },
  keypad: {
    width: "80%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 30
  },
  key: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eee",
    marginBottom: 15
  },
  keyText: {
    fontSize: 26,
    fontWeight: "500"
  },
  verifyButton: {
    backgroundColor: "#2575fc",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 10
  },
  verifyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold"
  }
});
