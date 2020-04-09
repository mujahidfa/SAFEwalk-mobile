import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Header from "./../components/Header";
import LoginSettingsScreen from "./SharedScreens/LoginSettingsScreen";

const Stack = createStackNavigator();

export default function EditProfileNavigation() {
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
