import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { MaterialIcons, AntDesign } from "@expo/vector-icons";

import colors from "./../../constants/colors";

import MapScreen from "./MapScreen";
import SafewalkerProfileScreen from "./SafewalkerProfileScreen";

const Tab = createBottomTabNavigator();

export default function UserTabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
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
        name="SafewalkerProfile"
        component={SafewalkerProfileScreen}
        options={{
          tabBarLabel: "SAFEwalker profile",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}
