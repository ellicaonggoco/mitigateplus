import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View, ActivityIndicator } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { AuthProvider, useAuth } from "./src/context/AuthContext";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import HomeScreen from "./src/screens/HomeScreen";
import MapScreen from "./src/screens/MapScreen";
import ReportScreen from "./src/screens/ReportScreen";
import AssessmentScreen from "./src/screens/AssessmentScreen";
import GoBagScreen from "./src/screens/GoBagScreen";
import ChatbotScreen from "./src/screens/ChatbotScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// ✅ Bottom Tabs
const MainTabs = () => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: "#1565c0",
      tabBarInactiveTintColor: "#9e9e9e",
      tabBarStyle: {
        backgroundColor: "#ffffff",
        borderTopWidth: 1,
        borderTopColor: "#e0e0e0",
        paddingBottom: 8,
        paddingTop: 6,
        height: 65,
        elevation: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: "600",
        marginTop: 2,
      },
    }}
  >
    <Tab.Screen
      name="Home"
      component={HomeScreen}
      options={{
        tabBarLabel: "Home",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{
        tabBarLabel: "Hazard Map",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="map" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Report"
      component={ReportScreen}
      options={{
        tabBarLabel: "Report",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="alert-circle"
            size={size}
            color={color}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Assessment"
      component={AssessmentScreen}
      options={{
        tabBarLabel: "Assess",
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="clipboard" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="GoBag"
      component={GoBagScreen}
      options={{
        tabBarLabel: "Go Bag",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name="bag-personal"
            size={size}
            color={color}
          />
        ),
      }}
    />
    <Tab.Screen
      name="Chatbot"
      component={ChatbotScreen}
      options={{
        tabBarLabel: "AI Help",
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name="robot" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

// ✅ Root App with single NavigationContainer
const RootApp = () => {
  const { user, loaded } = useAuth();

  if (!loaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f0f4ff",
        }}
      >
        <ActivityIndicator size="large" color="#1565c0" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ✅ Default export wraps everything in AuthProvider
export default function App() {
  return (
    <AuthProvider>
      <RootApp />
    </AuthProvider>
  );
}
