import { useState, useContext, useCallback, memo  } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../context/ThemeContext";
import { UserContext } from "../context/UserContext";
import { getUserRequests } from "../../lib/appwrite";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../i18n";

const MyRequestsScreen = memo(() => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [requests, setRequests] = useState([]);

  const { user, loading } = useContext(UserContext);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!user?.email) return;
  
      async function loadRequests() {
        try {
          const cachedData = await AsyncStorage.getItem(`cachedRequests_${user.email}`);
          if (cachedData) {
            const parsed = JSON.parse(cachedData);
            const isValid = Date.now() - parsed.timestamp < 10 * 60 * 1000; // 10 min TTL
            if (isValid && Array.isArray(parsed.data)) {
              setRequests(parsed.data);
              return;
            }
          }
  
          const fetchedRequests = await getUserRequests(user.email);
          const list = Array.isArray(fetchedRequests.documents) ? fetchedRequests.documents : fetchedRequests || [];
          setRequests(list);

          setRequests(fetchedRequests || []);
          await AsyncStorage.setItem(
            `cachedRequests_${user.email}`,
            JSON.stringify({ data: fetchedRequests, timestamp: Date.now() })
          );
        } catch (error) {
          console.error("Error loading requests:", error);
        }
      }
  
      loadRequests();
    }, [user])
  );  

  // if (loading) {
  //   return (
  //     <SafeAreaView style={[styles.container, theme === "Dark" && styles.darkContainer]}>
  //       <Text style={[styles.loadingText, theme === "Dark" && styles.darkText]}>
  //         {i18n.t("general.loading")}
  //       </Text>
  //     </SafeAreaView>
  //   );
  // }
  
  const refreshRequests = async () => {
    try {
      setRefreshing(true);
      const fetchedRequests = await getUserRequests(user.email);
      setRequests(fetchedRequests || []);
      await AsyncStorage.setItem(
        `cachedRequests_${user.email}`,
        JSON.stringify({ data: fetchedRequests, timestamp: Date.now() })
      );
    } catch (error) {
      console.error("Error refreshing requests:", error);
    } finally {
      setRefreshing(false);
    }
  };  

  return (
    <View style={[styles.container, theme === "Dark" && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, theme === "Dark" && styles.darkHeader]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle]}>
          {i18n.t("my_requests.title")}
        </Text>

        <TouchableOpacity onPress={() => {}} style={styles.rightIcon}>
          <Ionicons name="information-circle-outline" size={24} color="#fff" />
      </TouchableOpacity>
      </View>

      {/* Display Requests */}
      <FlatList
        data={requests}
        keyExtractor={(item, index) => (item?.id ? item.id.toString() : index.toString())}
        renderItem={({ item }) => <RequestItem request={item} navigation={navigation} />}
        ListEmptyComponent={() => (
          <Text style={[styles.noRequestsText, theme === "Dark" && styles.darkText]}>
            {i18n.t("my_requests.no_requests")}
          </Text>
        )}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={refreshRequests}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
        removeClippedSubviews
        getItemLayout={(data, index) => ({
          length: 90,
          offset: 90 * index,
          index,
        })}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
});

const RequestItem = memo(({ request, navigation }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.requestItem, theme === "Dark" && styles.darkRequestItem]}
      onPress={() => navigation.navigate("requestdetails", { request })}
    >
      <Text style={[styles.requestTitle, theme === "Dark" && styles.darkText]}>{request.subject}</Text>
      <Text style={[styles.requestDescription, theme === "Dark" && styles.darkText]}>
        {request.description.length > 80 ? `${request.description.substring(0, 80)}...` : request.description}
      </Text>
      <Text style={[styles.requestDate, theme === "Dark" && styles.darkDate]}>
        {new Date(request.dateCreated).toLocaleDateString("ro-RO")}
      </Text>
      {request.image && (
        <Image source={{ uri: request.image, cache: 'force-cache' }} style={styles.requestImage} />
      )}
    </TouchableOpacity>
  );
});

export default MyRequestsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFC",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: "#2575fc",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  darkHeader: {
    backgroundColor: "#1E1E1E",
  },
  backButton: {
    position: "absolute",
    left: 15,
    top: 50,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },

  scrollContent: {
    padding: 20,
  },

  requestItem: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderLeftWidth: 4,
    borderColor: "#2575fc",
  },
  darkRequestItem: {
    backgroundColor: "#1E1E1E",
    borderColor: "#FFD700",
  },

  requestTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  darkText: {
    color: "#FFD700",
  },

  requestDescription: {
    fontSize: 14,
    color: "#666",
    marginVertical: 5,
  },

  requestDate: {
    fontSize: 12,
    color: "#888",
  },
  darkDate: {
    color: "#ccc",
  },

  noRequestsText: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 20,
    color: "#777",
  },

  rightIcon: {
    position: "absolute",
    right: 15,
    top: 50,
  }
});