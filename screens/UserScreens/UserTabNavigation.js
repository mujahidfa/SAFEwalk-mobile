import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MapScreen from "./MapScreen";
import SafewalkerProfileScreen from "./SafewalkerProfileScreen";

const Tab = createBottomTabNavigator();

export default function UserTabNavigation() {
  return (
    <Tab.Navigator initialRouteName="Map">
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "User Map" }}
      />
      <Tab.Screen
        name="SafewalkerProfile"
        component={SafewalkerProfileScreen}
        options={{ title: "Safewalker Profile" }}
      />
    </Tab.Navigator>
  );
}
