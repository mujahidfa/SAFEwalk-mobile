import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import SafewalkerHomeScreen from "./SafewalkerHomeScreen";
import SafewalkerTabNavigation from "./SafewalkerTabNavigation";

const Stack = createStackNavigator();

export default function SafewalkerStackNavigation() {
  return (
    <Stack.Navigator initialRouteName="SafewalkerHome">
      <Stack.Screen
        name="SafewalkerHome"
        component={SafewalkerHomeScreen}
        options={{ title: "SAFEwalker Home" }}
      />
      <Stack.Screen
        name="SafewalkerTab"
        component={SafewalkerTabNavigation}
        options={{ title: "Safewalker Current Walk" }}
      />
    </Stack.Navigator>
  );
}
