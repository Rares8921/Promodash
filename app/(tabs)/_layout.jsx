import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { LanguageContext } from "../context/LanguageContext";
import i18n from "../../i18n";

import IndexScreen from "./index";
import InviteScreen from "./invite";
import AccountScreen from "./account";

const Stack = createNativeStackNavigator ();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const { theme } = useContext(ThemeContext);
  const { key } = useContext(LanguageContext);

  return (
    <Tab.Navigator
      screenOptions={{
        lazy: false,
        animationEnabled: false,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === "Dark" ? "#1E1E1E" : "#fff",
          borderTopColor: theme === "Dark" ? "#444" : "#ddd",
        },
        tabBarActiveTintColor: theme === "Dark" ? "#FFD700" : "#2575fc",
        tabBarInactiveTintColor: theme === "Dark" ? "#888" : "#aaa",
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "bold",
        },
      }}
    >
      <Tab.Screen
        name="index"
        component={IndexScreen}
        options={{
          tabBarLabel: i18n.t("tabs.stores"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "cart" : "cart-outline"} size={size} color={color} />
          ),
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen
        name="invite"
        component={InviteScreen}
        options={{
          tabBarLabel: i18n.t("tabs.invite"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
          unmountOnBlur: false,
        }}
      />
      <Tab.Screen
        name="account"
        component={AccountScreen}
        options={{
          tabBarLabel: i18n.t("tabs.account"),
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
          ),
          unmountOnBlur: false,
        }}
      />
    </Tab.Navigator>
  );
};

const screens = {
  campaigns: require("./campaigns").default,
  cashback: require("./cashback").default,
  cashbacknot: require("./cashbacknot").default,
  cashbackpending: require("./cashbackpending").default,
  codes: require("./codes").default,
  conditions: require("./conditions").default,
  contact: require("./contact").default,
  createrequest: require("./createrequest").default,
  help: require("./help").default,
  myrequests: require("./myrequests").default,
  privacypolicy: require("./privacypolicy").default,
  requestdetails: require("./requestdetails").default,
  requestnot: require("./requestnot").default,
  settings: require("./settings").default,
  storedetails: require("./storedetails").default,
  products: require("./products").default,
  termsofuse: require("./termsofuse").default,
  withdrawal: require("./withdrawal").default,
  withdrawcollected: require("./withdrawcollected").default,
};

export default function TabsLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      {Object.entries(screens).map(([name, component]) => (
        <Stack.Screen key={name} name={name} component={component} />
      ))}
    </Stack.Navigator>
  );
}