import React, { useEffect, useContext } from "react";
import {
  ActivityIndicator,
  AsyncStorage,
  View,
  Text,
  Button,
} from "react-native";

// Navigation
import InactiveWalkNavigation from "./InactiveWalkNavigation";
import ActiveWalkNavigation from "./ActiveWalkNavigation";

// Constants
import url from "./../constants/api";

// Contexts
import { AuthContext } from "./../contexts/AuthProvider";
import { WalkContext } from "./../contexts/WalkProvider";

export default function LoggedInNavigation() {
  const { userType, email, userToken, signout } = useContext(AuthContext);
  const {
    isWalkLoading,
    isWalkActive,
    dispatch,
    resetWalkContextState,
  } = useContext(WalkContext);

  // This effect checks whether there's an active walk,
  // then restores the Walk states to the WalkContext store.
  // - If there's an active walk, navigate to ActiveWalk Navigation.
  // - Else, navigate to InactiveWalk Navigation.
  useEffect(() => {
    async function checkForWalkStatus() {
      let isWalkActive;
      let walkId;

      try {
        isWalkActive = await AsyncStorage.getItem("isWalkActive");
        walkId = await AsyncStorage.getItem("walkId");

        // if walkId and isWalkActive was stored in async storage
        if (walkId !== null && isWalkActive !== null) {
          // If there was no walk active, reset the state
          if (isWalkActive === "false") {
            // this will change the navigation to InactiveWalk screens
            resetWalkContextState();

            return;
          }
          // if there was an active walk, check in the database if that walk is still active
          else if (isWalkActive === "true") {
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
                "get walk status in LoggedInNavigation failed: status " + status
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
              let walkerSocketId = await AsyncStorage.getItem("walkerSocketId");

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
          }

          console.log("if (walkId !== null && isWalkActive !== null)");
        }
        // if walkId and isWalkActive could not be found in async storage, reset the state
        else {
          // this will change the navigation to InactiveWalk screens
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
    return <ActivityIndicator size="large" color="#00ff00" />;
  }

  return (
    <>
      {/* Check what state did the user left the app at, and retrieve that back */}
      {isWalkActive === "false" ? (
        <InactiveWalkNavigation />
      ) : isWalkActive === "true" ? (
        <ActiveWalkNavigation />
      ) : (
        <InactiveWalkNavigation />
      )}
    </>
  );
}
