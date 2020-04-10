import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-elements";

// Constants
import colors from "../../constants/colors";
import socket from "../../contexts/socket";
import url from "./../../constants/api";

// Contexts
import { AuthContext } from "../../contexts/AuthProvider";
import { WalkContext } from "../../contexts/WalkProvider";

export default function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, email } = useContext(AuthContext);
  const { walkId, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  /**
   * This effect sets up the socket connection to the User.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    // socket to listen to user status change
    socket.on("user walk status", (status) => {
      console.log("user walk status in SWMapScreen:" + status);

      switch (status) {
        // User cancelled the walk
        case -2:
          // walk has ended, we reset the walk state and return to InactiveWalk screens
          resetWalkContextState();
          alert("The SAFEwalker canceled the walk.");
          break;

        default:
          console.log(
            "Unexpected socket status received in SafewalkerMapScreen: status " +
              status
          );
      }
    });

    // socket cleanup
    return () => {
      socket.off("user walk status", null);
    };
  }, []);

  /**
   * Upon complete button press, update the current walk status in the database as completed
   * If successful,
   *  - we emit a message to the User that walk has been completed,
   *  - we remove all walk data from Context, and
   *  - we navigate back to home screen.
   */
  async function completeWalk() {
    try {
      // Put Walk API call
      // Update walk status in database as completed
      const res = await fetch(url + "/api/Walks/" + walkId, {
        method: "PUT",
        headers: {
          token: userToken,
          email: email,
          isUser: false,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: 2,
        }),
      });

      let status = res.status;

      // Upon fetch failure/bad status
      if (status != 200 && status != 201) {
        console.log(
          "complete walk in completeWalk() in SafewalkerMapScreen failed: status " +
            status
        );
        return;
      }

      // Upon fetch success
      else {
        if (userSocketId) {
          // Let user know walk has been completed
          socket.emit("walker walk status", {
            userId: userSocketId,
            status: 2,
          });
        }
        // walk is done, so wereset the walk state and return to InactiveWalk screens.
        resetWalkContextState();
      }
    } catch (error) {
      console.error(
        "Error in completing walk data in completeWalk() in SafewalkerMapScreen:" +
          error
      );
    }
  }

  return (
    <View style={styles.container}>
      <Text>SAFEwalker Map Screen</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="SAFEwalk Completed"
          loading={isLoading}
          disabled={isLoading}
          onPress={() => completeWalk()}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "stretch",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 40,
  },
  button: {
    height: 60,
    borderRadius: 50,
    backgroundColor: "#77b01a",
  },
  buttonText: {
    fontSize: 20,
  },
});
