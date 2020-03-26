import React, { useEffect, useContext } from "react";
import { ActivityIndicator, AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import LoggedOutNavigation from "./screens/LoggedOutNavigation";
import LoggedInNavigation from "./screens/LoggedInNavigation";

import { AuthContext } from "./contexts/AuthProvider";

export default function Main() {
  const { isLoading, userToken, dispatch } = useContext(AuthContext);

  // This effect is run the first time the app boots.
  //
  // This effect checks whether a user has logged in before.
  // - If user has logged in, navigate to LoggedIn Navigation.
  // - Else (if user has not logged in), navigate to LoggedOut Navigation.
  useEffect(() => {
    async function prepareAppForFirstBoot() {
      let userToken;
      let userType; // user or safewalker
      let userEmail;

      try {
        // Check if a user is logged in or not
        userToken = await AsyncStorage.getItem("userToken");
        userType = await AsyncStorage.getItem("userType");
        userEmail = await AsyncStorage.getItem("userEmail");
      } catch (error) {
        console.log("Error in restoring user token: " + error);
      }

      // This will switch to the App screen or Auth screen and the loading
      // screen will be unmounted and thrown away.
      dispatch({
        type: "RESTORE_TOKEN",
        token: userToken,
        userType: userType,
        userEmail: userEmail
      });
    }

    prepareAppForFirstBoot();
  }, []);

  if (isLoading === true) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <NavigationContainer>
      {/* If user has logged in, navigate to LoggedIn Navigation. Else, LoggedOut Navigation. */}
      {userToken == null ? <LoggedOutNavigation /> : <LoggedInNavigation />}
    </NavigationContainer>
  );
}
