import React, { useContext } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

import colors from "./../constants/colors";

// Map screens
import UserMapScreen from "./UserScreens/UserMapScreen";
import SafewalkerMapScreen from "./SafewalkerScreens/SafewalkerMapScreen";

// Profile screens
import SafewalkerProfileScreen from "./UserScreens/SafewalkerProfileScreen";
import UserProfileScreen from "./SafewalkerScreens/UserProfileScreen";

// Other screens
import WalkErrorScreen from "./SharedScreens/WalkErrorScreen";

// Navigators
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Contexts
import { AuthContext } from "../contexts/AuthProvider";

// Entry point for the Active Walk Navigation.
// Checks for user type (User or Safewalker) to determine appropriate navigation.
export default function ActiveWalkNavigation() {
  const { userType } = useContext(AuthContext);

  return (
    <>
      {/* If it is a user, navigate to user's navigation. Else, go to safewalker's navigation */}
      {userType === "user" ? (
        <UserActiveWalkNavigation />
      ) : userType === "safewalker" ? (
        <SafewalkerActiveWalkNavigation />
      ) : (
        // If userType is neither "user" nor "safewalker", there's something wrong
        <WalkErrorScreen />
      )}
    </>
  );
}

// Wrapper to the actual User navigation.
// The reason to wrap the Tabs nav with a parent Stack nav is to allow auto-named headers
function UserActiveWalkNavigation() {
  return (
    <Stack.Navigator initialRouteName="CurrentWalk" headerMode="screen">
      <Stack.Screen
        name="CurrentWalk"
        component={UserActiveWalkTabNav}
        options={{ title: "Current Walk" }}
      />
    </Stack.Navigator>
  );
}

// The actual navigation for user view on an active walk
function UserActiveWalkTabNav() {
  return (
    <Tab.Navigator
      initialRouteName="SafewalkerProfile"
      tabBarOptions={{
        activeTintColor: colors.orange,
      }}
    >
      <Tab.Screen
        name="Map"
        component={UserMapScreen}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="SafewalkerProfile"
        component={SafewalkerProfileScreen}
        options={{
          tabBarLabel: "SAFEwalker profile",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Wrapper to the actual SAFEwalker navigation
// The reason to wrap the Tabs nav with a parent Stack nav is to allow auto-named headers
function SafewalkerActiveWalkNavigation() {
  return (
    <Stack.Navigator initialRouteName="CurrentWalk" headerMode="screen">
      <Stack.Screen
        name="CurrentWalk"
        component={SafewalkerActiveWalkTabNav}
        options={{ title: "Current Walk" }}
      />
    </Stack.Navigator>
  );
}

// The actual navigation for SAFEwalker view on an active walk
function SafewalkerActiveWalkTabNav() {
  return (
    <Tab.Navigator
      initialRouteName="UserProfile"
      tabBarOptions={{
        activeTintColor: colors.orange,
      }}
    >
      <Tab.Screen
        name="Map"
        component={SafewalkerMapScreen}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: "User profile",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
