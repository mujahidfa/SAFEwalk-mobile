import React from "react";
import {
  createStackNavigator,
  CardStyleInterpolators,
} from "@react-navigation/stack";

import PersonalInfoScreen from "./PersonalInfoScreen";
import CredentialsScreen from "./CredentialsScreen";
import SuccessScreen from "./SuccessScreen";

import colors from "./../../../constants/colors";

const Stack = createStackNavigator();

export default function SignupStackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="Credentials"
      screenOptions={{
        // left-to-right transition: standard iOS-style slide in from the right
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
      }}
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.lightorange,
        },
        headerTintColor: "#fff",
        headerTitleAlign: "center",
      }}
    >
      <Stack.Screen
        name="Credentials"
        component={CredentialsScreen}
        options={{ title: "Sign up" }}
      />
      <Stack.Screen
        name="PersonalInfo"
        component={PersonalInfoScreen}
        options={{ title: "Sign up" }}
      />
      <Stack.Screen
        name="Success"
        component={SuccessScreen}
        options={{ title: "Sign up" }}
      />
    </Stack.Navigator>
  );
}
