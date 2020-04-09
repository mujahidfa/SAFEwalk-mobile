import React, { useEffect, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  AsyncStorage,
  StyleSheet,
} from "react-native";
import LottieView from "lottie-react-native";
import io from "socket.io-client";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";
import { WalkContext } from "./../../contexts/WalkProvider";
import { useFocusEffect } from "@react-navigation/core";

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

      // add await and remove then()
      cancelRequest();
      // navigation.reset({
      //   index: 0,
      //   routes: [
      //     {
      //       name: "UserHome",
      //     },
      //   ],
      // });
    }, 30000);
    // socket.open();
    // socket to listen to walker status change
    socket.on("walker walk status", (status) => {
      console.log("walk status in UserWaitScreen:" + status);

      switch (status) {
        case -1: // Request rejected by SAFEwalker
          // Reset walk info in context. Then, go back to home screen
          resetWalkContextState();
          // removeWalkId();
          alert("Your request was denied.");
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome",
              },
            ],
          });

          break;
        case 1: // Request accepted by SAFEwalker
          // set isActiveWalk = true
          // don't use navigation.reset cos the boolean in LoggedIn will auto change the router to the UserTab
          setWalkAsActive();
          // navigation.reset({
          //   index: 0,
          //   routes: [
          //     {
          //       name: "UserTab",
          //     },
          //   ],
          // });
          alert("A SAFEwalker is on their way!");
          break;
      }
    });

    return () => {
      socket.off("walker walk status", null);
      clearTimeout(timeoutFunc);
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      // Do something when the screen is focused

      return () => {
        // clears out timer once component is unloaded
        clearTimeout(timeoutFunc);
        console.log("timeout cleared!");
      };
    }, [])
  );

  async function cancelRequest() {
    // change to const {walkId}= useContext(WalkContext);
    // const id = await AsyncStorage.getItem("walkId");

    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + walkId,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: true,
        },
      }
    );
    let status = res.status;
    if (status !== 200 && status !== 201) {
      console.log("delete walk failed: status " + status);
    }

    // send notification to all Safewalkers
    socket.emit("walk status", true);

    // change to const {cancelPendingWalk}= useContext(WalkContext);
    // remove walk-related info
    // await AsyncStorage.removeItem("WalkId");
    removeWalkId();
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
