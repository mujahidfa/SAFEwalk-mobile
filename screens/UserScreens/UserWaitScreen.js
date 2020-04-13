import React, { useState, useEffect, useContext, useRef } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import LottieView from "lottie-react-native";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserHomeScreen({ navigation }) {
  const [isTimeout, setIsTimeout] = useState(false);

  // Use a ref to access the current value in an async callback
  const isTimeoutRef = useRef(isTimeout);
  isTimeoutRef.current = isTimeout;

  const { userToken, email } = useContext(AuthContext);
  const { setWalkAsActive, walkId, resetWalkContextState } = useContext(
    WalkContext
  );

  /**
   * This effect sets up the socket connection to the SAFEwalker to listen to walk request responses.
   * This effect is run once upon component mount.
   */
  useEffect(() => {
    console.log("in useEffect socket of UserWaitScreen");
    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      console.log("walk status in UserWaitScreen:" + status);

      switch (status) {
        // Request rejected by SAFEwalker
        case -1:
          // Reset walk info in context.
          resetWalkContextState();
          // Then, go back to home screen. Keep this.
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome",
              },
            ],
          });
          alert("Your request was denied.");
          break;

        // Request accepted by SAFEwalker
        case 1:
          setWalkAsActive();
          alert("A SAFEwalker is on their way!");
          break;

        default:
          console.log(
            "Unexpected socket status received in UserWaitScreen: status " +
              status
          );
      }
    });

    // socket cleanup
    return () => {
      socket.off("walker walk status", null);
    };
  }, []);

  /**
   * This effect sets up a timeout of 30 seconds before cancelling a walk request.
   *
   * This effect is only run every time a new request was made.
   */
  useEffect(() => {
    // cancel request after 30 seconds
    let timeoutFunc = setTimeout(() => {
      setIsTimeout(true);

      // after 30 seconds, cancel the current request
      cancelRequest();
    }, 30000);

    // timeout cleanup
    return () => {
      clearTimeout(timeoutFunc);
    };

    /**
     * walkId is used as 2nd argument to tell the effect
     * to run only when there's a new walkId value.
     * This allows the effect to run every time a new request was made.
     */
  }, [walkId /*,isTimeout*/]);

  /**
   * Delete the requested walk in the database using a DELETE request to the API.
   * If successful,
   *  - we emit a message to the SAFEwalker that walk has been cancelled,
   *  - we remove all walk data from Context, and
   *  - we navigate back to home screen.
   */
  async function cancelRequest() {
    try {
      // Delete Walk API call
      // Delete the requested walk in the database
      const res = await fetch(url + "/api/Walks/" + walkId, {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: true,
        },
      });
      let status = res.status;

      // Upon fetch failure/bad status
      if (status !== 200 && status !== 201) {
        console.log(
          "deleting requested walk failed in cancelRequest() in UserWaitScreen: status " +
            status
        );
        return;
      }

      // Upon fetch success
      else {
        // send notification to all Safewalkers that the walk request is cancelled
        socket.emit("walk status", true);

        // reset all walk state
        resetWalkContextState();

        // keep this
        navigation.reset({
          index: 0,
          routes: [
            {
              name: "UserHome",
            },
          ],
        });

        // Show different alerts according to whether
        // the user cancels the walk or 30 seconds has passed
        if (isTimeoutRef.current === true) {
          setIsTimeout(false);
          alert("Your request was timed out.");
        } else {
          alert("Request canceled.");
        }
      }
    } catch (error) {
      console.error(
        "Error in cancelling walk from cancelRequest() in UserWaitScreen:" +
          error
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* View when the User submits a SAFEwalk request */}
      <View style={{ flex: 3 }}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 30,
            color: colors.orange,
            fontWeight: "bold",
            marginTop: 60,
          }}
        >
          Searching for {"\n"} SAFEwalker...
        </Text>
        <LottieView
          source={require("./../../assets/17709-loading")}
          speed={1}
          autoPlay={true}
          loop
          autoSize={true}
        />
      </View>
      <View style={{ flex: 1 }}>
        <TouchableOpacity onPress={() => cancelRequest()}>
          <Text style={styles.buttonCancel}> Cancel </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: "center",
  },
  buttonCancel: {
    backgroundColor: colors.red,
    borderColor: colors.white,
    borderWidth: 1,
    borderRadius: 25,
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    overflow: "hidden",
    padding: 12,
    textAlign: "center",
    width: 200,
  },
});
