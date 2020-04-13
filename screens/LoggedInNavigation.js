import React, { useEffect, useContext } from "react";
import { AsyncStorage } from "react-native";
import LoadingScreen from "./SharedScreens/LoadingScreen";

// Navigation
import InactiveWalkNavigation from "./InactiveWalkNavigation";
import ActiveWalkNavigation from "./ActiveWalkNavigation";

// Constants
import url from "./../constants/api";

// Contexts
import { AuthContext } from "./../contexts/AuthProvider";
import { WalkContext } from "./../contexts/WalkProvider";

export default function LoggedInNavigation() {
  const { userType, email, userToken } = useContext(AuthContext);
  const {
    isWalkLoading,
    isWalkActive,
    dispatch,
    resetWalkContextState,
  } = useContext(WalkContext);

  /**
   * This effect checks whether there's an active walk upon app boot (runs only once on app boot),
   * then restores the Walk states to the WalkContext store.
   *
   * If there's an active walk, navigate to ActiveWalk Navigation.
   * Else, navigate to InactiveWalk Navigation.
   */
  useEffect(() => {
    /**
     * Flow of this function explained:
     *    First, check if isWalkActive and walkId is available in AsyncStorage
     *    If not found, clear and reset all data in WalkContext and AsyncStorage, and navigate to InactiveWalk Screens.
     *    If found,
     *      Check the value of isWalkActive
     *      If isWalkActive is "false" or not "true", clear and reset all data in WalkContext and AsyncStorage, and navigate to InactiveWalk Screens.
     *      If isWalkActive is "true",
     *        Check in database to see if the walk is still active
     *        If active, restore state from AsyncStorage
     *        If not active, reset state and navigate to InactiveWalk screens
     *        If there's any errors, reset state and navigate to InactiveWalk screens
     */
    async function checkForWalkStatus() {
      try {
        let isWalkActive = await AsyncStorage.getItem("isWalkActive");
        let walkId = await AsyncStorage.getItem("walkId");

        // if walkId and isWalkActive are found in async storage
        if (walkId !== null && isWalkActive !== null) {
          // if walk is active, check in the database to see if that walk is still active
          if (isWalkActive === "true") {
            try {
              // Check what type of user (User or Safewalker)
              let isUser = true;
              if (userType === "safewalker") {
                isUser = false;
              }
              // Check if request is available and has been accepted
              const res = await fetch(url + "/api/Walks/" + walkId, {
                method: "GET",
                headers: {
                  token: userToken,
                  email: email,
                  isUser: isUser,
                },
              });
              let status = res.status;

              // If walk is not available, reset walk state
              if (status !== 200) {
                console.log(
                  "get walk status in LoggedInNavigation failed: status " +
                    status
                );

                // this will change the navigation to InactiveWalk screens
                resetWalkContextState();

                return;
              }
              // If walk is available and active, retrieve elements from set state to active walk
              else {
                let userEmail = await AsyncStorage.getItem("userEmail");
                let walkerEmail = await AsyncStorage.getItem("walkerEmail");
                let userSocketId = await AsyncStorage.getItem("userSocketId");
                let walkerSocketId = await AsyncStorage.getItem(
                  "walkerSocketId"
                );

                // This will switch to the InactiveWalk screen or ActiveWalk screen
                // and the loading screen will be unmounted and thrown away.
                dispatch({
                  type: "RESTORE_STATE",
                  isWalkActive: isWalkActive,
                  walkId: walkId,
                  userEmail: userEmail,
                  walkerEmail: walkerEmail,
                  userSocketId: userSocketId,
                  walkerSocketId: walkerSocketId,
                });

                return;
              }
            } catch (error) {
              // if for whatever reason an error occurs, reset state and go to InactiveWalk screens
              console.log(
                "Error in retrieving get walk status in LoggedInNavigation:" +
                  error
              );

              // this will change the navigation to InactiveWalk screens
              resetWalkContextState();
            }
          }
          // If walk is not active, reset the state
          else {
            // this will change the navigation to InactiveWalk screens
            resetWalkContextState();
            return;
          }
        }
        // if walkId and isWalkActive could not be found in async storage, reset the state
        else {
          // Clear all data in the WalkContext.
          resetWalkContextState();
          return;
        }
      } catch (error) {
        console.log(
          "Error in checking for walk status on first boot: " + error
        );
      }
    }

    checkForWalkStatus();
  }, []);

  if (isWalkLoading === true) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Navigate to appropriate screens according to walk status */}
      {isWalkActive === "true" ? (
        <ActiveWalkNavigation />
      ) : (
        <InactiveWalkNavigation />
      )}
    </>
  );
}
