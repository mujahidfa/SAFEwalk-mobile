import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import UserHomeScreen from "./UserHomeScreen";
import UserWaitScreen from "./UserWaitScreen";

import Header from "../../components/Header";

const Stack = createStackNavigator();

export default function UserStackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="UserHome"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <Stack.Screen
        name="UserHome"
        component={UserHomeScreen}
        options={{ title: "Home" }}
      />
      <Stack.Screen
        name="UserWait"
        component={UserWaitScreen}
        options={{ title: "Waiting for SAFEwalker", headerShown: false }}
      />
    </Stack.Navigator>
  );
}
