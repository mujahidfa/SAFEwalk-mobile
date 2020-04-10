import React, { useEffect, useContext } from "react";
import { AsyncStorage } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import LoadingScreen from "./screens/SharedScreens/LoadingScreen";

// Navigations
import LoggedOutNavigation from "./screens/LoggedOutNavigation";
import LoggedInNavigation from "./screens/LoggedInNavigation";

// Contexts
import { AuthContext } from "./contexts/AuthProvider";
import { WalkProvider } from "./contexts/WalkProvider";

export default function Main() {
  const { isLoading, userToken, dispatch } = useContext(AuthContext);

  /**
   * This effect checks whether a user has logged in before.
   *
   * It retrieves the user token from AsyncStorage.
   * If it's not null, then that means the user has logged in.
   *
   * If user has logged in, navigate to LoggedIn Navigation.
   * Else (if user has not logged in), navigate to LoggedOut Navigation.
   *
   * This effect is run once on the first time the app boots after an app close.
   */
  useEffect(() => {
    async function prepareAppForFirstBoot() {
      let userToken;
      let userType; // user or safewalker
      let email;

      try {
        // Check if a user is logged in or not
        userToken = await AsyncStorage.getItem("userToken");
        userType = await AsyncStorage.getItem("userType");
        email = await AsyncStorage.getItem("email");
      } catch (error) {
        console.error("Error in restoring user token: " + error);
      }

      /**
       * This will switch to the LoggedIn screen or LoggedOut screen
       * and the loading screen will be unmounted and thrown away.
       */
      dispatch({
        type: "RESTORE_TOKEN",
        token: userToken,
        userType: userType,
        email: email,
      });
    }

    prepareAppForFirstBoot();
  }, []);

  if (isLoading === true) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {/* If user has logged in, navigate to LoggedIn Navigation. Else, LoggedOut Navigation. */}
      {userToken == null ? (
        <LoggedOutNavigation />
      ) : (
        <WalkProvider>
          <LoggedInNavigation />
        </WalkProvider>
      )}
    </NavigationContainer>
  );
}
