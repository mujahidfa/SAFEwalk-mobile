import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import UserLoginScreen from "./AuthScreens/LoginScreens/UserLoginScreen";
import SafewalkerLoginScreen from "./AuthScreens/LoginScreens/SafewalkerLoginScreen";
import SignupStackNavigation from "./AuthScreens/SignupScreens/SignupStackNavigation";

const Stack = createStackNavigator();

export default function LoggedOutNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="UserLogin"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="UserLogin"
        component={UserLoginScreen}
        options={{ title: "Login: User" }}
      />
      <Stack.Screen
        name="SafewalkerLogin"
        component={SafewalkerLoginScreen}
        options={{ title: "Login: SAFEwalker" }}
      />
      <Stack.Screen name="SignupStack" component={SignupStackNavigation} />
    </Stack.Navigator>
  );
}
