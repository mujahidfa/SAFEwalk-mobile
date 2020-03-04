import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import PersonalInfoScreen from "./PersonalInfoScreen";
import CredentialsScreen from "./CredentialsScreen";
import SuccessScreen from "./SuccessScreen";

const Stack = createStackNavigator();

export default function SignupStackNavigation() {
  return (
    <Stack.Navigator initialRouteName="Credentials">
      <Stack.Screen
        name="Credentials"
        component={CredentialsScreen}
        options={{ title: "Sign up 1: Credentials" }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ title: "Sign up 2: Personal info" }}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{ title: "Sign up 3: Success" }}
      />
    </Stack.Navigator>
  );
}
