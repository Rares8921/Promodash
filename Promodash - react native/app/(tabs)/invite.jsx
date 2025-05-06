import React, { useContext, useState, useEffect, memo } from "react";
import { 
  View, Text, TouchableOpacity, StyleSheet, ScrollView, 
  TextInput, SafeAreaView, Alert, Share, Clipboard
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import { getUserData } from "../../lib/appwrite";
import i18n from "../../i18n";

const InviteScreen = memo(function InviteScreen() {
  const { theme } = useContext(ThemeContext);
  const { key } = useContext(LanguageContext);
  const [user, setUser] = useState(null);
  const [inviteLink, setInviteLink] = useState("...");
  const [inviteCount, setInviteCount] = useState("...");
  const [earnedBonus, setEarnedBonus] = useState("...");
  const [pendingBonus, setPendingBonus] = useState("...");

  useEffect(() => {
    async function fetchUser() {
      const userDoc = await getUserData();
      if (!userDoc) {
        Alert.alert(i18n.t("invite.error_title"), i18n.t("invite.error_loading_user"));
        return;
      }

      setUser(userDoc);
      setInviteCount(userDoc.inviteCount || 0);
      setEarnedBonus(userDoc.earnedBonus || "0.00");
      setPendingBonus(userDoc.pendingInviteBonus || "0.00");

      const code = userDoc.Invite_Code; 
      const inviteUrl = `https://promodash.vercel.app/api/invite_redirect?inviteCode=${code}`;
      setInviteLink(inviteUrl);
    }

    async function checkAuth() {
        const user = await getUserData();
        if (!user) {
            router.replace("/signup"); 
        }
        fetchUser();
    }
    checkAuth();
  }, []);

  const handleCopyLink = () => {
    Clipboard.setString(inviteLink);
    Alert.alert(i18n.t("invite.copied_title"), i18n.t("invite.copied_message"));
  };
  
  const handleInviteFriends = async () => {
    try {
      await Share.share({
        message: `${i18n.t("invite.invite_message")} ${inviteLink}`,
      });
    } catch (error) {
      Alert.alert(i18n.t("signup.error_title"), i18n.t("invite.invite_share_error"));
    }
  };

  return (
    <SafeAreaView
      style={[
        styles.safeContainer,
        { backgroundColor: theme === "Light" ? "#fff" : "#121212" }
      ]}
    >
      <LinearGradient
        colors={theme === "Light" ? ["#2575fc", "#0052d4"] : ["#333333", "#1F1F1F"]}
        style={styles.header}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 22,
            fontWeight: "bold",
            textDecorationLine: "underline"
          }}
        >
          {i18n.t("invite.title")}
        </Text>
      </LinearGradient>


      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={{
            flexDirection: "row",
            backgroundColor: theme === "Light" ? "#2575fc" : "#FFD700",
            paddingVertical: 10,
            paddingHorizontal: 18,
            borderRadius: 10,
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            elevation: 3,
          }}
          onPress={handleInviteFriends}
        >
          <Ionicons
            name="person-add-outline"
            size={22}
            color={theme === "Light" ? "#fff" : "#000"}
          />
          <Text
            style={{
              fontWeight: "bold",
              fontSize: 16,
              color: theme === "Light" ? "#fff" : "#000",
              marginLeft: 8,
            }}
          >
            {i18n.t("invite.invite_friends")}
          </Text>
        </TouchableOpacity>


        <Text style={[
          styles.subText,
          { color: theme === "Light" ? "#666" : "#bbb" }
        ]}>
          {i18n.t("invite.copy_share")}
        </Text>

        <View style={[
          styles.linkBox,
          {
            backgroundColor: theme === "Light" ? "#f9f9f9" : "#1E1E1E", 
            borderColor: theme === "Light" ? "#ddd" : "#333"
          }
        ]}>
          <TextInput
            style={[
              styles.linkText,
              { color: theme === "Light" ? "#333" : "#ddd" }
            ]}
            value={inviteLink}
            editable={false}
          />
          <TouchableOpacity style={styles.copyButton} onPress={handleCopyLink}>
            <Ionicons
              name="copy-outline"
              size={20}
              color={theme === "Light" ? "#2575fc" : "#FFD700"}
            />
          </TouchableOpacity>
        </View>

        <Text style={[
          styles.sectionTitle,
          { color: theme === "Light" ? "#333" : "#FFD700" }
        ]}>
          {i18n.t("invite.how_it_works")}
        </Text>

        <View style={styles.stepsContainer}>
          <StepItem text={i18n.t("invite.step_1")} theme={theme} />
          <StepItem text={i18n.t("invite.step_2")} theme={theme} />
          <StepItem text={i18n.t("invite.step_3")} theme={theme} />
        </View>

        {/* Stats and Bonus Section */}
        <View style={[
          styles.statsContainer,
          { backgroundColor: theme === "Light" ? "#f1f1f1" : "#1E1E1E" }
        ]}>
          <View style={styles.statsItem}>
            <Text style={[
              styles.statsTitle,
              { color: theme === "Light" ? "#666" : "#bbb" }
            ]}>
              {i18n.t("invite.total_invites")}
            </Text>
            <Text style={[
              styles.statsValue,
              { color: theme === "Light" ? "#2575fc" : "#FFD700" }
            ]}>
              {inviteCount}
            </Text>
          </View>
        </View>

        <View style={styles.bonusContainer}>
          <View style={[
            styles.bonusItem,
            { backgroundColor: theme === "Light" ? "#f1f1f1" : "#1E1E1E" }
          ]}>
            <Text style={[
              styles.bonusTitle,
              { color: theme === "Light" ? "#666" : "#bbb" }
            ]}>
              {i18n.t("invite.earned_bonus")}
            </Text>
            <Text style={[
              styles.bonusValue,
              { color: theme === "Light" ? "#2575fc" : "#FFD700" }
            ]}>
              {earnedBonus} RON
            </Text>
          </View>
          <View style={[
            styles.bonusItem,
            { backgroundColor: theme === "Light" ? "#f1f1f1" : "#1E1E1E" }
          ]}>
            <Text style={[
              styles.bonusTitle,
              { color: theme === "Light" ? "#666" : "#bbb" }
            ]}>
              {i18n.t("invite.pending_bonus")}
            </Text>
            <Text style={[
              styles.bonusValue,
              { color: theme === "Light" ? "#2575fc" : "#FFD700" }
            ]}>
              {pendingBonus} RON
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default memo(InviteScreen);

// componenta auxiliara
function StepItem({ text, theme }) {
  return (
    <View style={styles.stepItem}>
      <Ionicons
        name="checkmark-circle"
        size={18}
        color={theme === "Light" ? "#2575fc" : "#FFD700"}
        style={styles.bullet}
      />
      <Text style={[
        styles.stepText,
        { color: theme === "Light" ? "#333" : "#ddd" }
      ]}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1 },
  header: {
    paddingTop: 40,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "flex-end",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },

  scrollContent: {
    padding: 15,
    alignItems: "center",
    minHeight: "100%",
    paddingBottom: 40,
  },

  subText: { marginVertical: 8, fontSize: 13 },

  linkBox: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    width: "100%",
    borderWidth: 1,
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: "500" },
  copyButton: { padding: 5 },

  sectionTitle: { fontSize: 16, fontWeight: "bold", marginTop: 15, marginBottom: 5, alignSelf: "flex-start" },
  stepsContainer: { width: "100%", alignItems: "flex-start" },
  stepItem: { flexDirection: "row", alignItems: "center", marginBottom: 6, paddingVertical: 6 },
  bullet: { marginRight: 6 },
  stepText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    flexWrap: "wrap",
    textAlign: "left",
    lineHeight: 20,
  },

  statsContainer: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    width: "100%",
    alignItems: "center",
  },
  statsItem: { alignItems: "center" },
  statsTitle: { fontSize: 13, fontWeight: "500" },
  statsValue: { fontSize: 22, fontWeight: "bold" },

  bonusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    width: "100%",
  },
  bonusItem: {
    padding: 12,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  bonusTitle: { fontSize: 13, fontWeight: "500" },
  bonusValue: { fontSize: 20, fontWeight: "bold" },
});
