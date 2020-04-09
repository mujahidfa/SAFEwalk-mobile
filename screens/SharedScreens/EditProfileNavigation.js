import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import Header from "../../components/Header";
import EditProfileScreen from "./EditProfileScreen";

const Stack = createStackNavigator();

export default function EditProfileNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="EditProfile"
      headerMode="screen"
      screenOptions={{
        header: ({ scene, previous, navigation }) => (
          <Header scene={scene} previous={previous} navigation={navigation} />
        ),
      }}
    >
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
    </Stack.Navigator>
  );
}
