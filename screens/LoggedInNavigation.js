import React, { useContext } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import DrawerContent from "./../components/DrawerContent";

import UserStackNavigation from "./UserScreens/UserStackNavigation";
import SafewalkerStackNavigation from "./SafewalkerScreens/SafewalkerStackNavigation";
import EditProfileScreen from "./SharedScreens/EditProfileScreen";
import LoginSettingsScreen from "./SharedScreens/LoginSettingsScreen";

import { AuthContext } from "./../contexts/AuthProvider";

const Drawer = createDrawerNavigator();

export default function LoggedInNavigation() {
  const { userType } = useContext(AuthContext);

  return (
    <Drawer.Navigator drawerContent={props => <DrawerContent {...props} />}>
      {/* 
        Switch between user type (user or safewalker).
        If user or safewalker logs in, direct them to their associated screens.
      */}
      {userType === "user" && (
        <Drawer.Screen
          name="UserHome"
          component={UserStackNavigation}
          options={{ title: "User Home" }}
        />
      )}
      {userType === "safewalker" && (
        <Drawer.Screen
          name="SafewalkerHome"
          component={SafewalkerStackNavigation}
          options={{ title: "Safewalker Home" }}
        />
      )}
      <Drawer.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: "Edit Profile" }}
      />
      <Drawer.Screen
        name="LoginSettings"
        component={LoginSettingsScreen}
        options={{ title: "Login Settings" }}
      />
    </Drawer.Navigator>
  );
}
