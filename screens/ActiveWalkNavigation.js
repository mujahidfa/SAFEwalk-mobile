import React, { useContext } from "react";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";

import colors from "./../constants/colors";

// Map screens
import UserMapScreen from "./UserScreens/UserMapScreen";
import SafewalkerMapScreen from "./SafewalkerScreens/SafewalkerMapScreen";

// Profile screens
import SafewalkerProfileScreen from "./UserScreens/SafewalkerProfileScreen";
import UserProfileScreen from "./SafewalkerScreens/UserProfileScreen";

// Navigators
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Context
import { AuthContext } from "../contexts/AuthProvider";

// Entry point for the Active Walk Navigation
export default function ActiveWalkNavigation() {
  const { userType, signout } = useContext(AuthContext);

  return (
    <>
      {/* If it is a user, navigate to user's navigation. Else, go to safewalker's navigation */}
      {userType === "user" ? (
        <UserActiveWalkNavigation />
      ) : userType === "safewalker" ? (
        <SafewalkerActiveWalkNavigation />
      ) : (
        <View>
          {/* If userType is neither "user" nor "safewalker", there's something wrong */}
          <Text>
            userType is neither "user" nor "safewalker" in
            ActiveWalkNavigation.js. Please sign out.
          </Text>
          <Button title="Sign out" onPress={signout()} />
        </View>
      )}
    </>
  );
}

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
