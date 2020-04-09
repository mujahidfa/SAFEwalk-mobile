import React, { useEffect, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import socket from "../../contexts/socket";

import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserMapScreen({ navigation }) {
  const { resetWalkContextState } = useContext(WalkContext);

  useEffect(() => {
    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      switch (status) {
        case -2:
          // reset walk state to change navigation
          resetWalkContextState();
          // navigation.reset({
          //   index: 0,
          //   routes: [
          //     {
          //       name: "UserHome",
          //     },
          //   ],
          // });
          alert("The SAFEwalker has canceled the walk.");
          break;
        case 2:
          resetWalkContextState();
          // navigation.reset({
          //   index: 0,
          //   routes: [
          //     {
          //       name: "UserHome",
          //     },
          //   ],
          // });
          alert("The walk has been completed!");
          break;
      }
    });

    return () => socket.off("walker walk status", null);
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
