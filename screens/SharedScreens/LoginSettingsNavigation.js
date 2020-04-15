import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Header from "../../components/Header";
import LoginSettingsScreen from "./LoginSettingsScreen";

const Stack = createStackNavigator();

/**
 * Wrapper to the LoginSettingsScreen.
 *
 * This wrapper is to ease header naming/customaization
 * as editing the header straight from the Drawer navigation is tedious
 * and not straightforward.
 */
export default function LoginSettingsNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="LoginSettings"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <Stack.Screen
        name="LoginSettings"
        component={LoginSettingsScreen}
        options={{ title: "Login Settings" }}
      />
    </Stack.Navigator>
  );
}
