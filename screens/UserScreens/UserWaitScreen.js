import React, { useState, useEffect, useContext, useRef } from "react";
import {
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import LottieView from "lottie-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  heightPercentageToDP as hp
} from "react-native-responsive-screen";

// Components
import Button from "./../../components/Button";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";
import style from "../../constants/style";

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
    socket.removeAllListeners();
    
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
  }, [walkId]);

  /**
   * Delete the requested walk in the database using a DELETE request to the API.
   * If successful,
   *  - we emit a message to the SAFEwalker that walk has been cancelled,
   *  - we remove all walk data from Context, and
   *  - we navigate back to home screen.
   */
  async function cancelRequest() {
    // Delete Walk API call
    // Delete the requested walk in the database
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "DELETE",
      headers: {
        token: userToken,
        email: email,
        isUser: true,
      },
    }).catch((error) => {
      console.error(
        "Error in DELETE walk from cancelRequest() in UserWaitScreen:" +
        error
      );
    });

    let status = res.status;
    // Upon fetch failure/bad status
    if (status !== 200 && status !== 201) {
      console.log(
        "deleting requested walk failed in cancelRequest() in UserWaitScreen: status " +
        status
      );
    }

    // send notification to all Safewalkers that the walk request is cancelled
    socket.emit("walk status", true);

    // reset all walk state
    resetWalkContextState();

    // navigate to user home screen
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

  return (
    <View style={styles.container}>
      {/* View when the User submits a SAFEwalk request */}
      <SafeAreaView style={styles.innerContainer}>
        {/* Waiting Animation */}
        <LottieView
          source={require("./../../assets/app-boot-loading")}
          speed={1}
          autoPlay={true}
          loop
          autoSize={true}
          style={{height: hp("35%")}}
        />

        {/* Informational Text to the User */}
        <Text style={styles.textHeader}>
          Waiting for SAFEwalker
        </Text>
        <Text style={styles.text}>
          {'\n'}Your request has been submitted and is pending approval by the next available SAFEwalker.
        </Text>

        {/* Button to Submit Request */}
        <View style={styles.buttonContainer}>
          <Button
              title="Cancel"
              onPress={() => cancelRequest()}
              color="red"
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    marginHorizontal: style.marginContainerHorizontal
  },
  textHeader: {
    textAlign: "center",
    fontSize: hp("3%"),
    color: "black",
    fontWeight: "bold",
  },
  text: {
    textAlign: "center",
    fontSize: style.fontSize,
    color: "black",
    fontWeight: "bold",
  },
  buttonContainer: {
    height: hp("17%"),
    justifyContent: "space-around",
  },
});
