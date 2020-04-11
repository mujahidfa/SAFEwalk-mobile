import React, { useEffect, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import socket from "../../contexts/socket";

import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserMapScreen({ navigation }) {
  const { resetWalkContextState } = useContext(WalkContext);

  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    socket.removeAllListeners();
    
    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      switch (status) {
        // SAFEwalker has canceled the walk
        case -2:
          // reset walk state to change navigation to InactiveWalk Screens
          resetWalkContextState();
          alert("The SAFEwalker has canceled the walk.");
          break;
        // walk has been marked as completed by the SAFEwalker
        case 2:
          resetWalkContextState();
          alert("The walk has been completed!");
          break;

        default:
          console.log(
            "Unexpected socket status received in UserMapScreen: status " +
              status
          );
      }
    });

    socket.on("connection lost", (status) => {
      if (status) {
        alert("Connection Lost");
        // TODO: button to cancel walk, call cancelWalk()
      }
    });

    // cleanup socket
    return () => {
      socket.off("walker walk status", null);
      socket.ogg("connection lost", null);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text>User Map Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
