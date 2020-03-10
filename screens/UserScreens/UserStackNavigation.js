import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import UserHomeScreen from "./UserHomeScreen";
import UserTabNavigation from "./UserTabNavigation";

import Header from "./../../components/Header";

const Stack = createStackNavigator();

export default function UserStackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="UserHome"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        )
      }}
    >
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{ title: "User Home" }}
      />
      <Stack.Screen
        name="UserTab"
        component={UserTabNavigation}
        options={{ title: "User Current Walk" }}
      />
    </Stack.Navigator>
  );
}
