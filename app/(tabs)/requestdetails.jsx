import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from "react-native";
import { useRoute } from "@react-navigation/native";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function RequestDetailsScreen() {
  const route = useRoute();
  const { theme } = useContext(ThemeContext);
  const { request } = route.params;
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.safeContainer, { backgroundColor: theme === "Light" ? "#F9FAFC" : "#121212" }]}>
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: theme === "Light" ? "#2575fc" : "#1E1E1E" }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{request.subject}</Text>

        <TouchableOpacity onPress={() => {}} style={styles.rightIcon}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>


      {/* SCROLLVIEW care ocupa tot ecranul */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* DATA MESAJULUI */}
        <Text style={[styles.date, { color: theme === "Light" ? "#666" : "#bbb" }]}>
          {new Date(request.dateCreated).toLocaleDateString("ro-RO")}
        </Text>

        {/* BOX MESAJ */}
        <View style={[styles.messageBox, { backgroundColor: theme === "Light" ? "#fff" : "#1E1E1E" }]}>
          <ScrollView style={styles.textScroll} nestedScrollEnabled={true}>
            <Text style={[styles.description, { color: theme === "Light" ? "#333" : "#ddd" }]}>
              {request.description}
            </Text>
          </ScrollView>
        </View>

        {/* IMAGINEA */}
        {request.image && (
          <Image source={{ uri: request.image, cache: 'force-cache' }} style={styles.image} />
        )}
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
  },

  /* HEADER */
  header: {
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },

  /* TITLU */
  title: { 
    fontSize: 22, 
    fontWeight: "bold",
    textAlign: "center",
  },

  /* DATA MESAJULUI */
  date: { 
    fontSize: 14, 
    textAlign: "center",
    marginBottom: 15,
  },

  /* BOX MESAJ - Ocupă toată suprafața disponibilă */
  messageBox: {
    flex: 1,
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },

  /* SCROLLVIEW IN INTERIORUL BOX-ULUI */
  textScroll: {
    flex: 1,
  },

  description: { 
    fontSize: 16, 
    lineHeight: 22,
    textAlign: "left",
  },

  image: { 
    width: "100%", 
    height: 220, 
    borderRadius: 12,
    marginTop: 15,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 50,
  },
  rightIcon: {
    position: "absolute",
    right: 15,
    top: 50,
  },
  title: { 
    fontSize: 22, 
    fontWeight: "bold",
    textAlign: "center",
    color: "#fff", // mereu alb pe ambele teme
  },
  
});