import React, { useContext } from "react";

// Navigation
import InactiveWalkNavigation from "./InactiveWalkNavigation";
import ActiveWalkNavigation from "./ActiveWalkNavigation";

// Contexts
import { WalkContext } from "./../contexts/WalkProvider";

export default function LoggedInNavigation() {
  const { isWalkActive } = useContext(WalkContext);

  return (
    <>
      {/* Check what state did the user left the app at, and retrieve that back */}
      {isWalkActive === "false" ? (
        <InactiveWalkNavigation />
      ) : isWalkActive === "true" ? (
        <ActiveWalkNavigation />
      ) : (
        <View>
          {/* If isWalkActive is neither "true" nor "false", there's something wrong */}
          <Text>
            isWalkActive is neither "true" nor "false" in LoggedInNavigation.js.
            Please sign out.
          </Text>
          <Button title="Sign out" onPress={signout()} />
        </View>
      )}
    </>
  );
}
