import React, { useEffect, useState, useContext } from "react";
import { StyleSheet, Text, View } from "react-native";

// Custom components
import Button from "./../../components/Button";
import Spacer from "./../../components/Spacer";

// Constants
import colors from "../../constants/colors";
import socket from "../../contexts/socket";
import url from "./../../constants/api";
import style from "./../../constants/style";

// Contexts
import { AuthContext } from "../../contexts/AuthProvider";
import { WalkContext } from "../../contexts/WalkProvider";

export default function MapScreen({ navigation }) {
  const [isLoading, setIsLoading] = useState(false);
  const { userToken, email } = useContext(AuthContext);
  const { walkId, userSocketId, resetWalkContextState } = useContext(
    WalkContext
  );

  // /**
  //  * This effect sets up the socket connection to the User.
  //  * This effect is run once upon component mount.
  //  */
  useEffect(() => {
    socket.removeAllListeners();
    
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

    socket.on("connection lost", (status) => {
      if (status) {
        alert("Connection Lost");
        // TODO: button to cancel walk, call cancelWalk()
      }
    });

    // socket cleanup
    return () => {
      socket.off("user walk status", null);
      socket.off("connection lost", null);
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
      })
    }).catch((error) => {
      console.error(
        "Error in PUT walk request in completeWalk() in SafewalkerHomeScreen:" +
        error
      )
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status != 200 && status != 201) {
      console.log(
        "complete walk in completeWalk() in SafewalkerMapScreen failed: status " +
        status
      );
      return; //exit
    }

    // Upon fetch success
    if (userSocketId != null) {
      // Let user know walk has been completed
      socket.emit("walker walk status", {
        userId: userSocketId,
        status: 2,
      });
    }

    // walk is done, so wereset the walk state and return to InactiveWalk screens.
    resetWalkContextState();
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <Text>SAFEwalker Map Screen</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Mark walk as complete"
            loading={isLoading}
            disabled={isLoading}
            onPress={() => completeWalk()}
          />
        </View>
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
  },
  innerContainer: {
    flex: 1,
    marginHorizontal: style.marginContainerHorizontal,
  },
  buttonContainer: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: style.marginContainerHorizontal,
  },
});
