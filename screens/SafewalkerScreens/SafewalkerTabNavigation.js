import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { MaterialIcons, AntDesign } from "@expo/vector-icons";

import colors from "./../../constants/colors";

import MapScreen from "./MapScreen";
import UserProfileScreen from "./UserProfileScreen";

const Tab = createBottomTabNavigator();

export default function SafewalkerTabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="UserProfile"
      tabBarOptions={{
        activeTintColor: colors.orange
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarLabel: "Map",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="directions" size={size} color={color} />
          )
        }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{
          tabBarLabel: "User profile",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
