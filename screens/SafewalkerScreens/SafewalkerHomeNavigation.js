import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import SafewalkerHomeScreen from "./SafewalkerHomeScreen";

import Header from "../../components/Header";

const Stack = createStackNavigator();

/**
 * Wrapper to the SafewalkerHomeScreen.
 *
 * This wrapper is to ease header naming/customaization
 * as editing the header straight from the Drawer navigation is tedious
 * and not straightforward.
 */
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
        options={{ title: "Home" }}
      />
    </Stack.Navigator>
  );
}
