import React, { useEffect, useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { ThemeContext } from "../app/context/ThemeContext";
import { LanguageContext } from "../app/context/LanguageContext";
import i18n from "../i18n";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function TwoFAModal({ visible, email, onSuccess }) {
  const { theme } = useContext(ThemeContext);
  const { language } = useContext(LanguageContext);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(120);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [trusted, setTrusted] = useState(false);

  const lang = i18n.locale;
  
  useEffect(() => {
    if (!visible) return;
    handleResend();
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev === 1) clearInterval(countdown);
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, [visible]);

  const handleSubmit = async () => {
    if (!code || code.length < 4 || !token) return;
    setSubmitting(true);
    try {
      const res = await fetch("https://promodash.vercel.app/api/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", email, code, token, lang }),
      });

      const data = await res.json();
      if (res.ok) {
        if (trusted) {
          await AsyncStorage.setItem("trustedDevice", "true");
        }
        onSuccess();
      } else {
        setError(data?.error || i18n.t("2fa.code_expired"));
      }
    } catch {
      setError("Network error.");
    }
    setSubmitting(false);
  };


  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch("https://promodash.vercel.app/api/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", email, lang }),
      });

      const data = await response.json();
      if (response.ok && data.token) {
        setToken(data.token);
        setError("");
        setTimer(120);
      } else {
        setError(i18n.t("2fa.code_expired"));
      }
    } catch {
      setError("Network error.");
    }
    setResending(false);
  };


  if (!visible) return null;

  return (
    <View style={[styles.overlay, { backgroundColor: theme === "Dark" ? "#000a" : "#fff9" }]}>
      <View style={[styles.modal, { backgroundColor: theme === "Dark" ? "#1E1E1E" : "#fff" }]}>
        <Text style={[styles.title, { color: theme === "Dark" ? "#FFD700" : "#000" }]}>
          {i18n.t("2fa.enter_code")}
        </Text>

        <TextInput
          style={[styles.input, { color: theme === "Dark" ? "#fff" : "#000" }]}
          keyboardType="number-pad"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          placeholder="123456"
          placeholderTextColor="#999"
        />

        <TouchableOpacity onPress={handleSubmit} disabled={submitting} style={styles.button}>
          <Text style={styles.buttonText}>{submitting ? "..." : "OK"}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResend} disabled={resending || timer > 0}>
          <Text style={{ color: theme === "Dark" ? "#FFD700" : "#2575fc", marginTop: 12 }}>
            {timer > 0
              ? `${i18n.t("2fa.resend")} (${timer}s)`
              : i18n.t("2fa.resend")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setTrusted(!trusted)} style={styles.trustRow}>
          <Text style={{ color: theme === "Dark" ? "#fff" : "#333", fontSize: 14 }}>
            {trusted ? "✓" : "◻"} {i18n.t("2fa.trusted_device")}
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={{ color: "red", fontSize: 14, marginTop: 10 }}>{error}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 9999,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "85%",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    fontSize: 20,
    borderBottomWidth: 1,
    borderColor: "#999",
    width: "80%",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2575fc",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  trustRow: {
    marginTop: 16,
  },
});
