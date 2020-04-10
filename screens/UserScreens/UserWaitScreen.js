import React, { useEffect, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  AsyncStorage,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "@react-navigation/core";
import LottieView from "lottie-react-native";
import io from "socket.io-client";

// Constants
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import url from "./../../constants/api";

// Contexts
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";

export default function UserHomeScreen({ navigation }) {
  const { userToken, email } = useContext(AuthContext);
  const {
    setWalkAsActive,
    walkId,
    removeWalkId,
    resetWalkContextState,
  } = useContext(WalkContext);

  let timeoutFunc = null;
  let timeOut = false;

  useEffect(() => {
    // cancel request after 30 seconds
    timeoutFunc = setTimeout(() => {
      timeOut = true;

      // after 30 seconds, cancel the current request
      cancelRequest();
    }, 30000);

    // timeout cleanup
    return () => {
      clearTimeout(timeoutFunc);
    };
  }, [walkId]);

  useEffect(() => {
    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      console.log("walk status in UserWaitScreen:" + status);

      switch (status) {
        case -1: // Request rejected by SAFEwalker
          // Reset walk info in context. Then, go back to home screen
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
          alert("Your request was denied.");
          break;

        case 1: // Request accepted by SAFEwalker
          setWalkAsActive();
          alert("A SAFEwalker is on their way!");
          break;
      }
    });

    // socket cleanup
    return () => {
      socket.off("walker walk status", null);
    };
  }, []);

  // Do something when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      // clears out timer once component is unloaded
      return () => {
        clearTimeout(timeoutFunc);
      };
    }, [])
  );

  async function cancelRequest() {
    // DeleteWalk API call
    const res = await fetch(url + "/api/Walks/" + walkId, {
      method: "DELETE",
      headers: {
        token: userToken,
        email: email,
        isUser: true,
      },
    });
    let status = res.status;
    if (status !== 200 && status !== 201) {
      console.log("UserWait: delete walk failed: status " + status);
    }

    // send notification to all Safewalkers
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

    // show different alerts according to whether
    // the user cancels the walk or 30 seconds has passed
    if (timeOut === true) {
      timeOut = false;
      alert("Your request was timed out.");
    } else {
      alert("Request canceled.");
    }
  }

  return (
    <View style={styles.container}>
      {/* View When the User Submits a SAFEwalk Request */}
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
