import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import SafewalkerHomeScreen from "./SafewalkerHomeScreen";
import SafewalkerTabNavigation from "./SafewalkerTabNavigation";

import Header from "./../../components/Header";

const Stack = createStackNavigator();

export default function SafewalkerStackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="SafewalkerHome"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
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
