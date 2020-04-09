import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";

import InactiveWalkNavigation from "./InactiveWalkNavigation";
import ActiveWalkNavigation from "./ActiveWalkNavigation";
// import { createDrawerNavigator } from "@react-navigation/drawer";

// import DrawerContent from "./../components/DrawerContent";

// import UserStackNavigation from "./UserScreens/UserStackNavigation";
// import EditProfileNavigation from "./EditProfileNavigation";
// import LoginSettingsNavigation from "./LoginSettingsNavigation";
// import SafewalkerStackNavigation from "./SafewalkerScreens/SafewalkerStackNavigation";

// import { AuthContext } from "./../contexts/AuthProvider";
import { WalkContext } from "./../contexts/WalkProvider";

// const Drawer = createDrawerNavigator();

export default function LoggedInNavigation() {
  // const { userType } = useContext(AuthContext);
  const { isWalkActive } = useContext(WalkContext);

  return (
    <>
      {isWalkActive === "false" ? (
        <InactiveWalkNavigation />
      ) : isWalkActive === "true" ? (
        <ActiveWalkNavigation />
      ) : (
        <View>
          {/* If isWalkActive is neither "true" nor "fals", there's something wrong */}
          <Text>
            isWalkActive is neither "true" nor "false" in LoggedInNavigation.js.
            Please sign out.
          </Text>
          <Button title="Sign out" onPress={signout()} />
        </View>
      )}
    </>
    // <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
    //   {/*
    //     Switch between user type (user or safewalker).
    //     If user or safewalker logs in, direct them to their associated screens.
    //   */}
    //   {userType === "user" && (
    //     <Drawer.Screen
    //       name="UserHome"
    //       component={UserStackNavigation}
    //       options={{ title: "Home" }}
    //     />
    //   )}
    //   {userType === "safewalker" && (
    //     <Drawer.Screen
    //       name="SafewalkerHome"
    //       component={SafewalkerStackNavigation}
    //       options={{ title: "Safewalker Home" }}
    //     />
    //   )}
    //   <Drawer.Screen
    //     name="EditProfile"
    //     component={EditProfileNavigation}
    //     options={{ title: "Edit Profile" }}
    //   />
    //   <Drawer.Screen
    //     name="LoginSettings"
    //     component={LoginSettingsNavigation}
    //     options={{ title: "Login Settings" }}
    //   />
    // </Drawer.Navigator>
  );
}
