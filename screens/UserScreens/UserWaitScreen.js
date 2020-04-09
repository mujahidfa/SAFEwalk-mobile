import React, { useEffect, useContext } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  AsyncStorage, StyleSheet,
} from "react-native";
import LottieView from 'lottie-react-native';
import io from "socket.io-client";
import colors from "./../../constants/colors";
import socket from "./../../contexts/socket";
import { AuthContext } from "./../../contexts/AuthProvider";
import {useFocusEffect} from "@react-navigation/core";
let timeoutFunc = null;
let timeOut = false;

// TODO: Get rid of the header and drawer access
export default function UserHomeScreen({ navigation }) {
  const { userToken, email } = useContext(AuthContext);

  useEffect(() => {
    // Set timeout to 30 seconds
    timeoutFunc = setTimeout(() => {
      timeOut = true;
      cancelRequest().then();
      navigation.reset({
        index: 0,
        routes: [
          {
            name: "UserHome"
          }
        ]
      });
    }, 30000);

    // socket to listen to walker status change
    socket.on("walker walk status", status => {
      console.log(status);

      switch (status) {
        case -1:
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserHome"
              }
            ]
          });
          alert("Your request was denied.");
          break;
        case 1:
          navigation.reset({
            index: 0,
            routes: [
              {
                name: "UserTab"
              }
            ]
          });
          alert("A SAFEwalker is on their way!");
          break;
      }
    });
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
    const id = await AsyncStorage.getItem("walkId");
    // DeleteWalk API call
    const res = await fetch(
      "https://safewalkapplication.azurewebsites.net/api/Walks/" + id,
      {
        method: "DELETE",
        headers: {
          token: userToken,
          email: email,
          isUser: true
        }
      }
    );
    let status = res.status;
    if (status !== 200 && status !== 201) {
      console.log("delete walk failed: status " + status);

    }

    // send notification to all Safewalkers
    socket.emit("walk status", true);

    // remove walk-related info
    await AsyncStorage.removeItem("WalkId");

    navigation.reset({
      index: 0,
      routes: [
        {
          name: "UserHome"
        }
      ]
    });
    if(timeOut) {
      timeOut = false;
      alert("Your request was timed out.");
    }
    else {
      alert("Request Canceled");
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
            marginTop: 60
          }}
        >
          Searching for {"\n"} SAFEwalker...
        </Text>
        <LottieView
          source={require('./../../assets/17709-loading')}
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
  )
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