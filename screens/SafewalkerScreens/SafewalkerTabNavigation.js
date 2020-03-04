import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import MapScreen from "./MapScreen";
import UserProfileScreen from "./UserProfileScreen";

const Tab = createBottomTabNavigator();

export default function SafewalkerTabNavigation() {
  return (
    <Tab.Navigator initialRouteName="Map">
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{ title: "SAFEwalker Map" }}
      />
      <Tab.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: "User Profile" }}
      />
    </Tab.Navigator>
  );
}
